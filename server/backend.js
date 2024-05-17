// app.js

const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
const { v4: uuidv4 } = require('uuid');

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const mongoose = require("mongoose");

const { getRandomRiddle } = require("./utils/riddleLoader");

// app.use(express.static("public"));

const gameRoomSchema = new mongoose.Schema(
  {
    players: [{ _id: String, hasAnswered: Boolean }],
    currentRiddle: { question: String, answer: String, options: [String] },
    scores: [Number],
    state: String,
  },
  { timestamps: true }
);

const GameRoom = mongoose.model("GameRoom", gameRoomSchema);
mongoose
  .connect(
    `mongodb+srv://sibtycodes:${process.env.PASSWORD}@cluster0.bo3u69t.mongodb.net/Multiplayer?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(async () => {
    // await GameRoom.deleteMany();
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Error connecting to MongoDB", err));

app.get("/", (re, res) => {
  res.sendStatus(200);
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("Connected", socket.id);
  socket.on("search_player", (userId) => {
    //`Passing userId to available room function
    findAvailableRoom(socket, userId);
  });

  socket.on("submit_answer", (answer, userId) => {
    handleAnswerSubmission(userId, answer);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
    handleDisconnect(socket);
  });
});

async function findAvailableRoom(socket, userId) {
  try {
    const rooms = await GameRoom.find({ state: "waiting" })
      .sort({ createdAt: 1 })
      .limit(1);

    console.log(rooms);
    let room;
    if (rooms.length === 0) {
      room = await GameRoom.create({
        players: [{ _id: userId, hasAnswered: false }],
        state: "waiting",
      });
      console.log(room, " \n\nRoom Created \n\n  ");
      socket.join(room._id.toString());
    } else {
      room = rooms[0];
      room.players.push({ _id: userId, hasAnswered: false });
      await room.save();

      socket.join(room._id.toString()); //socket roomId will be room._id from mongo db

      await startGame(room._id.toString());
    }
  } catch (error) {
    console.error(error);
  }
}

// Start game function
async function startGame(roomId) {
  try {
    const room = await GameRoom.findById(roomId);
    const initialRiddle = getRandomRiddle();

    room.currentRiddle = initialRiddle;
    room.state = "playing";
    room.scores = [0, 0]; //Array(room.players.length).fill(0); //[0,0]
    await room.save();

    io.to(roomId).emit("game_start", initialRiddle);
    startRiddleTimer(roomId);
  } catch (error) {
    console.error(error);
  }
}

// Handle answer submission function
async function handleAnswerSubmission(userId, answer) {
  try {
    // const room = await GameRoom.findById(roomId);
    // const room = await GameRoom.findOne({ "players.id": userId }).sort({ createdAt: -1 });
    const room = await GameRoom.findOne().sort({ createdAt: -1 });

    console.log({ room, players: room.players });

    const playerIndex = room.players.findIndex((p) => p._id == userId);

    console.log("\n\n", room, playerIndex, "Details ---- \n\n");

    room.players[playerIndex].hasAnswered = true; //`To confirm ans ssubmittion

    const isCorrect = answer == room.currentRiddle.answer;
    if (isCorrect) {
      room.scores[playerIndex] = room.scores[playerIndex] + 1;
    }
    console.log(
      "\n \n ---------- \n ",
      { isCorrect, answer, roomAns: room.currentRiddle.answer },
      "\n \n ---------- \n"
    );
    const uniqueId = uuidv4();
    let riddleResult_to_send = { playerId: userId, isCorrect,keyId:uniqueId };
    //?add a unique generated id for each result sent

    console.log(riddleResult_to_send);
    //?Result of each riddle should be emitted to clients in the room
    io.to(room._id.toString()).emit("answer_result", riddleResult_to_send);

    await room.save();

  } catch (error) {
    console.error(error);
  }
}

// Start riddle timer function
async function startRiddleTimer(roomId) {
  console.log("\n\n", "Timer Started \n\n");

  const totalRiddles = 9;
  const riddleTime = 10; // 10 seconds for now

  // Wait 10 seconds for the first riddle
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Emit new riddles at a fixed interval
  for (let i = 1; i <= totalRiddles; i++) {
    const newRiddle = getRandomRiddle();
    await GameRoom.findByIdAndUpdate(roomId, {
      currentRiddle: newRiddle,
    });

    let room = await GameRoom.findById(roomId);
    console.log("\n\n---------------------Finding room-------------------------- \n", room,"\n\n---------------------Finding room-------------------------- \n");

    // Check if all players have submitted an answer
    const allPlayersAnswered = room.players.every(
      (player) => player.hasAnswered
    );

    if (!allPlayersAnswered) {
      // Find the players who haven't answered
      const playersNotAnswered = room.players
        .filter((player) => !player.hasAnswered)
        .map((player) => {
          const uKeyId = uuidv4()
          return ({
            playerId: player._id,
            submissionStatus: false,
            keyId:uKeyId
          })
        });

      io.to(roomId).emit("players_not_answered", playersNotAnswered);
    }

    // Reset all players hasAnswered to false for next Riddle
    room.players.forEach((player) => (player.hasAnswered = false));
    console.log("\n\n---------------------Saving changes in room-------------------------- \n",room,"\n\n---------------------Saving changes in room-------------------------- \n")

    // *** Save the room after updating hasAnswered ***
    await room.save();

    io.to(roomId).emit("new_riddle", newRiddle);
    await new Promise((resolve) => setTimeout(resolve, 10 * 1000)); // Wait for riddle time
  }

  // Game finished after all riddles
  const room = await GameRoom.findById(roomId);
  room.state = "finished";
  await room.save();
  io.to(roomId).emit("game_over", calculateFinalScores(room));
}

// Calculate final scores function
function calculateFinalScores(room) {
  return room.players.map((player, index) => ({
    playerId: player._id,
    score: room.scores[index],
  }));
}

// Handle disconnect function
async function handleDisconnect(socket) {
  const rooms = Array.from(socket.rooms);
  if (rooms.length > 1) {
    // Player was in a game room
    const roomId = rooms[1];

    //change later cuz only one player left
    const room = await GameRoom.deleteOne(roomId);
    console.log("\n\n", room, "Room Deleted ");

    // io.to(roomId).emit("playerDisconnected", socket.id); //socket.id player is disconnected
    // Handle abandoned game logic
  }
}

// Server listening
server.listen(5000, () => {
  console.log("Server listening on port 5000");
});

// // Next riddle function
// function nextRiddle(roomId) {
//     const newRiddle = getRandomRiddle();

//     GameRoom.findByIdAndUpdate(roomId, {
//       currentRiddle: newRiddle.question,
//     }).then(() => {
//       io.to(roomId).emit("new_riddle", newRiddle);
//       startRiddleTimer(roomId);
//     });
//   }

//   // Should fetch next riddle function
//   function shouldFetchNextRiddle(room) {
//     return room.players.every((player) => player.hasAnswered);
//   }

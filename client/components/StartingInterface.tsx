'use client'
import { Jacquard_12_Charted, Micro_5_Charted, Poppins } from 'next/font/google'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import io from 'socket.io-client';

import swal from 'sweetalert2'


const font = Jacquard_12_Charted({ weight: "400", subsets: ['latin'] })
const font3 = Micro_5_Charted({ weight: "400", subsets: ['latin'] })
const fontP = Poppins({ weight: "400", subsets: ['latin'] })
interface Riddle {
    question: string;
    options: string[];
    answer?: string
}
type FinaLScoresArray = {
    playerId: string;
    score: Number
}[]

type AnswerRes = {
    playerId: string;
    isCorrect: boolean;
    keyId: string
}
type NotAnswered = {
    playerId: string,
    keyId:string,
    submissionStatus: boolean,
}
type Props = {
    uniqueId: string
}
interface Result {
    uniqueKey: string;
    ans: string;
}

interface ResultsState {
    yours: Result[];
    opponent: Result[];
}

function StartingInterface({ uniqueId }: Props) {

    const socket = io('http://localhost:5000');

    //`Saving the userId
    useEffect(() => {
        console.log(uniqueId)
        localStorage.setItem("userID", uniqueId)
    }, [])

    const [btnGame, setbtnGame] = useState(false)
    const [currentRiddle, setcurrentRiddle] = useState<Riddle | null>()

    const [hasAnswered, setHasAnswered] = useState(false);

    const [gameFinished, setgameFinished] = useState(false)

    const [shouldLoad, setshouldLoad] = useState(false)

    // const [timeControlForAns, settimeControlForAns] = useState(false)

    const [results, setResults] = useState<ResultsState>({
        yours: [],
        opponent: [],
    });

    const [countdown, setCountdown] = useState(10);



    useEffect(() => {
        let timerId: NodeJS.Timeout;

        if (currentRiddle && countdown > 0) {
            timerId = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(timerId);
    }, [currentRiddle, countdown]);

    useEffect(() => {
        // Reset countdown when a new riddle arrives
        if (currentRiddle) {
            setCountdown(10);
        }
    }, [currentRiddle]);
    const startGame = () => {
        if (!socket.connected) {
            console.log("No socket", socket)

            return swal.fire({
                text: "Something went wrong!!!",
                title: "Oops!!",
                timer: 4000,
                icon: "error",
                confirmButtonColor: "red",
                confirmButtonText: "Close"
            })
        }

        setshouldLoad(true)
        setgameFinished(false)
        setbtnGame(true)//disable btn
        // console.log(socket.id, "Searcxhing")

        // console.log(socket)
        socket.emit('search_player', uniqueId)
    }

    useEffect(() => {
        socket.on("game_start", (initialRiddle: Riddle) => {
            console.log("Match Started Successfully")
            setshouldLoad(false)
            setbtnGame(false)
            setgameFinished(false)
            setcurrentRiddle(initialRiddle)
        })
        socket.on('new_riddle', (newRiddle: Riddle) => {
            console.log("New Riddle Arrived")
            setcurrentRiddle(newRiddle);
            setHasAnswered(false)

        });
        socket.on("answer_result", (riddleResult: AnswerRes) => {
            const { playerId, isCorrect, keyId } = riddleResult;
            console.log({ playerId, isCorrect, currentPlayer: playerId === uniqueId });

            const resultKey = playerId === uniqueId ? 'yours' : 'opponent';
            const newResult = { uniqueKey: keyId, ans: isCorrect ? 'True' : 'False' };

            setResults(prev => ({
                ...prev,
                [resultKey]: prev[resultKey].some(result => result.uniqueKey === keyId)
                    ? prev[resultKey]
                    : [...prev[resultKey], newResult]
            }));

            // Clear the timer after handling the result (if needed)
        });

        socket.on("game_over", (finalScoresArray: FinaLScoresArray) => {

            setcurrentRiddle(null);
            setgameFinished(true)


            const currentPlayerRes = finalScoresArray.find(player => player.playerId == uniqueId)

            console.log({ currentPlayerRes })

            const otherPlayerRes = finalScoresArray.find(player => player.playerId != uniqueId)

            console.log({ otherPlayerRes })

            let victory = undefined;

            if (currentPlayerRes?.score! > otherPlayerRes?.score!) {
                console.log("You Won!!!")
                victory = true
            }
            else if (currentPlayerRes?.score! < otherPlayerRes?.score!) {
                console.log("You Lost!!!")
                victory = false
            }
            else if (currentPlayerRes?.score! == otherPlayerRes?.score!) {
                console.log("Draw!!")
                victory = null;

            }
            else {
                console.log("Game Over Error", finalScoresArray)
                victory = undefined;
            }
            let message, title
            switch (victory) {
                case true:
                    message = "You Won! Congratulations!";
                    title = "Victory!";
                    break;
                case false:
                    message = "You Lost! Better luck next time.";
                    title = "Defeat!";
                    break;
                case null:
                    message = "It's a Draw! Tough match.";
                    title = "Draw!";
                    break;
                default:
                    message = "Oops! An error occurred during the game.";
                    title = "Error!";
                    console.error("Game Over Error", finalScoresArray);
                    break;
            }
            swal.fire({
                title: title,
                icon: victory === true ? 'success' : (victory === false ? 'error' : 'info'),
                text: message,
                confirmButtonText: "Close",
                confirmButtonColor: victory === true ? 'green' : (victory === false ? 'red' : 'blue')



            })
                .then(() => {
                    setResults({
                        yours: [] as any,
                        opponent: [] as any,
                    })
                })

        })


        socket.on("players_not_answered", (details: NotAnswered[]) => {
            details.forEach(({ playerId, keyId, submissionStatus }) => {
                const resultKey = playerId === uniqueId ? 'yours' : 'opponent';
                const notAnsweredResult = { uniqueKey: keyId, ans: "Not Answered" };

                setResults(prev => ({
                    ...prev,
                    [resultKey]: prev[resultKey].some(result => result.uniqueKey === keyId)
                        ? prev[resultKey]
                        : [...prev[resultKey], notAnsweredResult]
                }));
            });
        });
        return () => {
            // socket.off('game_start');
            // socket.off('new_riddle');
            // // socket.off('answer_result');
            // socket.off('game_over');
            // socket.off("players_not_answered")
        }
    }, [socket])

    const handleAnswerSubmit = (option: string) => {
        if (hasAnswered) return console.log("Already Answered")
        socket.emit("submit_answer", option, uniqueId)
        console.log("Answer Sent", option)

        setHasAnswered(true)
    }


    return (
        <main className=' flex'>

            <section className=' flex flex-col  h-[80vh]  md:w-3/5  bg-slate-900  mt-6 p-4 rounded-md shadow-black'>
                <h1 className={`${font.className} text-6xl text-center text-white`}>Welcome to Riddle Master</h1>

                {(!currentRiddle && !gameFinished) && <div className=' w-full flex justify-center my-5'>
                    <button className="btn" disabled={btnGame} onClick={startGame}><i className={`animation ${btnGame && "opacity-50 pointer-events-none cursor-wait"}`}></i>Start Game<i className="animation"></i>
                    </button>
                </div>
                }
                {
                    gameFinished && <div className=' w-full flex justify-center my-5'>
                        <button className="btn" disabled={btnGame} onClick={startGame}><i className={`animation ${btnGame && "opacity-50 pointer-events-none cursor-wait"}`}></i>Play Again<i className="animation"></i>
                        </button>
                    </div>
                }
                {
                    // Loader
                    shouldLoad && <section className=' w-full h-40 flex justify-center items-center'> <div className='loader'></div></section>



                }
                {(currentRiddle) && (
                    <section className=' text-white  p-10 '>
                        <h2 className={`${fontP.className} text-lg`} >{currentRiddle.question}</h2>
                        <ul className=' font-sans font-medium'>
                            {currentRiddle.options.map((option, index) => (
                                <li key={index}>
                                    <button disabled={hasAnswered} className={`${hasAnswered && " font-mono opacity-50 pointer-events-none cursor-not-allowed"}`} onClick={() => handleAnswerSubmit(option)}>{option}</button>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                <div className=' flex-grow'></div>
                <div className={`${font3.className} mt-auto text-center text-3xl text-white`}>
                    Time remaining: {countdown} seconds
                </div>
            </section>
            <section className='ml-4 h-[80vh] flex-grow flex text-white bg-slate-900 mt-6 p-4 rounded-md shadow-black'>
                <article className='h-full basis-1/2 border-red-100 border-r'>
                    <h3 className={`${fontP.className}`}>You</h3>
                    {results?.yours?.map((res, i) => (
                        <p className={`mt-3`} key={res.uniqueKey}>{res.ans}</p>
                    ))}
                </article>
                <article className='h-full basis-1/2 pl-4'>
                    <h3 className={`${fontP.className}`}>Opponent</h3>
                    {results?.opponent?.map((res, i) => (
                        <p className={`mt-3`} key={res.uniqueKey}>{res.ans}</p>
                    ))}
                </article>
            </section>

        </main>
    )
}

export default StartingInterface
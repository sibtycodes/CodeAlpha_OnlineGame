// riddleLoader.js

// Sample riddles data (replace with your actual riddles data)
const riddles = [
    {
        question: "What has a head, a tail, is brown, and has no legs?",
        answer: "A penny",
        options: ["A penny", "A dog", "A tree", "A rock"]
    },
    {
        question: "What can travel around the world while staying in a corner?",
        answer: "A stamp",
        options: ["A stamp", "A bird", "A boat", "A car"]
    },
    {
        question: "What has keys but can't open locks?",
        answer: "A piano",
        options: ["A piano", "A keyboard", "A door", "A wallet"]
    },
    {
        question: "What comes once in a minute, twice in a moment, but never in a thousand years?",
        answer: "The letter 'M'",
        options: ["The letter 'M'", "The number 1", "The letter 'A'", "The letter 'Z'"]
    },
    {
        question: "I’m tall when I’m young, and I’m short when I’m old. What am I?",
        answer: "A candle",
        options: ["A candle", "A tree", "A person", "A mountain"]
    },
    {
        question: "What has a neck but no head?",
        answer: "A bottle",
        options: ["A bottle", "A giraffe", "A snake", "A chair"]
    },
    {
        question: "What gets wetter as it dries?",
        answer: "A towel",
        options: ["A towel", "A sponge", "A shirt", "A plant"]
    },
    {
        question: "The more you take, the more you leave behind. What am I?",
        answer: "Footsteps",
        options: ["Footsteps", "Money", "Memories", "Trash"]
    },
    {
        question: "What has one eye but cannot see?",
        answer: "A needle",
        options: ["A needle", "A camera", "A cyclops", "A telescope"]
    },
    {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "An echo",
        options: ["An echo", "A ghost", "A radio", "A microphone"]
    },
    {
        question: "What has a face and two hands but no arms or legs?",
        answer: "A clock",
        options: ["A clock", "A person", "A robot", "A mirror"]
    },
    {
        question: "What runs all around a field but doesn’t move?",
        answer: "A fence",
        options: ["A fence", "A river", "A road", "A wall"]
    },


]

// Function to get a random riddle
function getRandomRiddle() {
    const randomIndex = Math.floor(Math.random() * riddles.length);
    return riddles[randomIndex];
}

module.exports = { getRandomRiddle };

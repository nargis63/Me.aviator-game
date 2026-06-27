const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let gameStatus = "waiting"; 
let currentMultiplier = 1.00;
let crashPoint = 1.00;
let gameLoop;

function startNewRound() {
    gameStatus = "running";
    currentMultiplier = 1.00;
    crashPoint = parseFloat((Math.random() * 9 + 1).toFixed(2));
    
    console.log(`Round started! Crash point: ${crashPoint}x`);

    gameLoop = setInterval(() => {
        if (currentMultiplier >= crashPoint) {
            clearInterval(gameLoop);
            gameStatus = "crashed";
            io.emit('round_crashed', { crashPoint: crashPoint });
            
            setTimeout(() => {
                startNewRound();
            }, 5000);
        } else {
            currentMultiplier += 0.02;
            io.emit('live_multiplier', { 
                multiplier: currentMultiplier.toFixed(2),
                status: gameStatus 
            });
        }
    }, 100);
}

startNewRound();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

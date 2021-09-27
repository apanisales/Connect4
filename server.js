const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

let games = [];

const generateGameCode = () => {
    let newGameCode;
    let gameCodeAlreadyExists = true;
    while (gameCodeAlreadyExists) {
      newGameCode = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

      // eslint-disable-next-line no-loop-func
      gameCodeAlreadyExists = games.some(game => game.gameCode === newGameCode);
    }

    return newGameCode;
}

const createInitialState = () => {
    return {
      currentPlayer: null,
      grid: [
        ['White', 'White', 'White', 'White', 'White', 'White', 'White'],
        ['White', 'White', 'White', 'White', 'White', 'White', 'White'],
        ['White', 'White', 'White', 'White', 'White', 'White', 'White'],
        ['White', 'White', 'White', 'White', 'White', 'White', 'White'],
        ['White', 'White', 'White', 'White', 'White', 'White', 'White'],
        ['White', 'White', 'White', 'White', 'White', 'White', 'White']
      ],
      winner: null
    }
}

function selectColorRandomly() {
    let players = ["Red", "Yellow"];
    let random = Math.floor(Math.random() * players.length);
    return players[random];
}

function calculateWinner(grid, currentPlayer) {
    let winningString = "";
    for (let i = 0; i < 4; i++) {
      winningString += currentPlayer + ","
    }
    winningString = winningString.slice(0, -1); // ex. winningString = Red,Red,Red,Red
  
    // Check horizontally
    for (let row = 0; row < grid.length; row++) {
      let rowString = grid[row].toString();
      if (rowString.includes(winningString)) { // ex. rowString = White,Red,White,White,White,White,White
        return currentPlayer;
      }
    }
  
    // Check vertically
    for (let col = 0; col < grid[0].length; col++) {
      let columnString = "";
      for (let row = 0; row < grid.length; row++) {
        columnString += grid[row][col] + ",";
      }
      if (columnString.includes(winningString)) { // ex. columnString = White,Red,White,White,White,White,White,
        return currentPlayer;
      }
    }
  
    // Check diagonally going down to the right
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        let diagonalString = "";
        for (let i = 0; i < 4; i++) {
          diagonalString += grid[row + i][col + i] + ",";
        }
        if (diagonalString.includes(winningString)) { // ex. diagonalString = White,Red,White,White,
          return currentPlayer;
        }
      }
    }
  
    // Check diagonally going down to the left
    for (let row = 0; row < 3; row++) {
      for (let col = 6; col > 2; col--) {
        let diagonalString = "";
        for (let i = 0; i < 4; i++) {
          diagonalString += grid[row + i][col - i] + ",";
        }
        if (diagonalString.includes(winningString)) { // ex. diagonalString = White,Red,White,White,
          return currentPlayer;
        }
      }
    }
  
    return null;
  }

io.on("connection", socket => {
  socket.emit("get user id", socket.id);

  socket.on("join game", body => {
      let availableGameIndex = games.findIndex(game => game.player2 === undefined && game.isValidGame);
      let joinedGame = null;        
      if (availableGameIndex > -1) {
          games[availableGameIndex].player2 = body.id;
          joinedGame = games[availableGameIndex];
          joinedGame.gameState.currentPlayer = selectColorRandomly();
          joinedGame.player1Color = selectColorRandomly();
          joinedGame.player2Color = (joinedGame.player1Color === "Red") ? "Yellow" : "Red";
      } else {
          let newGame = { 
              player1: body.id,
              player2: undefined,
              player1Color: undefined,
              player2Color: undefined,
              gameState: createInitialState(),
              gameCode: generateGameCode(),
              isValidGame: true // false when one player leaves the game
          }
          games.push(newGame);
          joinedGame = newGame;
      }
      socket.join(joinedGame.gameCode);
      socket.emit("joined game", joinedGame);
      if (joinedGame.player1 !== undefined && joinedGame.player2 !== undefined) {
          socket.to(joinedGame.gameCode).emit("game is ready", joinedGame);
      }
  });

  socket.on("player made move", body => {
      let game = games.find(game => game.gameCode === body.gameCode);
      let index = games.indexOf(game);

      const nextGrid = [...body.grid];
      for (let row = 5; row >= 0; row--) {
        for (let col = 6; col >= 0; col--) {
          if (nextGrid[row][col].includes("Hover")) {
            nextGrid[row][col] = nextGrid[row][col].replace('Hover', '');
          }
        }
      }

      game.gameState.grid = nextGrid;
      game.gameState.winner = calculateWinner(game.gameState.grid, game.gameState.currentPlayer);
      game.gameState.currentPlayer = (game.gameState.currentPlayer === 'Red') ? 'Yellow' : 'Red';
      games[index] = game;
      io.in(game.gameCode).emit("player made move", game);
  });

  socket.on("player left game", body => {
    let game = games.find(game => game.gameCode === body.gameCode);
    let index = games.indexOf(game);
    let playerLeavingWasPlayer1 = (body.userId === game.player1);
    game.isValidGame = false;

    if (playerLeavingWasPlayer1) {
      game.player1 = undefined;
    } else {
      game.player2 = undefined;
    }

    if (game.player1 === undefined && game.player2 === undefined) {
      games.splice(index, 1);
    } else {
      games[index] = game;
    }
    
    io.in(body.userId).emit("player left game", null);

    if (playerLeavingWasPlayer1) {
      io.in(game.player2).emit("player left game", game);
    } else {
      io.in(game.player1).emit("player left game", game);
    }
  });

  socket.on("disconnect", body => {
    let game = games.find(game => game.player1 === socket.id || game.player2 === socket.id);
    let index = games.indexOf(game);

    if (index === -1) {
      return; // player was not in a game
    }

    let playerLeavingWasPlayer1 = (socket.id === game.player1);
    game.isValidGame = false;

    if (playerLeavingWasPlayer1) {
      game.player1 = undefined;
    } else {
      game.player2 = undefined;
    }

    if (game.player1 === undefined && game.player2 === undefined) {
      games.splice(index, 1);
    } else {
      games[index] = game;
    }
    
    io.in(socket.id).emit("player left game", null);

    if (playerLeavingWasPlayer1) {
      io.in(game.player2).emit("player left game", game);
    } else {
      io.in(game.player1).emit("player left game", game);
    }
  });
})

server.listen(8000, () => console.log("server is running on port 8000"));
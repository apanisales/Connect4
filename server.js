const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const port = process.env.PORT || 8000;

let defaultCellColor = "#DDDDDD";
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
        [defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor],
        [defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor],
        [defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor],
        [defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor],
        [defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor],
        [defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor, defaultCellColor]
      ],
      winner: null
    }
}

function selectColorRandomly() {
    let players = ["Red", "Yellow"];
    let random = Math.floor(Math.random() * players.length);
    return players[random];
}

function calculateTieOrWinner(grid, currentPlayer) {
  // Checks for ties
  let tieGame = true;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j].includes(defaultCellColor)) {
        tieGame = false;
        break;
      }
    }
    if (!tieGame) break;
  }
  if (tieGame) return "Tie";

  let winningString = "";
  for (let i = 0; i < 4; i++) {
    winningString += currentPlayer + ","
  }
  winningString = winningString.slice(0, -1); // ex. winningString = Red,Red,Red,Red

  // Check horizontally
  for (let row = 0; row < grid.length; row++) {
    let rowString = grid[row].toString();
    if (rowString.includes(winningString)) { // ex. rowString = #DDDDDD,Red,#DDDDDD,#DDDDDD,#DDDDDD,#DDDDDD,#DDDDDD
      for (let i = 0; i < grid[0].length - 3; i++) {
        let startOfWinningSequence = grid[row][i] === currentPlayer && grid[row][i + 1] === currentPlayer && grid[row][i + 2] === currentPlayer & grid[row][i + 3] === currentPlayer;
        if (startOfWinningSequence) {
          grid[row][i] += "WinningSequence";
          grid[row][i + 1] += "WinningSequence";
          grid[row][i + 2] += "WinningSequence";
          grid[row][i + 3] += "WinningSequence";
        }
      }
      return currentPlayer;
    }
  }

  // Check vertically
  for (let col = 0; col < grid[0].length; col++) {
    let columnString = "";
    for (let row = 0; row < grid.length; row++) {
      columnString += grid[row][col] + ",";
    }
    if (columnString.includes(winningString)) { // ex. columnString = #DDDDDD,Red,#DDDDDD,#DDDDDD,#DDDDDD,#DDDDDD,#DDDDDD,
      for (let i = 0; i < grid[0].length - 3; i++) {
        let startOfWinningSequence = grid[i][col] === currentPlayer && grid[i + 1][col] === currentPlayer && grid[i + 2][col] === currentPlayer & grid[i + 3][col] === currentPlayer;
        if (startOfWinningSequence) {
          grid[i][col] += "WinningSequence";
          grid[i + 1][col] += "WinningSequence";
          grid[i + 2][col] += "WinningSequence";
          grid[i + 3][col] += "WinningSequence";
        }
      }
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
      if (diagonalString.includes(winningString)) { // ex. diagonalString = #DDDDDD,Red,#DDDDDD,#DDDDDD,
        grid[row + 0][col + 0] += "WinningSequence";
        grid[row + 1][col + 1] += "WinningSequence";
        grid[row + 2][col + 2] += "WinningSequence";
        grid[row + 3][col + 3] += "WinningSequence";
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
      if (diagonalString.includes(winningString)) { // ex. diagonalString = #DDDDDD,Red,#DDDDDD,#DDDDDD,
        grid[row + 0][col - 0] += "WinningSequence";
        grid[row + 1][col - 1] += "WinningSequence";
        grid[row + 2][col - 2] += "WinningSequence";
        grid[row + 3][col - 3] += "WinningSequence";
        return currentPlayer;
      }
    }
  }

  return null;
}

function playerDisconnected(socket) {
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
}

io.on("connection", socket => {
  socket.emit("get user id", socket.id);

  socket.on("join game", () => {
      let availableGameIndex = games.findIndex(game => game.player2 === undefined && game.isValidGame);
      let joinedGame = null;        
      if (availableGameIndex > -1) {
          games[availableGameIndex].player2 = socket.id;
          joinedGame = games[availableGameIndex];
          joinedGame.gameState.currentPlayer = selectColorRandomly();
          joinedGame.player1Color = selectColorRandomly();
          joinedGame.player2Color = (joinedGame.player1Color === "Red") ? "Yellow" : "Red";
      } else {
          let newGame = { 
              player1: socket.id,
              player2: undefined,
              player1Color: undefined,
              player2Color: undefined,
              gameState: createInitialState(),
              gameCode: generateGameCode(),
              isValidGame: true, // false when one player leaves the game
              isOnlineGame: true
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
    let game = games.find(game => game.player1 === socket.id || game.player2 === socket.id);
    let index = games.indexOf(game);

      const nextGrid = [...body.grid];
      for (let row = 5; row >= 0; row--) {
        for (let col = 6; col >= 0; col--) {
          if (nextGrid[row][col].includes("Hover")) {
            nextGrid[row][col] = nextGrid[row][col].replace('Hover', '');
          }
        }
      }

      game.gameState.winner = calculateTieOrWinner(nextGrid, game.gameState.currentPlayer);
      game.gameState.grid = nextGrid;
      game.gameState.currentPlayer = (game.gameState.currentPlayer === 'Red') ? 'Yellow' : 'Red';
      games[index] = game;
      io.in(game.gameCode).emit("player made move", game);
  });

  socket.on("player left game", () => {
    playerDisconnected(socket);

  });

  socket.on("disconnect", () => {
    playerDisconnected(socket);
  });
})

server.listen(port, () => console.log("server is running on port" + port));
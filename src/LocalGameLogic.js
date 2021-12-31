import cloneDeep from 'lodash/cloneDeep';

function calculateTieOrWinner(grid, currentPlayer) {
  // Checks for ties
  let tieGame = true;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      if (grid[i][j].includes("White")) {
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
    if (rowString.includes(winningString)) { // ex. rowString = White,Red,White,White,White,White,White
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
    if (columnString.includes(winningString)) { // ex. columnString = White,Red,White,White,White,White,White,
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
      if (diagonalString.includes(winningString)) { // ex. diagonalString = White,Red,White,White,
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
      if (diagonalString.includes(winningString)) { // ex. diagonalString = White,Red,White,White,
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

export function createInitialState() {
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

export function handlePlayerMove({currentPlayer, grid}, col) {
  const nextGrid = cloneDeep(grid);

  for (let row = 5; row >= 0; row--) {
    if (nextGrid[row][col].includes('White')) {
      nextGrid[row][col] = currentPlayer;
      break;
    }
  }

  for (let row = 5; row >= 0; row--) {
    for (let col = 6; col >= 0; col--) {
      if (nextGrid[row][col].includes("Hover")) {
        nextGrid[row][col] = nextGrid[row][col].replace('Hover', '');
      }
    }
  }

  let nextWinner = calculateTieOrWinner(nextGrid, currentPlayer);

  return {
    currentPlayer: currentPlayer === 'Red' ? 'Yellow' : 'Red',
    grid: nextGrid,
    winner: nextWinner
  }
}

export function highlightColumn({currentPlayer, grid, winner}, col) {
  const nextGrid = cloneDeep(grid);

  for (let row = 5; row >= 0; row--) {
    if (nextGrid[row][col].includes("White") && !nextGrid[row][col].includes("Hover")) {
      nextGrid[row][col] += "Hover";
    }
  }

  return {
    currentPlayer: currentPlayer,
    grid: nextGrid,
    winner: winner
  }
}

export function unHighlightColumn({currentPlayer, grid, winner}, col) {
  const nextGrid = cloneDeep(grid);

  for (let row = 5; row >= 0; row--) {
    if (nextGrid[row][col].includes("Hover")) {
      nextGrid[row][col] = nextGrid[row][col].replace('Hover', '');
    }
  }

  return {
    currentPlayer: currentPlayer,
    grid: nextGrid,
    winner: winner
  }
}

export function checkIfColumnIsFree(grid, col) {
  for (let row = 5; row >= 0; row--) {
    if (grid[row][col].includes("White")) {
      return true;
    }
  }
  return false;
}

export function setFirstPlayer(state, firstPlayer) {
  return {
    currentPlayer: firstPlayer,
    grid: state.grid,
    winner: state.winner
  };
}
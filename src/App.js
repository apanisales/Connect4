import React, {useReducer} from 'react';
import cloneDeep from 'lodash/cloneDeep';
import './App.css';
import SelectFirstPlayerModal from './components/SelectFirstPlayerModal';

const initialState = createInitialState();

function createInitialState() {
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

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'CLICK_COLUMN':
      return handlePlayerMove(state, action.column);
    case 'HIGHLIGHT_COLUMN':
      return highlightColumn(state, action.column);
    case 'UNHIGHLIGHT_COLUMN':
      return unHighlightColumn(state, action.column);
    case 'SELECT_FIRST_PLAYER':
      return setFirstPlayer(state, action.player);
    case 'RESTART':
      return createInitialState();
    default:
      return state;
  }
}

function useConnectFour() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const clickColumn = (column) => {
    dispatch({
      type: 'CLICK_COLUMN',
      column
    })
  }

  const restart = () => {
    dispatch({
      type: 'RESTART'
    })
  }

  const highlightHoveredColumn = (column) => {
    dispatch({
      type: 'HIGHLIGHT_COLUMN',
      column
    })
  }

  const unHighlightHoveredColumn = (column) => {
    dispatch({
      type: 'UNHIGHLIGHT_COLUMN',
      column
    })
  }

  const selectFirstPlayer = (player) => {
    dispatch({
      type: 'SELECT_FIRST_PLAYER',
      player
    })
  }

  return [state, clickColumn, restart, highlightHoveredColumn, unHighlightHoveredColumn, selectFirstPlayer]
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

function handlePlayerMove({currentPlayer, grid}, col) {
  const nextGrid = cloneDeep(grid);

  for (let row = 5; row >= 0; row--) {
    if (nextGrid[row][col].includes('White')) {
      nextGrid[row][col] = currentPlayer;
      break;
    }
  }

  return {
    currentPlayer: currentPlayer === 'Red' ? 'Yellow' : 'Red',
    grid: nextGrid,
    winner: calculateWinner(nextGrid, currentPlayer)
  }
}

function highlightColumn({currentPlayer, grid, winner}, col) {
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

function unHighlightColumn({currentPlayer, grid, winner}, col) {
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

function checkIfColumnIsFree(grid, col) {
  for (let row = 5; row >= 0; row--) {
    if (grid[row][col].includes("White")) {
      return true;
    }
  }
  return false;
}

function getPlayerText(player) {
  return <span style={{ color: (player === "Yellow") ? "#FFD300" : player}}>{player}</span>;
}

function setFirstPlayer(state, firstPlayer) {
  return {
    currentPlayer: firstPlayer,
    grid: state.grid,
    winner: state.winner
  };
}

function App() {
  const [state, clickColumn, restart, highlightHoveredColumn, unHighlightHoveredColumn, selectFirstPlayer] = useConnectFour();

  return (
    <>
      <h1> Connect Four</h1>

      {state.winner ? <h1>{getPlayerText(state.winner)} player wins!</h1> : <h1> {getPlayerText(state.currentPlayer)} player's turn </h1>}
      
      {state.currentPlayer === null && <SelectFirstPlayerModal isOpen={state.currentPlayer === null} selectFirstPlayer={selectFirstPlayer}/> }

      <section id="connect-four">
        {
          state.grid.map((row, rowIdx) => (
            <div className="row" key={rowIdx}>
              {row.map((col, colIdx) => (
                <span
                  className="cell"
                  key={colIdx}
                  onClick={() => !state.winner && checkIfColumnIsFree(state.grid, colIdx) && clickColumn(colIdx)}
                  onMouseEnter={() => !state.winner && highlightHoveredColumn(colIdx)}
                  onMouseLeave={() => !state.winner && unHighlightHoveredColumn(colIdx)}
                  style={{backgroundColor: (state.grid[rowIdx][colIdx].includes("Hover")) ? "lightblue" : state.grid[rowIdx][colIdx]}}
                >
                </span>
              ))}
            </div>
          ))
        }
      </section>

      <h3 id="restart-text" onClick={() => restart()}>Click here to restart the game</h3>
    </>
  );
}

export default App;
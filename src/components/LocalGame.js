import React, {useReducer} from 'react';
import '../App.css';
import { createInitialState, handlePlayerMove, highlightColumn, unHighlightColumn, checkIfColumnIsFree, setFirstPlayer} from '../LocalGameLogic.js';
import SelectFirstPlayerModal from './SelectFirstPlayerModal';
import { CustomButton } from "./CustomButton";

const initialState = createInitialState();

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

function getPlayerText(player) {
  return <span class="player_text" player={player} style={{ color: (player === "Yellow") ? "#fefe33" : player}}>{player}</span>;
}

function getTurnOrTieOrWinnerRelatedText(state) {
  if (state.winner) {
      if (state.winner === "Tie") {
        return <h2>The game is a tie!</h2>;
      } else { // There is a winner
        return <h2>The {getPlayerText(state.winner)} player wins!</h2>;
      }
  } else { // There is no winner yet
    if (state.currentPlayer === null) { // The first player has not been selected yet
      return null;
    } else {
      return <h2>It is now the {getPlayerText(state.currentPlayer)} player's turn.</h2>;
    }
  }
}

export default function LocalGame(props) {
  const [state, clickColumn, restart, highlightHoveredColumn, unHighlightHoveredColumn, selectFirstPlayer] = useConnectFour();

  return (
    <>
      {getTurnOrTieOrWinnerRelatedText(state)}

      {state.currentPlayer === null && <SelectFirstPlayerModal isOpen={state.currentPlayer === null} selectFirstPlayer={selectFirstPlayer}/>}

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
                  style={{opacity: (state.grid[rowIdx][colIdx].includes("WinningSequence")) ? 0.5 : 1, backgroundColor: (state.grid[rowIdx][colIdx].includes("Hover")) ? "lightblue" : state.grid[rowIdx][colIdx].replace("WinningSequence", "")}}
                >
                </span>
              ))}
            </div>
          ))
        }
      </section>
      <CustomButton id="restart-button" onClick={() => restart()}>Restart game</CustomButton>
    </>
  );
}
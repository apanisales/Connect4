import React, {useState} from 'react';
import '../App.css';
import { CustomButton } from "./CustomButton";

export default function OnlineGame(props) {
  const [grid, setGrid] = useState(props.game.gameState.grid);
  const playerColor = getPlayerColor();
  const currentPlayer = props.game.gameState.currentPlayer;
  const winner = props.game.gameState.winner;
  const playerColorText = (playerColor !== null) ? <h2 class='game_text'>You are the {getPlayerText(playerColor)} player. </h2> : <h2 class='game_text'> Waiting for second player to join<span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span></h2>;
  let defaultCellColor = "#DDDDDD";

  if (grid !== props.game.gameState.grid) {
    setGrid(props.game.gameState.grid);
  }

  function getPlayerColor() {
    if (props.game.player2 !== undefined) {
      if (props.userId === props.game.player1) {
        return props.game.player1Color;
      } else {
        return props.game.player2Color;
      }
    }
    return null;
  }

  function getPlayerText(player) {
    return <span class="player_text" player={player} style={{ color: (player === "Yellow") ? "#fefe33" : player}}>{player}</span>;
  }
  
  function highlightColumn(col) {
    const nextGrid = [...grid];
  
    for (let row = 5; row >= 0; row--) {
      if (nextGrid[row][col].includes(defaultCellColor) && !nextGrid[row][col].includes("Hover")) {
        nextGrid[row][col] += "Hover";
      }
    }

    return nextGrid;
  }
  
  function unHighlightColumn(col) {
    const nextGrid = [...grid];
    
    for (let row = 5; row >= 0; row--) {
      if (nextGrid[row][col].includes("Hover")) {
        nextGrid[row][col] = nextGrid[row][col].replace('Hover', '');
      }
    }
  
    return nextGrid;
  }
  
  function checkIfColumnIsFree(col) {
    for (let row = 5; row >= 0; row--) {
      if (grid[row][col].includes(defaultCellColor)) {
        return true;
      }
    }
    return false;
  }

  function handlePlayerMove(col) {
    const nextGrid = [...grid];  
    for (let row = 5; row >= 0; row--) {
      if (nextGrid[row][col].includes(defaultCellColor)) {
        nextGrid[row][col] = currentPlayer;
        break;
      }
    }

    let obj = {
      grid: nextGrid
    }

    props.socketRef.current.emit("player made move", obj);
  }

  function leaveGame() {
    props.socketRef.current.emit("player left game", null);
  }

  function getTurnOrTieOrWinnerRelatedText() {
    if (winner) {
        if (winner === "Tie") {
          return <h2 class='game_text'>The game is a tie!</h2>
        } else { // There is a winner
          return <h2 class='game_text'>The {getPlayerText(winner)} player wins!</h2>;
        }
    } else { // There is no winner yet
      return <h2 class='game_text'>It is now the {getPlayerText(currentPlayer)} player's turn.</h2>;
    }
  }

  return (
    <>
      {props.game.isValidGame ? null : <h2> The other player left the game! </h2>}

      {props.game.isValidGame ? playerColorText : null}
    
      {props.game.isValidGame && props.game.player2 !== undefined ? getTurnOrTieOrWinnerRelatedText() : null}
      
      <section id="connect-four">
        {
          grid.map((row, rowIdx) => (
            <div className="row" key={rowIdx}>
              {row.map((col, colIdx) => (
                <span
                  className="cell"
                  key={colIdx}
                  onClick={() => props.game.isValidGame && props.game.player2 && currentPlayer === playerColor && !winner && checkIfColumnIsFree(colIdx) && handlePlayerMove(colIdx)}
                  onMouseEnter={() => !winner && setGrid(highlightColumn(colIdx))}
                  onMouseLeave={() => !winner && setGrid(unHighlightColumn(colIdx))}
                  style={{opacity: (grid[rowIdx][colIdx].includes("WinningSequence")) ? 0.5 : 1, backgroundColor: (grid[rowIdx][colIdx].includes("Hover")) ? "lightblue" : grid[rowIdx][colIdx].replace("WinningSequence", "")}}
                >
                </span>
              ))}
            </div>
          ))
        }
      </section>
      <CustomButton onClick={() => leaveGame()}>Return to home page</CustomButton>
    </>
  );
}
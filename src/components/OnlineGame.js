import React, {useState} from 'react';
import '../App.css';

export default function OnlineGame(props) {
  const [grid, setGrid] = useState(props.game.gameState.grid);
  const userColor = getUserColor();
  const currentPlayer = props.game.gameState.currentPlayer;
  const winner = props.game.gameState.winner;
  const userColorText = (userColor !== null) ? <h1> You are the {getPlayerText(userColor)} player </h1> : <h1> Waiting for second player to join...</h1>;

  if (grid !== props.game.gameState.grid) {
    setGrid(props.game.gameState.grid);
  }

  function getUserColor() {
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
    return <span style={{ color: (player === "Yellow") ? "#FFD300" : player}}>{player}</span>;
  }
  
  function highlightColumn(col) {
    const nextGrid = [...grid];
  
    for (let row = 5; row >= 0; row--) {
      if (nextGrid[row][col].includes("White") && !nextGrid[row][col].includes("Hover")) {
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
      if (grid[row][col].includes("White")) {
        return true;
      }
    }
    return false;
  }

  function handlePlayerMove(col) {
    const nextGrid = [...grid];  
    for (let row = 5; row >= 0; row--) {
      if (nextGrid[row][col].includes('White')) {
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

  function getTurnOrTieOrWinnerRelatedText(winner) {
    if (winner) {
        if (winner === "Tie") {
          return <h1> The game is a tie! </h1>
        } else { // There is a winner
          return <h1>{getPlayerText(winner)} player wins!</h1>;
        }
    } else { // There is no winner yet
      return <h1> {getPlayerText(currentPlayer)} player's turn </h1>;
    }
  }

  return (
    <>
      {props.game.isValidGame ? null : <h1> The other player left the game! </h1>}

      {props.game.isValidGame ? userColorText : null}
    
      {props.game.isValidGame && props.game.player2 !== undefined ? getTurnOrTieOrWinnerRelatedText(winner) : null}
      
      <section id="connect-four">
        {
          grid.map((row, rowIdx) => (
            <div className="row" key={rowIdx}>
              {row.map((col, colIdx) => (
                <span
                  className="cell"
                  key={colIdx}
                  onClick={() => props.game.isValidGame && props.game.player2 && currentPlayer === userColor && !winner && checkIfColumnIsFree(colIdx) && handlePlayerMove(colIdx)}
                  onMouseEnter={() => !winner && setGrid(highlightColumn(colIdx))}
                  onMouseLeave={() => !winner && setGrid(unHighlightColumn(colIdx))}
                  style={{backgroundColor: (grid[rowIdx][colIdx].includes("Hover")) ? "lightblue" : grid[rowIdx][colIdx]}}
                >
                </span>
              ))}
            </div>
          ))
        }
      </section>

      <button onClick={() => leaveGame()}>Return to home page</button>
    </>
  );
}
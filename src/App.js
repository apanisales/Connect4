import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Game from './components/Game';
import io from "socket.io-client";

function App() {
  const [userId, setUserId] = useState();
  const [game, setGame] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('/');

    socketRef.current.on("get user id", id => {
      setUserId(id);
    });
  }, []);

  const joinGame = () => {
    socketRef.current.emit("join game", null);
    socketRef.current.on("joined game", game => {
      setGame(game);
    });
  }

  if (socketRef.current !== undefined) {
    socketRef.current.on("game is ready", game => {
      setGame(game);
    });

    socketRef.current.on("player made move", game => {
      setGame(game);
    });

    socketRef.current.on("player left game", game => {
      if (game === null || game.gameState.winner === null) {
        setGame(game);
      }
    });
  }
  
  return (
    <>
      <h1> Connect Four Online</h1>
      {game !== null && socketRef.current !== undefined ? <Game userId={userId} game={game} socketRef={socketRef}/> : <button onClick={() => socketRef.current !== undefined && joinGame()}>Join game</button>}
    </>
  );
}

export default App;
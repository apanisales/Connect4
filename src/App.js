import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import OnlineGame from './components/OnlineGame';
import LocalGame from './components/LocalGame';
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

  const joinOnlineGame = () => {
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
      <h1> Connect Four</h1>
      {game !== null && game.isOnlineGame && <OnlineGame userId={userId} game={game} socketRef={socketRef}/>}
      {game === null && <button onClick={() => joinOnlineGame()}>Play online</button>}
      {game !== null && !game.isOnlineGame && <LocalGame/>}
      {game === null && <button onClick={() => setGame({isOnlineGame: false})}>Play locally</button>}
      {game !== null && !game.isOnlineGame && <button id="home-button" onClick={() => setGame(null)}>Go to main menu</button>}
    </>
  );
}

export default App;
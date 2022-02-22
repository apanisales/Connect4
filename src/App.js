import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import OnlineGame from './components/OnlineGame';
import LocalGame from './components/LocalGame';
import HowToPlayModal from './components/HowToPlayModal';
import io from "socket.io-client";
import homePageBoard from './HomePageBoard.PNG';
import { CustomButton } from "./components/CustomButton";

function App() {
  const [userId, setUserId] = useState();
  const [game, setGame] = useState(null);
  const socketRef = useRef();

  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const handleCloseHowToPlayModal = () => setShowHowToPlayModal(false);
  const handleShowHowToPlayModal = () => setShowHowToPlayModal(true);

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
      <h1 class='title_text'>Connect 4</h1>
      {game === null && <div> <img src={homePageBoard} alt="homePageBoard"/> </div>}
      {game !== null && game.isOnlineGame && <OnlineGame userId={userId} game={game} socketRef={socketRef}/>}
      {game === null && <CustomButton onClick={() => joinOnlineGame()}>Play online</CustomButton>}
      {game !== null && !game.isOnlineGame && <LocalGame/>}
      {game === null && <CustomButton onClick={() => setGame({isOnlineGame: false})}>Play locally</CustomButton>}
      {game !== null && !game.isOnlineGame && <CustomButton onClick={() => setGame(null)}>Return to home page</CustomButton>}
      <CustomButton id="how-to-play-button" onClick={handleShowHowToPlayModal}>How to play</CustomButton>
      {showHowToPlayModal && <HowToPlayModal onRequestClose={handleCloseHowToPlayModal}/>}
    </>
  );
}

export default App;
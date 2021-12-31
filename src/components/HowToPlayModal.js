import React from "react";
import "../App.css";
import Modal from "react-modal";
import { CustomButton } from "./CustomButton";

Modal.setAppElement("#root");

export default function HowToPlayModal(props) {
    return (
      <>
        <Modal
          isOpen={true}
          contentLabel="Modal that shows how to play Connect 4"
          className="modal"
          overlayClassName="modal-overlay"
          closeTimeoutMS={500}
          shouldCloseOnOverlayClick={false}
        >
          <h2><b>How to play Connect 4</b></h2>
          <ul style={{textAlign: "left"}}>
            <li>Players must connect 4 of the same colored discs in a row (horizontally, vertically, or diagonally) to win</li>
            <li>Only one piece is played at a time</li>
            <li>Players can be on the offensive or defensive</li>
            <li>The game ends when there is a 4-in-a-row or a stalemate</li>
            </ul>
            <div><b>Reference</b>: <a href="https://www.gamesver.com/the-rules-of-connect-4-according-to-m-bradley-hasbro/" target="_blank" rel="noreferrer noopener">The Rules of Connect 4 (According to M. Bradley & Hasbro)</a></div>
          <CustomButton onClick={props.onRequestClose}>Continue</CustomButton>
        </Modal>
      </>
    );
  }
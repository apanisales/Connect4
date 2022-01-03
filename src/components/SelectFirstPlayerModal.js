import React, { useState } from "react";
import "../App.css";
import Modal from "react-modal";
import { CustomButton } from "./CustomButton";

Modal.setAppElement("#root");

export default function SelectFirstPlayerModal(props) {
    const [selectedOption, setSelectedOption] = useState(null);

    function getStartingPlayerRandomly() {
        let players = ["Red", "Yellow"];
        let random = Math.floor(Math.random() * players.length);
        return players[random];
    }

    function onValueChange(event) {
        setSelectedOption(event.target.value);
    }

    function submitFirstPlayer(event) {        
        if (selectedOption === "Random") {
            props.selectFirstPlayer(getStartingPlayerRandomly());
        } else {
            props.selectFirstPlayer(selectedOption);
        }
    }
  
    return (
      <>
        <Modal
          isOpen={true}
          contentLabel="Modal to select the player who goes first"
          className="modal"
          overlayClassName="modal-overlay"
          closeTimeoutMS={500}
          shouldCloseOnOverlayClick={false}
        >
          <h3><b>Select the Player who goes first</b></h3>
          <div className="radio">
                <label>
                    <input
                    type="radio"
                    value="Red"
                    checked={selectedOption === "Red"}
                    onChange={onValueChange}
                    />
                    Red
                </label>
            </div>
            <div className="radio">
                <label>
                    <input
                    type="radio"
                    value="Yellow"
                    checked={selectedOption === "Yellow"}
                    onChange={onValueChange}
                    />
                    Yellow
                </label>
            </div>
            <div className="radio">
                <label>
                    <input
                    type="radio"
                    value="Random"
                    checked={selectedOption === "Random"}
                    onChange={onValueChange}
                    />
                    Random
                </label>
            </div>
          <CustomButton onClick={submitFirstPlayer} disabled={selectedOption === null}>Continue</CustomButton>
        </Modal>
      </>
    );
  }
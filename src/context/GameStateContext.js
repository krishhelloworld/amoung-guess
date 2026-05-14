// context/GameState.js
import React, { createContext, useContext, useState } from "react";

const GameStateContext = createContext();

export function GameProvider({ children }) {
  const [phase, setPhase] = useState("Clue Phase");
  const [currentPlayer, setCurrentPlayer] = useState("Player 1");
  const [clue, setClue] = useState(null);

  return (
    <GameStateContext.Provider value={{ phase, setPhase, currentPlayer, setCurrentPlayer, clue, setClue }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGame() {
  return useContext(GameStateContext);
}

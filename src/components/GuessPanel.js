import React from "react";
import { useGame } from "../context/GameState";

function GuessPanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="flex gap-3">
      <button
        onClick={() => dispatch({ type: "REVEAL_VOTES" })}
        disabled={state.phase !== "VOTING"}
        className="bg-yellow-600 px-4 py-2 rounded text-white"
      >
        Reveal Votes
      </button>

      <button
        onClick={() => dispatch({ type: "END_TURN" })}
        className="bg-red-600 px-4 py-2 rounded text-white"
      >
        End Turn
      </button>
    </div>
  );
}

export default GuessPanel;

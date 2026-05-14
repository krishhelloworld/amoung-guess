// src/components/ClueInput.js
import React, { useState } from "react";
import App from "../App";

export default function ClueInput({ onSend, disabled }) {
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState(1);

  const handleSend = () => {
    if (!clueWord.trim() || disabled) return;
    onSend({ clue: clueWord, count: clueCount });
    setClueWord("");
    setClueCount(1);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl shadow-lg">
      <input
        type="text"
        placeholder="Enter clue..."
        value={clueWord}
        onChange={(e) => setClueWord(e.target.value)}
        className="px-3 py-2 rounded bg-black/40 border border-gray-700 text-white"
      />
      <input
        type="number"
        min={1}
        max={9}
        value={clueCount}
        onChange={(e) => setClueCount(Number(e.target.value))}
        onKeyDown={(e) => e.preventDefault()} 
        className="w-16 px-2 py-1 rounded bg-black/40 border border-gray-700 text-white text-center"
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}

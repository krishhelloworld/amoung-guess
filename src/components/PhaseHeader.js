// src/components/PhaseHeader.js
import React from "react";

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function PhaseHeader({ phase, currentPlayer, clueWord, clueCount, blueScore, orangeScore, blueTime = 0, orangeTime = 0, activeTeam = "blue" }) {
  return (
    <div className="w-full bg-gradient-to-r from-blue-900 via-black to-orange-900 text-white py-4 px-6 rounded-lg shadow-lg mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Phase */}
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wider text-gray-400">Phase</span>
          <span className="text-lg font-bold">{phase}</span>
        </div>

        {/* Center: Clue + Clue count */}
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-gray-400">Clue</span>
          <span className="text-2xl font-extrabold text-yellow-300 tracking-wide"> {clueWord ? `${clueWord} (${clueCount || 0})` : "???"}
</span>
        </div>

        {/* Right: Current player */}
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-wider text-gray-400">Current</span>
          <span className="text-lg font-semibold text-white">{currentPlayer}</span>
        </div>
      </div>

      {/* scoreboard + timers row */}
      <div className="mt-3 flex justify-center gap-6">
        <div className={`flex items-center gap-3 px-3 py-1 rounded-full border ${activeTeam === "blue" ? "border-blue-300 bg-blue-800/40" : "border-blue-600 bg-blue-900/20"}`}>
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-blue-300 font-bold">Blue: {typeof blueScore === "number" ? blueScore : "-"}</span>
            <span className="text-xs text-blue-200">Time: {formatTime(blueTime)}</span>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-3 py-1 rounded-full border ${activeTeam === "orange" ? "border-orange-300 bg-orange-800/40" : "border-orange-600 bg-orange-900/20"}`}>
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-orange-300 font-bold">Orange: {typeof orangeScore === "number" ? orangeScore : "-"}</span>
            <span className="text-xs text-orange-200">Time: {formatTime(orangeTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

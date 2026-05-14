
import React from "react";
import bwm from "../assets/IMAGES/bwm.png"; // Blue Word Master image
import owm from "../assets/IMAGES/owm.jpg"; // Orange Word Master image 
function PlayerList({ players, variant = 1 }) {
  const sortByGuesses = (list) =>
    [...list].sort((a, b) => (b.correctGuesses || 0) - (a.correctGuesses || 0));

  const blueMaster =
    players.find((p) => p.team === "Blue" && p.role === "Clue Giver") || {
      id: 100,
      name: "daddy cool",
      team: "Blue",
      role: "Clue Giver",
      correctGuesses: 0,
    };

  const orangeMaster =
    players.find((p) => p.team === "Orange" && p.role === "Clue Giver") || {
      id: 101,
      name: "kirmadaa",
      team: "Orange",
      role: "Clue Giver",
      correctGuesses: 0,
    };

  const bluePlayers = sortByGuesses(
    players.filter((p) => p.team === "Blue" && p.role !== "Clue Giver")
  );
  const orangePlayers = sortByGuesses(
    players.filter((p) => p.team === "Orange" && p.role !== "Clue Giver")
  );

  // 🔹 compact variants for player card
  const PlayerCard = ({ p, idx, isBlue }) => {
    switch (variant) {
      case 1:
        return (
          <div
            className={`w-44 h-12 rounded-full flex items-center gap-3 px-3 border shadow-sm ${
              isBlue
                ? "bg-gradient-to-r from-blue-900/60 to-blue-700/60 border-blue-500"
                : "bg-gradient-to-r from-orange-900/60 to-orange-700/60 border-orange-500"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                isBlue ? "bg-blue-600" : "bg-orange-600"
              }`}
            >
              {p.name[0]}
            </div>
            <div className="flex  flex-1 leading-tight">
              <span className="text-white text-lg font-medium truncate">
                {p.name}
              </span>
              <div className="flex items-center gap-1">
                {idx === 0 && <span className="text-yellow-400   text-sm">⭐</span>}
                <span
                  className={`text-[15px] pl-4 ${
                    isBlue ? "text-blue-200" : "text-orange-200"
                  }`}
                >
                  ✅ {p.correctGuesses || 0}
                </span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div
            className={`w-40 h-10 rounded-md flex items-center gap-2 px-2 border shadow-sm ${
              isBlue
                ? "bg-blue-800/40 border-blue-400"
                : "bg-orange-800/40 border-orange-400"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                isBlue ? "bg-blue-600" : "bg-orange-600"
              }`}
            >
              {p.name[0]}
            </div>
            <span className="text-white text-xs truncate flex-1">{p.name}</span>
            <span
              className={`text-[9px] ${
                isBlue ? "text-blue-300" : "text-orange-300"
              }`}
            >
              {p.correctGuesses || 0}
            </span>
            {idx === 0 && <span className="text-yellow-400 text-xs">⭐</span>}
          </div>
        );

      case 3:
        return (
          <div className="flex items-center gap-2 w-40 justify-between">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                isBlue ? "bg-blue-600" : "bg-orange-600"
              }`}
            >
              {p.name[0]}
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-white text-xs truncate">{p.name}</span>
              <div className="flex items-center gap-1">
                {idx === 0 && (
                  <span className="text-yellow-400 text-xs leading-none">⭐</span>
                )}
                <span
                  className={`text-[9px] leading-none ${
                    isBlue ? "text-blue-200" : "text-orange-200"
                  }`}
                >
                  {p.correctGuesses || 0} correct
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTeam = (teamName, color, master, list) => {
    const isBlue = color === "blue";
    return (

      <div
        className={`absolute ${
          isBlue ? "left-0" : "right-0"
        } top-0 h-full w-52 flex flex-col items-center py-4 space-y-3`}
      >
        {/* Team heading */}
        <h2
          className={`text-sm font-bold uppercase tracking-wide ${
            isBlue ? "text-blue-400" : "text-orange-400"
          }`}
        >
          {teamName} Team
        </h2>
     <div className= {`  w-56  flex flex-col items-center gap-3 py-4
     ${isBlue ? "bg-blue-800/40" : "bg-orange-800/40"}`}
     >
 
        {/* Word Master */}
        <h3
          className={`text-[18px] font-bold uppercase tracking-wider ${
            isBlue ? "text-blue-200" : "text-orange-200"
          }`}
        >
          Word Master
        </h3>
        <div
          className={`w-43 h-15 rounded-full shadow-md flex items-center gap-1 px-1 border 
             ${
              isBlue ? "border-blue-600 " : "border-orange-600"
            }`}
        >
          <div
            className={`relative w-[70px] h-[66px] bg-cover rounded-full flex items-center justify-center text-sm font-bold text-white ${
              isBlue ? "border-blue-600 " : "border-orange-600"
            }`}
            style={{
              backgroundImage: isBlue ? `url(${bwm})` : `url(${owm})`
            }}
          >
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold pr-4  text-lg truncate ">
              {master.name}
            </span>
           
          </div>
        </div>

        {/* Top Players */}
        <h3
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isBlue ? "text-blue-200" : "text-orange-200"
          }`}
        >
           Players Board
        </h3>
        <div className="flex flex-col gap-2 items-center overflow-y-auto max-h-[65vh] scrollbar-thin">
          {list.map((p, idx) => (
            <PlayerCard key={p.id} p={p} idx={idx} isBlue={isBlue} />
          ))}
        </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTeam("Blue", "blue", blueMaster, bluePlayers)}
      {renderTeam("Orange", "orange", orangeMaster, orangePlayers)}
    </>
  );
}

export default PlayerList;

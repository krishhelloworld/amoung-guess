import React from "react";
import { ThumbsUp } from "lucide-react";

import blueImg from "../assets/IMAGES/bwm.png";
import orangeImg from "../assets/IMAGES/owm.jpg";
import neutralImg from "../assets/IMAGES/OIP3.jpg";
import assassinImg from "../assets/IMAGES/jester.png";
import hiddenImg from "../assets/IMAGES/OIP3.jpg";
import whiteimg from "../assets/IMAGES/white.png";

function WordBoard({
  words = [],
  onWordClick,
  onVote,
  currentUserId,
  disabled = false,
  revealAll = false,
  isGuesser = false,
    currentUserRole,    
}) {
  const getRevealAppearance = (team) => {
    const imageMap = {
      blue: blueImg,
      orange: orangeImg,
      neutral: neutralImg,
      Jester: assassinImg,
      white: whiteimg,
    };
    
    const img = imageMap[team] || hiddenImg;
    return {
      className: "w-full h-full flex items-center justify-center bg-cover bg-center",
      style: { backgroundImage: `url(${img})` },
      textClass: "text-white",
    };
  };

  if (!Array.isArray(words) || words.length === 0) {
    return <div className="text-white text-center">Loading words...</div>;
  }

  return (
    <div className="w-[900px] h-[600px] grid grid-cols-5 gap-3 p-6 mx-auto">
      {words.map((wordObj, index) => {
      const seesJesterVision =
  currentUserRole === "Jester" && wordObj.team === "jester";

const revealed = revealAll || !!wordObj.revealed || seesJesterVision;  

        const appearance = revealed ? getRevealAppearance(wordObj.team) : null;
        const hasVoted =
          Array.isArray(wordObj.votes) &&
          currentUserId != null &&
          wordObj.votes.includes(currentUserId);


 // 👈 Jester sees assassin
        return (
          <div
            key={index}
            onClick={() => {
              // as a GUESSER, card click is a vote (when enabled)
             if (isGuesser && !revealed && typeof onVote === "function") {
    onVote(index, currentUserId);
}
              // as a WordMaster (testing), allow direct reveal when enabled
              if (!isGuesser && !revealed && typeof onWordClick === "function" && !disabled) {
                onWordClick(index);
              }
            }}
            className={`relative rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out ${
              disabled ? "opacity-80 cursor-not-allowed" : "cursor-pointer hover:scale-105 hover:shadow-xl"
            }`}
          >
            {revealed ? (
              <div className={appearance.className} style={appearance.style}>
                <span className={`${appearance.textClass} text-xl px-2`}>{wordObj.word}</span>
              </div>
            ) : (
              <div
                className="w-full h-full bg-cover bg-center flex items-center justify-center font-bold"
                style={{ backgroundImage: `url(${hiddenImg})` }}
              >
                <span className="text-xl px-2 text-white">{wordObj.word}</span>
              </div>
            )}

            {!revealed && isGuesser && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                 if (typeof onVote === "function") onVote(index, currentUserId);
                }}
                className={`absolute bottom-2 right-2 rounded-full p-1 cursor-pointer transition ${
                  hasVoted ? "bg-purple-600" : "bg-black/60 hover:bg-black/80"
                }`}
                title={hasVoted ? "You voted this word" : "Vote this word"}
              >
                <ThumbsUp size={16} className={hasVoted ? "text-white" : "text-green-400"} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WordBoard;

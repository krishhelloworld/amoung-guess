import React from "react";
import { useNavigate } from "react-router-dom";
import fightBg from "./assets/IMAGES/FIGHT.png"; // ✅ fixed path (see next issue)

function StartMatch() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${fightBg})` }}
    >
     <div className="relative">

  {/* Foreground content (sharp and clear) */}
 <button
      className="px-7 py-3.5 bg-[#000000] mt-[390px] ml-[60px] text-white rounded-lg hover:bg-[#f4731d] hover:text-lg transition"
      onClick={() => navigate("/game")}
    >
      Start Match
    </button>
  </div>
</div>

  );
}

export default StartMatch; // ✅ THIS IS MISSING IN YOUR FILE

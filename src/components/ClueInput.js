import React, { useState } from "react";
import App from "../App";
const THEMES = {
blue :{
  text:"px-3 py-2 rounded bg-black/40 border border-gray-700 text-blue",
  rangeInput:"w-14 h-2 cursor-pointer accent-blue-500 ",
  send : "bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" 
},

orange: {
  text:"px-3 py-2 rounded bg-black/40 border border-gray-700 text-orange",
  rangeInput:"w-14 h-2 cursor-pointer accent-orange-500",
  send : "bg-orange-600 px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
}
};
export default function ClueInput({ team = "blue",onSend, disabled }) {
  const t = THEMES[team] ?? THEMES.blue;

  const [clueWord, setClueWord] = useState({
  blue:{word: "", count: 1},
  orange:{word: "", count: 1}  
  });
  
const data=clueWord[team];

  const handleSend = () => {
    if (!clueWord[team].word.trim() || disabled) return;
    onSend({ clue: data.word, count: data.count });
    setClueWord((prev)=>({...prev,[team]:{...prev[team],word:"",count:1}}));
  };
  return (
    <>
    <div className={"flex items-center gap-3 bg-gray-900 p-3 rounded-xl shadow-lg" }>
      <input
        type="text"
        placeholder="Enter clue..."
        value={clueWord[team].word}
        onChange={(e) => setClueWord((prev)=>({...prev,[team]:{...prev[team],word:e.target.value}}))}
        className={t.text}
      />
      
      <input
        type="range"
        min={1}
        max={9}
        value={clueWord[team].count}
        onChange={(e) => setClueWord((prev)=>({...prev,[team]:{...prev[team],count:Number(e.target.value)}}))}
className={ t.rangeInput}     />
       <output for="volume" id="volumeOutput"  >{clueWord[team].count}</output>


      <button
        onClick={handleSend}
        disabled={disabled}
        className={t.send}
      >
        Send
      </button>
    </div>


    </>
  );
}

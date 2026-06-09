import React, { useState ,useRef,useEffect} from "react";
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
  const EnterRef = useRef(null);
  const AutoWriteRef= useRef(null);
  const [clueWord, setClueWord] = useState({
  blue:{word: "", count: 1},
  orange:{word: "", count: 1}  
  });
useEffect(()=>{
const GotoInput = (e)=>{
if(/^[a-zA-Z]$/.test(e.key)){
AutoWriteRef.current?.focus();
}
}
window.addEventListener("keydown",GotoInput);
return()=>{
  window.removeEventListener("keydown",GotoInput);
};

}); 
const data=clueWord[team];
const handleEnter = (e) =>{
  if (e.key == "Enter"){
    EnterRef.current.click();
  return ;}
  };

  const handleSend = () => {
    if (!clueWord[team].word.trim() || disabled) return;
    if(  clueWord[team].word.split(" ").length >3) {
  // alert(`Your words length is ${clueWord[team].word.split(" ").length} which is higher than 3 so better to limit your hint` );
   return ; 
    } 
    onSend({ clue: data.word, count: data.count });
    setClueWord((prev)=>({...prev,[team]:{...prev[team],word:"",count:1}}));
  //  console.log(clueWord[team].word.split(" ").length);   if in future you have to add the limit the words of input for wordmaster make only three two words max

  };
  return (
    <>
    <div className={"flex items-center gap-3 bg-gray-900 p-3 rounded-xl shadow-lg" }>
      <input
        ref= {AutoWriteRef}
        onKeyDown= {handleEnter}
        type="text"
        placeholder="Enter clue..."
        value={clueWord[team].word}
        onChange={(e) => setClueWord((prev)=>({...prev,[team]:{...prev[team],word:e.target.value}}))}
        className={t.text}
      />
{clueWord[team].word.trim().split(/\s+/).length >= 4 &&
  <p style={{position: "absolute",background: "#928400",bottom:"6.3em",width:"14rem",fontSize:"0.75rem",fontStyle:"italic",borderRadius:"7px",padding:"4px"}}>
    "Your words length is than higher than 3"
  </p>

}      
      <input
        type="range"
        min={1}
        max={9}
        value={clueWord[team].count}
        onChange={(e) => setClueWord((prev)=>({...prev,[team]:{...prev[team],count:Number(e.target.value)}}))}
className={ t.rangeInput}     />
       <output for="volume" id="volumeOutput"  >{clueWord[team].count}</output>


      <button
        ref = {EnterRef}
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

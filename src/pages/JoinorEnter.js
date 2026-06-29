import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket.js";
import { savePlayerSession } from "../utils/playerSession.js";

export default function EnterName({ onClose, roomCode, setRoomCode, Join }) {
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const handleJoin = (roomCode) => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
if(!Join)
{
    socket.emit("create-room",name,(response)=>{
      const roomId = response.roomCode;
      const room = response.MyRoom;
      console.log(room)
      savePlayerSession({ roomCode: roomId, playerName: name });
      const URL = window.location.origin + 'game${roomId}';
      console.log(URL)
      navigator.clipboard.writeText(URL)
      setCopied(true)    
      setTimeout(()=>navigate(`/game/${roomId}`),500);
      console.log(name)
    }
    )
}
else{
    socket.emit("join-room",roomCode,name,(response)=>{
const roomId = response.roomCode;
      const room = response.name;
      console.log(room,roomCode)
      savePlayerSession({ roomCode: roomId, playerName: name });
      navigate(`/game/${roomId}`);
    })
}

    console.log(name);
  };
useEffect(()=>{
  const GotoInput=(e)=>{
   if(/^[a-z A-Z]$/.test(e.key)) {
    console.log(e)
    setName((prev)=>prev+e.key)
   }
   if(e.key==="Backspace"){
    setName((prev)=> prev.slice(0,prev.length-1))
   }
  }
  const Submit= (e)=>{
   if(e.key === "Enter"){
    handleJoin(name);
   }
  }
  window.addEventListener("keydown",GotoInput)
  window.addEventListener("keydown",Submit)
  return()=>(
  window.removeEventListener("keydown",Submit),
    window.removeEventListener("keydown",GotoInput)
  )
})

  return (
    <div className="fixed inset-0 flex items-center gap-10 justify-center bg-black/70 z-50">
      <div className=" bg-gradient-to-b from-[#3c0805]/100 to-[#5f0033]/75 p-6 rounded-2xl w-[350px] ">
        <h2 className="text-3xl  font-bold text-orange-500 text-center mb-5">
          {!Join ? "Create Bar" : "Join Bar"}
        </h2>
        <div className="py-4">
          <input
            type="text"
            placeholder="Enter Player Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className=" w-full px-4 py-3 rounded-lg   bg-white-500 text-black placeholder-gray-400 focus:outline-none focus:border-orange-500 "
          />
        </div>
        {Join && (
          <div>
            <input
              type="text"
              value={roomCode}
              placeholder="Enter Room Code"
              onChange={(e) => setRoomCode(e.target.value)}
              className=" w-full px-4 py-3 rounded-lg   bg-[#00000] text-black placeholder-gray-400 focus:outline-none focus:border-orange-500 "
            />{" "}
          </div>
        )}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => handleJoin(name)}
            className=" flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition "
          >
            Join
          </button>

          <button
            onClick={onClose}
            className=" flex-1 bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition "
          >
            Cancel
          </button>
        </div>
      </div>
      {copied && <div style = {{color: "#f7edea", fontSize: "30px", backgroundColor: "#3d0605", padding: "15px 30px", textAlign: "center",fontStyle:"italic",fontFamily:"Times New Roman", fontWeight: "bold", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000, boxShadow: "0 4px 8px rgba(0,0,0,0.2)",}}> 
        Copied the Link </div>}
    </div>
  );
}

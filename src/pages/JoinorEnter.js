import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {socket} from '../services/socket.js';
import Lobby from './PlayersLobby.js'
export default function EnterName({ onClose,roomCode,setRoomCode ,Join}) {
  const [name, setName] = useState("");

  const navigate= useNavigate();
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
      navigate(`/game/${roomId}`);
      const URL = window.location.origin + `/lobby/${roomId}`;
      console.log(URL)
      navigator.clipboard.writeText(URL)
      console.log(name)
    }
    )
}
else{
    socket.emit("join-room",roomCode,name,(response)=>{
const roomId = response.roomCode;
      const room = response.name;
      console.log(room,roomCode)
      navigate(`/game/${roomId}`);
    })
}

  };

  return (
    <div className="fixed inset-0 flex items-center gap-10 justify-center bg-black/70 z-50">
      <div
        className=" bg-gradient-to-b from-red-900 to-black p-6 rounded-2xl w-[350px] " >
        <h2 className="text-3xl  font-bold text-orange-500 text-center mb-5">
          ️ Join Battle
        </h2>
  <div className = "py-4">
        <input type="text"
          value={name} placeholder="Enter Player Name"
          onChange={(e) => setName(e.target.value)}
          className=" w-full px-4 py-3 rounded-lg border-2 border-orange-400 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 " />
</div>
{Join && <div>
        <input type="text" placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) =>setRoomCode(e.target.value)}
          className=" w-full px-4 py-3 rounded-lg border-2 border-orange-400 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 " /> </div> }
        <div className="flex gap-3 mt-5">
          <button onClick={()=>handleJoin(roomCode)}
            className=" flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition " >
            Join
          </button>

          <button onClick={onClose}
            className=" flex-1 bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition " >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

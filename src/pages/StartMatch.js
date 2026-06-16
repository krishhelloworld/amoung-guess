import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fightBg from "../assets/IMAGES/FIGHT.png";
import {socket} from '../services/socket.js';
function EnterName({ onClose,roomCode,setRoomCode }) {
  const [name, setName] = useState("");

  const handleJoin = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    socket.emit("create-room",name)
    console.log(name)
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center gap-10 justify-center bg-black/70 z-50">
      <div
        className="
          bg-gradient-to-b from-red-900 to-black
          p-6
          rounded-2xl
          w-[350px]
        "
      >
        <h2 className="text-3xl  font-bold text-orange-500 text-center mb-5">
          ️ Join Battle
        </h2>
  <div className = "py-4">
        <input
          type="text"
          value={name}
          placeholder="Enter Player Name"
          onChange={(e) => setName(e.target.value)}
          className="
            w-full
            px-4
            py-3
            rounded-lg
            border-2
            border-orange-400
            bg-gray-800
            text-white
            placeholder-gray-400
            focus:outline-none
            focus:border-orange-500
          "
        />
</div>
{/* <div>
        <input
          type="text"
          value={roomCode}
          placeholder="Enter Room Code"
          onChange={(e) =>setRoomCode(e.target.value)}
          className="
            w-full
            px-4
            py-3
            rounded-lg
            border-2
            border-orange-400
            bg-gray-800
            text-white
            placeholder-gray-400
            focus:outline-none
            focus:border-orange-500
          "
        />
</div> */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleJoin}
            className="
              flex-1
              bg-orange-500
              text-white
              py-2
              rounded-lg
              font-semibold
              hover:bg-orange-600
              transition
            "
          >
            Join
          </button>

          <button
            onClick={onClose}
            className="
              flex-1
              bg-gray-700
              text-white
              py-2
              rounded-lg
              font-semibold
              hover:bg-gray-600
              transition
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function StartMatch() {
  const navigate = useNavigate();
  const [showEnterName, setShowEnterName] = useState(false);
const [roomCodes, setRoomCodes] = useState("")
  useEffect(()=>{
    socket.on("room-created",(roomCode)=>{
console.log("room Created", roomCode)
navigate('/game',{
  state: { roomCode }
})
    })
  },[navigate])
  return (
    <>
      <div
        className="w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${fightBg})` }}
      >
        <div className="flex gap-10">
          {/* Join Game Button */}
          <button
            className="
              px-8
              py-4
              bg-black
              text-white
              rounded-xl
              text-lg
              font-bold
              hover:bg-orange-500
              hover:scale-105
              transition
            "
            onClick={() => setShowEnterName(true)}
          >
            Join Game
          </button>

          {/* Create Game Button */}
          <button
            className="
              px-8
              py-4
              bg-black
              text-white
              rounded-xl
              text-lg
              font-bold
              hover:bg-orange-500
              hover:scale-105
              transition
            "
            onClick={() => navigate("/game")}
          >
            Create Game
          </button>
        </div>
      </div>

      {/* Popup */}
      {showEnterName && (
        <EnterName onClose={() => setShowEnterName(false)} roomCode = {roomCodes} setRoomCode= {setRoomCodes}/>
      )}
    </>
  );
}

export default StartMatch;
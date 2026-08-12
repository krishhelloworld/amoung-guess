import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fightBg from "../assets/IMAGES/FIGHT.png";
import {socket} from '../services/socket.js';
import EnterName from './JoinorEnter.js'
import { loadPlayerSession } from "../utils/playerSession.js";
function StartMatch() {
  const navigate = useNavigate();
  const [showEnterName, setShowEnterName] = useState(false);
const [roomCodes, setRoomCodes] = useState("")
const [join,setJoin] = useState(false)

  useEffect(() => {
    const savedSession = loadPlayerSession();
    if (savedSession?.roomCode) {
      navigate(`/game/${savedSession.roomCode}`);
    }
  }, [navigate]);

  return (
    <>
      <div
        className="w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${fightBg})` }}
      >
        <div className="flex gap-10">
          {/* Join Game Button */}
          <button
            className=" px-8 py-4 bg-black text-white rounded-xl text-lg font-bold hover:bg-orange-500 hover:scale-105 transition "
              onClick={() => {
                setShowEnterName(true)
                setJoin(false)}}
              >
            Create Game
          </button>

          {/* Create Game Button */}
          <button
            className=" px-8 py-4 bg-black text-white rounded-xl text-lg font-bold hover:bg-orange-500 hover:scale-105 transition "
              onClick={() =>{
                 setShowEnterName(true)
                setJoin(true)}}
              >
            Join Game
          </button>
        </div>
      </div>

      {/* Popup */}
      {showEnterName && (
        <EnterName onClose={() => setShowEnterName(false)} roomCode = {roomCodes} setRoomCode= {setRoomCodes} Join={join}/>
      )}
    </>
  );
}

export default StartMatch;
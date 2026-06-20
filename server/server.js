import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import  Room from './sockets/models/Room.js'
// import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
function yellow(message){
    console.log("\x1b[33m",message,"\x1b[0m")
    }
function blue(message){
    console.log("\x1b[34m",message,"\x1b[0m")
    }
function purple(message){
    console.log("\x1b[35m",message,"\x1b[0m")
    }
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000"
    }
});

app.use((req,res,next)=>{
console.log(req.url);

next();//check passed now you can proceed after this code 
})
app.use(express.json())

io.on("connection", (socket) => {
  const socketId = socket.id;
  socket.on("create-room", ( playerName , callback) => {
    const roomCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const MyRoom = Room(roomCode, socketId, true, playerName);
    if (!MyRoom) return;
    // console.log("something triggered to create the room");
    // console.log(playerName);
    // yellow(roomCode);
    // console.log(socket.id);
    blue(MyRoom);
    socket.join(roomCode);
    socket.emit("room Created", roomCode);
    socket.to(roomCode).emit("Admin Created room", MyRoom.players);
    callback({ roomCode }, MyRoom);
  });
  socket.on("join-room", ( roomCode, playerName ,callback) => {
    
    const room = Room(roomCode, socketId, false, playerName);
    if (!room) {
      socket.emit("error-message", "No Room found");
      console.log("error in room ")
      return;
    }
    socket.join(roomCode);
    socket.to(roomCode).emit("players updated", room.players);
    callback({roomCode},room)
  });
  socket.on("player-updated", (players) => {
    console.log(players);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });
});

server.listen(5001,()=>{
    console.log("hell server")
})
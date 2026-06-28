import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import fs from 'node:fs/promises'
import  Room from './sockets/models/Room.js'
import {format} from  'date-and-time'
import crypto from 'crypto'


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

function GiveUrl(req){
  return `\x1b[33m${req.protocol}://${req.hostname}:${PORT}${req.originalUrl}\x1b[0m`
}
//--------------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000"
    }
});
const PORT = process.env.port || 5001
app.use((req,res,next)=>{
console.log(req.url);

next();//check passed now you can proceed after this code 
})
app.use(express.json())
//--------------------------


//--------------------------
app.get("/",(req,res)=>{

  console.log(req.url)
  res.end("hello brother")
})

//--------------------------
app.get("/login",(req,res)=>{
  const fullurl = GiveUrl(req)
  console.log(fullurl)
  const write = `Logged in ${format(new Date(), 'YY/MM/DD HH:mm:ss')}  ${req.query.name}\n-------------------------------------------------------------------\n`
  console.log(write)
  fs.appendFile('serverLog.txt',write,(err,data)=>{})
  res.end(`hello ${req.query.name} brother`)
})



//--------------------------

io.on("connection", (socket) => {
  const socketId = socket.id;
  
 //==============CREATE ROOM LOGICS 

  socket.on("create-room", ( playerName , callback) => {
   const roomCode =  crypto.randomBytes(9).toString("base64url") 
   console.log(roomCode)
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


 //==============JOIN ROOM LOGICS 
 
    socket.on("join-room", ( roomCode, playerName ,callback) => {
    
    const room = Room(roomCode, socketId, false, playerName);
    if (!room) {
      socket.emit("error-message", "No Room found");
      console.log("error in room ")
      return;
       }
     socket.to(roomCode).emit("players updated", room.players);
    callback({roomCode},room)
  });
 
 //==============Player Update LOGICS 

  socket.on("player-updated", (players) => {
    console.log(players);
  });
  

 //============== Player Disconnect 
  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });
}); 
    
    
server.listen(PORT,()=>{
    purple("\n\n------------------------------------\nWELCOME TO HELL SERVER\n-----------------------------") })
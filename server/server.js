import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import {rooms} from './sockets/models/Room.js'
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

io.on("connection",(socket)=>{


socket.on("create-room",({playerName},callback)=>{
    const roomCode = Math.random().toString(36).substr(2,8).toUpperCase();
    rooms[roomCode]= {
        players: [
        {
            id: socket.id,
            name : playerName
        }
        ]
    }
    console.log("something triggered to create the room")
    console.log(playerName)
    yellow(roomCode);
    console.log(socket.id)
    blue(rooms[roomCode])
    purple(rooms);
    socket.join(roomCode)
    socket.emit("room Created",roomCode);
    socket.to(roomCode).emit(
        "players updated",
        rooms[roomCode].players
    )
    callback ({roomCode},rooms[roomCode]);
})
socket.on("join-room",({roomCode, playerName})=>{
    const room = rooms[roomCode];
    if(!room){
        socket.emit("error-message","No Room found");
        return ;
    }
    const exit = rooms[roomCode].find((p)=>{
         p.id === socket.id
        console.log(p.id)
        console.log(socket.id)
    })
    if(!exit) return
    room.players.push({
        id: socket.id,
        name: playerName
    })
    socket.join(roomCode);
    socket.to(roomCode).emit(
        "players updated",
        room.players
    )
})
socket.on("player-updated",(players)=>{
console.log(players)
})
socket.on("disconnect",()=>{
    console.log("Disconnected",socket.id)
})
});

server.listen(5001,()=>{
    console.log("hell server")
})
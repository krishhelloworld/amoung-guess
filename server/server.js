import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import {rooms} from './sockets/models/Room.js'
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


socket.on("create-room",(playerName)=>{
    const roomCode = Math.random().toString(36).substr(2,8).toUpperCase();
    rooms[roomCode]= {
        players: [
        {
            id: socket.id,
            name : playerName
        }
        ]
    }
    socket.join(roomCode)
    socket.emit("room Created",roomCode);
    socket.to(roomCode).emit(
        "players updated",
        rooms[roomCode].players
    )
})
socket.on("join-room",({roomCode, playerName})=>{
    const room = rooms[roomCode];
    if(!room){
        socket.emit("error-message","No Room found");
        return ;
    }
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
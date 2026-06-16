import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"https://localhost:3000"
    }
});

app.use((req,res,next)=>{
console.log(req.url);

next();//check passed now you can proceed after this code 
})
app.use(express.json())
app.get("/",(req,res)=>{
res.send("helo wold");
})

io.on("connection",(socket)=>{
console.log("hello user is connected",socket.id)
socket.on("disconnect",()=>{
    console.log("Disconnected",socket.id)

})
});

server.listen(5001,()=>{
    console.log(express.json())
})
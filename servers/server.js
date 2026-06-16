import express from "express";
import http from "http";
import {Server} from 'socket.io';

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = Server(server);
import { WebSocketServer, WebSocket } from "ws";

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: Number(PORT) });


interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "join") {
      allSockets.push({
        socket,
        room: parsedMessage.payload.roomId,
      });
    }

    if (parsedMessage.type === "chat") {
      const currentUserRoom = allSockets.find((x) => x.socket === socket)?.room;
      const chatData = JSON.parse(parsedMessage.payload.message); // sender + text

      allSockets.forEach((user) => {
        if (user.room === currentUserRoom) {
          user.socket.send(JSON.stringify(chatData));
        }
      });
    }
  });
});

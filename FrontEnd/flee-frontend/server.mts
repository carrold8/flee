import 'dotenv/config';
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import clientPromise from "./lib/mongodb.ts"; // ✅ MongoDB import

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const colours = [
  '#e6194B', '#ffe119', '#bf3f45', '#4363d8', '#469990',
  '#800000', '#42d4f4', '#911eb4', '#000075', '#000000',
  '#808000', '#f58231'
];

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", async (socket) => {
    const client = await clientPromise;
    const db = client.db("chatdb");
    const messagesCollection = db.collection("messages");

    socket.on("join-room", async ({ room, username }) => {
      socket.join(room);
      socket.data.username = username;

      const socketsInRoom = (await io.in(room).fetchSockets()).length;
      socket.data.colour = colours[socketsInRoom - 1];

      // ✅ Send chat history
      const history = await messagesCollection
        .find({ room })
        .sort({ timestamp: 1 })
        .toArray();
      socket.emit("chat-history", history);

      socket.emit("user_joined", {
        members: socketsInRoom,
        message: `You joined the room`,
      });
      socket.to(room).emit("user_joined", {
        members: socketsInRoom,
        message: `${username} has joined the room`,
      });
    });

    socket.on("message", async ({ room, message, sender }) => {
      const chatMessage = {
        room,
        sender,
        message,
        colour: socket.data.colour,
        timestamp: new Date(),
      };

      // ✅ Save to DB
      await messagesCollection.insertOne(chatMessage);

      // ✅ Emit message
      socket.emit("message", chatMessage);
      socket.to(room).emit("message", chatMessage);
    });

    socket.on("disconnecting", async () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          const sockets = await io.in(room).fetchSockets();
          const newCount = sockets.length - 1;

          socket.to(room).emit("user_joined", {
            members: newCount,
            message: `${socket.data.username} has left the room`,
          });
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server Running on http://${hostname}:${port}`);
  });
});

// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import next from 'next';

// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();

// const server = createServer();

// const io = new Server(server, {
//   cors: {
//     origin: "*", // Adjust this in production
//   },
// });

// io.on('connection', (socket) => {
//   console.log('🔌 New client connected:', socket.id);
  
//   socket.on("join-room", ({room, username}) => {
//     socket.join(room);
//     console.log(`User connected: ${socket}`)
//     socket.to(room.emit("user_joined", `${username} joined room ${room}`));
//   })

//   socket.on('message', (data) => {
//     console.log('📨 Message received:', data);
//     socket.broadcast.emit('message', data); // broadcast to others
//   });

//   socket.on('disconnect', () => {
//     console.log('👋 Client disconnected:', socket.id);
//   });
// });

// app.prepare().then(() => {
//   server.on('request', (req, res) => handle(req, res));
//   server.listen(3000, () => {
//     console.log('✅ Server ready on http://localhost:3000');
//   });
// });
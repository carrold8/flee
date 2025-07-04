import { createServer} from "node:http";
import next from "next";
import { Server } from "socket.io";

 const dev = process.env.NODE_ENV !== "production"
 const hostname = process.env.HOSTNAME || "localhost";
 const port = parseInt(process.env.PORT || "3000", 10);

 const app = next({dev, hostname, port});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handle);
    const io = new Server(httpServer); //This is a whole room, can have multiple sockets.
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join-room", ({room, username}) => {
          socket.join(room);
          console.log(`User ${username} joined room ${room}`)
          socket.to(room).emit("user_joined", `${username} joined room ${room}`);
        })

        socket.on("message", ({room, message, sender}) => {
          console.log('Messahe from ', sender, ': ',message, ' in room ', room)
          socket.to(room).emit("message", {sender, message})
        })

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
  
    });

    httpServer.listen(port, () => {
        console.log(`Server Running on http://${hostname}:${port}`)
    })
})

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
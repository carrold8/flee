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
    const usersCollection = db.collection("users");
    const messagesCollection = db.collection("messages");
    const pointsCollection = db.collection("points")

    socket.on("join-room", async ({ room, username }) => {
      socket.join(room);
      socket.data.username = username;
      const socketsInRoom = (await io.in(room).fetchSockets()).length;

      const newUser = {
        username: username,
        colour: colours[socketsInRoom - 1],
        x: 0,
        y: 0,
        lives: 3,
        room: room,
        ready: false
      }

      await usersCollection.insertOne(newUser);

      socket.data.colour = colours[socketsInRoom - 1];

      // Send chat history
      const chatHistory = await messagesCollection
        .find({ room })
        .sort({ timestamp: 1 })
        .toArray();
      socket.emit("chat-history", chatHistory);

      const pointsHistory = await pointsCollection
        .find({ room })
        .sort({ timestamp: 1 })
        .toArray();
      socket.emit("points-history", pointsHistory);

      const users = await usersCollection
        .find({ room })
        .sort({ timestamp: 1 })
        .toArray();

      socket.emit("you_joined", {
        members: socketsInRoom,
        message: `You joined the room`,
        colour: socket.data.colour,
        users: users
      });
      socket.to(room).emit("user_joined", {
        members: socketsInRoom,
        message: `${username} has joined the room`,
        users: users
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
      // socket.emit("message", chatMessage);
      socket.to(room).emit("message", chatMessage);
    });

    socket.on("select-square", async ({room, point}) => {
      console.log('Point selected: ', point);
      await pointsCollection.deleteOne({room: room, "point.username": point.username})
      const selectedPoint = {
        room,
        point
      }
      await pointsCollection.insertOne(selectedPoint);
      socket.to(room).emit("square-selected", selectedPoint);
    })

    socket.on("mimic-zero", async ({room}) => {
      const xHit = Math.floor(Math.random() * 10) + 1;
      const yHit = Math.floor(Math.random() * 10) + 1;

      let hitUser = 'Nobody'
      const hitPoint = {x: xHit, yHit};
      const pointsHistory = await pointsCollection
        .find({ room })
        .sort({ timestamp: 1 })
        .toArray();
        
        pointsHistory.map((point) => {
          if(point.point.x === xHit && point.point.y === yHit){
            hitUser = point.point.username
          }
        })
      socket.emit("hit-point", {user: hitUser, point: hitPoint})
      socket.to(room).emit("hit-point", {user: hitUser, point: hitPoint})
    })

    socket.on("disconnecting", async () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          const sockets = await io.in(room).fetchSockets();
          const newCount = sockets.length - 1;

          await usersCollection.deleteOne({room: room})

          const users = await usersCollection
        .find({ room })
        .sort({ timestamp: 1 })
        .toArray();

          socket.to(room).emit("user_joined", {
            members: newCount,
            message: `${socket.data.username} has left the room`,
            users: users
          });


          if(newCount === 0){
            db.collection("messages").deleteMany({room: room})
            db.collection("points").deleteMany({room: room})
            db.collection("users").deleteMany({room: room})
          }
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server Running on http://${hostname}:${port}`);
  });
});

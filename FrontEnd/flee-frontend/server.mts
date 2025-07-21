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
        ready: false,
        active: true,
        connected: true
      }

      const userExists = await usersCollection.findOne({username: username});

      if(userExists || socketsInRoom > 11){
        socket.emit("user-already-exists", 'User exits already');
      }
      else{

        await usersCollection.insertOne(newUser);

        socket.data.colour = colours[socketsInRoom - 1];

        // Send chat history
        const chatHistory = await messagesCollection
          .find({ room })
          .sort({ timestamp: 1 })
          .toArray();
        socket.emit("chat-history", chatHistory);


        const users = await usersCollection
          .find({ room })
          .sort({ lives: -1 })
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
      }
    });

    socket.on("message", async ({ room, message, sender }) => {
      const chatMessage = {
        room,
        sender,
        message,
        colour: socket.data.colour,
        timestamp: new Date(),
      };

      await messagesCollection.insertOne(chatMessage);

      //Emit message
      socket.to(room).emit("message", chatMessage);
    });

    socket.on("select-square", async ({room, point}) => {

      const userPoint = await usersCollection.findOne({x: point.x, y: point.y});
      if(!userPoint){ 
        let newvalues = { $set: {x: point.x, y: point.y } };
        await usersCollection.updateOne({room: room, username: point.username}, newvalues)
        const users = await usersCollection
          .find({ room })
          .sort({ lives: -1 })
          .toArray();
        socket.to(room).emit("user-square-selected", users);
        socket.emit("user-square-selected", users);
      }
    })

    socket.on("mimic-zero", async ({room}) => {
      const xHit = Math.floor(Math.random() * 10) + 1;
      const yHit = Math.floor(Math.random() * 10) + 1;
      let hitUser = '';

      const users = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

      const distance = (userX: number, userY: number, x: number, y: number) => {
        const xvals = (userX - x) * (userX - x);
        const yvals = (userY - y) * (userY - y);
        return Math.sqrt(xvals + yvals);
      }

      let shortestDistance: number;
      users.map((user) => {
        if(!shortestDistance && user.lives > 0 && user.x > 0 && user.y > 0 ){
          shortestDistance = distance(user.x, user.y, xHit, yHit);
          hitUser = user.username;
        }
        else if(user.lives > 0 && user.x > 0 && user.y > 0){
          const distanceFrom = distance(user.x, user.y, xHit, yHit);
          if(distanceFrom < shortestDistance){
            shortestDistance = distanceFrom;
            hitUser = user.username
          } 
        }
      })
      let newLives = { $inc: {lives: -1 } };
      await usersCollection.updateOne({room: room, username: hitUser}, newLives);

      const newUsers = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

      
      socket.emit("users-hit", newUsers);
      socket.to(room).emit("users-hit", newUsers);
    })

    socket.on("disconnecting", async () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          const sockets = await io.in(room).fetchSockets();
          const newCount = sockets.length - 1;

          await usersCollection.deleteOne({room: room, username: socket.data.username})

          const users = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

          socket.to(room).emit("user_joined", {
            members: newCount,
            message: `${socket.data.username} has left the room`,
            users: users
          });

          if(newCount === 0){
            db.collection("messages").deleteMany({room: room})
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

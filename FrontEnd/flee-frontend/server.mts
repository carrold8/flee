import 'dotenv/config';
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import clientPromise from "./lib/mongodb.ts"; // ✅ MongoDB import
import { connected } from 'node:process';
import { UserInfo } from 'node:os';
import { resolve } from 'node:path';
import { ObjectId } from 'mongodb';

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
  const COUNTDOWN_DURATION = 10;
  let countdownEndTime: number | null = null;

 

  io.on("connection", async (socket) => {
    const client = await clientPromise;
    const db = client.db("chatdb");
    const usersCollection = db.collection("users");
    const messagesCollection = db.collection("messages");

    const startCountdown = async (room: string, time: number) => {
      let countDownSeconds = time;
      socket.to(room).emit('countdownStart');
      socket.emit('countdownStart');

      socket.to(room).emit('countdown', countDownSeconds);
      socket.emit('countdown', countDownSeconds);

      return new Promise<void>((resolve) => {
        let interval = setInterval(() => {
          countDownSeconds--;
          io.to(room).emit('countdown', countDownSeconds);

          if(countDownSeconds <= 0){
            clearInterval(interval);
            io.to(room).emit('countdown-end');
            resolve();
          }
        }, 1000)
      });
    }

    const selectTiles = async (room: string) => {

      const allTiles = [];
      for (let x = 1; x <= 10; x++) {
        for (let y = 1; y <= 10; y++) {
          allTiles.push({ x, y });
        }
      }

      const users = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

      const usersWithoutTiles = users.filter((user) => user.x === 0 && user.y === 0 && user.lives > 0); 
      const tilesNeeded = usersWithoutTiles.length;
      const usersSelected = users.filter((user) => (user.x > 0 && user.y > 0)); 

      const isSelected = (tile: {x: number, y: number}) =>
        usersSelected.some(selected => selected.x === tile.x && selected.y === tile.y);

      const availableTiles = allTiles.filter(tile => !isSelected(tile)); 

      for (let i = availableTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTiles[i], availableTiles[j]] = [availableTiles[j], availableTiles[i]];
      }

      const newTiles = availableTiles.slice(0, tilesNeeded);

      

      const userUpdates: {_id: ObjectId, x: number, y: number}[] = [];
      usersWithoutTiles.map((user, index) => {
        userUpdates.push({_id: user._id, x: newTiles[index].x, y: newTiles[index].y });
      })

      const bulkOps = userUpdates.map((user) => ({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { x: user.x, y: user.y} },
        },
      }));

      
      await usersCollection.bulkWrite(bulkOps);
     
      const usersWithTiles = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

        io.to(room).emit('user-tiles', usersWithTiles);
      
    }

    const handleHitUser = async (room:string) => {
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
      
        const chatMessage = {
        room,
        sender: users.find((user) => user.username === hitUser)?.lives === 1 ? "game" : "system",
        message: users.find((user) => user.username === hitUser)?.lives === 1 ? hitUser + " was eliminated." : hitUser + " lost a life.",
        colour: 'grey',
        timestamp: new Date(),
      };

      await messagesCollection.insertOne(chatMessage);

      //Emit message
      io.to(room).emit('hit-point', {x: xHit, y: yHit});
      io.to(room).emit("message", chatMessage);
      
      let newLives = { $inc: {lives: -1 } };
      await usersCollection.updateOne({room: room, username: hitUser}, newLives);

      const newUsers = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();


      socket.emit("users-hit", newUsers);
      socket.to(room).emit("users-hit", newUsers);
    }

    const clearBoard = async (room: string) => {

      await usersCollection.updateMany({room: room}, {$set: {x: 0, y: 0}});
      const users = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

        io.to(room).emit('reset-board', users);
        io.to(room).emit('hit-point', {x: 0, y: 0});

        return users;

    }

    const handleEndOfRound = async (room: string) => {
      //Give all players that have lives left a random unused grid place if selected values are x = 0 and y = 0;
      await selectTiles(room);
      await handleHitUser(room);
      let countDownSeconds = 5;
      await new Promise<void>((resolve) => {
        let interval = setInterval(() => {
          countDownSeconds--;
          if(countDownSeconds <= 0){
            clearInterval(interval);
            resolve();
          }
        }, 1000)
      });

      return await clearBoard(room);
      

    }


    const startGame = async (room: string) => {

      let allEliminated = false;
      

      while(!allEliminated){

        //Start a countdown before beginning game
        await startCountdown(room, 5);

        //Enable the frontend grid to be clickable.
        io.to(room).emit('grid-clickable', true);

        //Show countdown timer for choosing tiles and then disable the grid.
        await startCountdown(room, 5);
        io.to(room).emit('grid-clickable', false);
        const users = await handleEndOfRound(room);
        const usersLeft = users.filter((user) => user.lives > 0).length;
        allEliminated = usersLeft === 1;
      }
    }

    // if(countdownEndTime) {
    //   socket.emit('countdownStart', {endTime: countdownEndTime});
    // }

    

    socket.on("join-room", async ({ room, username }) => {
      socket.join(room);
      const sockets = (await io.in(room).fetchSockets())
      const socketsInRoom = sockets.length;

      const usersInRoom = await usersCollection.countDocuments({room: room})
      const newUser = {
        username: username,
        colour: colours[usersInRoom],
        x: 0,
        y: 0,
        lives: 3,
        room: room,
        ready: false,
        active: true,
        connected: true
      }

      const userExists = await usersCollection.findOne({room: room, username: username});
            
      if(userExists && !userExists.connected ){
        await usersCollection.updateOne({room: room, username: username}, {$set: {connected: true}});
        socket.data.username = username;
        socket.data.colour = userExists.colour;

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
          members: usersInRoom,
          message: `You joined the room`,
          colour: userExists.colour,
          users: users
        });
        socket.to(room).emit("user_joined", {
          members: usersInRoom,
          message: `${username} has joined the room`,
          users: users
        });

      }
      else if((userExists && userExists.connected) || usersInRoom > 11){
        
        socket.emit("user-already-exists", 'User exits already');
      }
      else{

        await usersCollection.insertOne(newUser);
        socket.data.username = username;
        socket.data.colour = colours[usersInRoom];

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
          members: usersInRoom,
          message: `You joined the room`,
          colour: socket.data.colour,
          users: users
        });
        socket.to(room).emit("user_joined", {
          members: usersInRoom,
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

    socket.on("ready-up", async ({room, username, ready}) => {
      await usersCollection.updateOne({room: room, username: username}, {$set: {ready: ready}})
      const users = await usersCollection
          .find({ room })
          .sort({ lives: -1 })
          .toArray();

      if(users.length === users.filter((user) => user.ready).length){

        const compPlayers = [];

        for(let i = users.length; i < 12; i++){
          const newUser = {
            username: 'Player ' + (i + 1),
            colour: colours[i],
            x: 0,
            y: 0,
            lives: 3,
            room: room,
            ready: true,
            active: false,
            connected: true
          }
          compPlayers.push(newUser);
        }

        await usersCollection.insertMany(compPlayers);
        const fillUsers = await usersCollection
          .find({ room })
          .sort({ lives: -1 })
          .toArray();
        socket.to(room).emit("ready-up", fillUsers);
        socket.emit("ready-up", fillUsers);
        startGame(room);

      }
      else{
        socket.to(room).emit("ready-up", users);
        socket.emit("ready-up", users);
      }
      
    })
    

    socket.on("select-square", async ({room, point}) => {

      const userPoint = await usersCollection.findOne({room: room, x: point.x, y: point.y});
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


    socket.on("disconnecting", async () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          const sockets = await io.in(room).fetchSockets();
          const newCount = sockets.length - 1;

          await usersCollection.updateOne({room: room, username: socket.data.username}, {$set: {connected: false}})

          const users = await usersCollection
        .find({ room })
        .sort({ lives: -1 })
        .toArray();

          socket.to(room).emit("user_joined", {
            members: newCount,
            message: `${socket.data.username} disconnected`,
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

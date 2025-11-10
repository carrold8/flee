# flee
Welcome to Flee!

This is a basic project created to gain experience with TypeScript and WebSockets, but to also solve the very important issue of deciding the draft order of my Fantasy Football league.

This project uses the modern Next.js framwork to create a real time multiplayer 'survival' game.
Flee is connected to a MongoDB database amd is hosted on Render. 
You can play by yourself against the computer, or with friends, by visiting this link: https://flee-drafting.onrender.com/


The rules are simple - first one eliminated, gets last pick. Last one remaining gets first pick.

To play the game, enter a username and the room number you wish to join.
Ready up, and once the game begins, choose any available square on the grid.

After the timer runs out, the game will select a random square, the player closest to that square loses one of the three initial lives.
If you lose all three lives, you're eliminated from the game!

The game will inform all the players what position they finish in from 1 - 12 and this is the draft order for your 12 person Fantasy Football league!

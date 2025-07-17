import React from "react";

interface userInterface {
    username: string,
    colour: string,
    x: Number,
    y: Number,
    lives: Number,
    room: string,
    ready: boolean
}

export default function UserDisplay({user} : {user: userInterface}){


    return(
        <div style={{backgroundColor: user.colour}}>{user.username} {user.lives.toString()} <input disabled type="checkbox" checked={user.ready} /></div>
    )
}
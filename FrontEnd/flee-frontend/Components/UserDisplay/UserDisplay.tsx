import React from "react";
import './UserDisplay.css';

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
        <div
            className="user-container" 
            style={{backgroundColor: user.colour}}
        >
            <div>{user.username}</div> 
            <div>{user.lives.toString()}</div> 
            <div><input disabled type="checkbox" checked={user.ready} /></div>
        
        </div>
    )
}
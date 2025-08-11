import React from "react";
import './UserDisplay.css';
import { RiSignalWifiFill, RiSignalWifiOffFill } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";

interface userInterface {
    username: string,
    colour: string,
    x: number,
    y: number,
    lives: number,
    room: string,
    ready: boolean,
    connected: boolean
}

export default function UserDisplay({user} : {user: userInterface}){


    return(
            
        <tr>
            <td>{user.username}</td>
            <td align="center"><div style={{border: '1px solid white',backgroundColor: user.colour, borderRadius: '50%', height: '20px', width: '20px', overflow: "hidden"}}></div></td>
            <td align="center"><FaCheckCircle style={user.ready ? {color: 'green'}:{}} /></td>
            <td align="center">{user.connected ? <RiSignalWifiFill /> : <RiSignalWifiOffFill style={{color: 'red'}} />}</td>
            <td align="center">{user.lives.toString()}</td>
        </tr>
                
       
    )
}
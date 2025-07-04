"use client"
import React, { useState } from "react";
import {socket} from '@/lib/SocketClient'
export default function HomeForm(){


    const [name, setName] = useState('');
    const [roomID, setRoomID] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // console.log('Name: ', name);
        // console.log('Room ID: ', roomID);
        // socket.emit("join_room", {roomID, name})

    }


    return(
        <div className="p-2">
            <form onSubmit={handleSubmit}>

                <input type={'text'} required placeholder="Name" className="px-4 border-2 rounded-lg" value={name} onChange={(e) => setName(e.target.value)} />
                <input type={'number'} required placeholder="Room ID" className="px-4 border-2 rounded-lg" value={roomID} onChange={(e) => setRoomID(e.target.value)} />
                <button type='submit' className="px-4 py-2 rounded-lg">Submit</button>
            </form>
        </div>
    )
}
"use client"
import React, { useState } from "react";
import {socket} from '@/lib/SocketClient'
import {useRouter} from 'next/navigation';

interface FormSubmitProps { 
    username: string;
    room: string;
}

export default function HomeForm({
    onSubmitForm,
}: {
    onSubmitForm: (username: string, room: string) => void;
}){


    const [name, setName] = useState('');
    const [roomID, setRoomID] = useState('');
    const router = useRouter(); 

    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitForm(name, roomID)
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
"use client"
import React, {useEffect, useState} from "react";
import ChatForm from "@/Components/Chat/ChatForm/ChatForm";
import { useParams, useSearchParams } from "next/navigation";
import ChatMessage from "@/Components/Chat/ChatForm/ChatMessage/ChatMessage";
import {socket} from '@/lib/SocketClient'

export default function ChatRoom() {

    const routeParams = useParams();

    const roomID = routeParams.id;

    const [joined, setJoined] = useState(false);
    const [messages, setMessages] = useState<{sender: string; message: string} []>([]);

    const [userName, setUserName] = useState(''); 

    const handleSendMessage = (message: string) => {
        const data = {
            room: roomID, message, sender: userName
        }
        setMessages((prev => [...prev, {sender: userName, message}]))
        socket.emit("message", data);

    }

    const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
    
            // console.log('Name: ', name);
            // console.log('Room ID: ', roomID);
            // socket.emit("join_room", {roomID, name})
            handleJoinRoom()
    
        }

    const handleJoinRoom = () => {
        console.log('clicked hi')
        if(roomID && userName){
            socket.emit("join-room", {room: roomID, username: userName})
        setJoined(true);
        }
        
    }


    useEffect(() => {
        socket.on("message", (data) => {
            console.log(data);
            setMessages((prev) => [...prev, data]);
        })

        socket.on("user_joined", (message) => {
            setMessages((prev => [...prev, {sender: "system", message}]))
        });

        return () => {
            socket.off("user_joined");
            socket.off("message");
        }
    }, [])

    return(
        <div className="flex mt-24 justify-center w-full">


            {!joined ? 
            <form onSubmit={handleSubmit}>

                <input type={'text'} required placeholder="Name" className="px-4 border-2 rounded-lg" value={userName} onChange={(e) => setUserName(e.target.value)} />
                <button type='submit' className="px-4 py-2 rounded-lg">Submit</button>
            </form>
            :
                <div className="w-full max-w-3xl mx-auto">
                    <div>Welcome to Room {roomID}</div>
                    <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg">
                        {messages.length === 0 ? 
                            <div className="text-black">No messages yet...</div>
                            :
                        messages.map((message, index) => (
                            <ChatMessage key={index} sender={message.sender} message={message.message} isOwnMsg={message.sender === userName}/>
                        ))}
                    </div>
                    <div>
                        <ChatForm onSendMessage={handleSendMessage}/>
                    </div>
                </div>
                }
        </div>
    )
}
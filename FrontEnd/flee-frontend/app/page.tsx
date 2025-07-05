"use client"
import React, {useEffect, useState} from "react";
import ChatForm from "@/Components/Chat/ChatForm/ChatForm";
import ChatMessage from "@/Components/Chat/ChatForm/ChatMessage/ChatMessage";
import {socket} from '@/lib/SocketClient';
import HomeForm from "@/Components/HomeForm/HomeForm";

export default function ChatRoom() {

    const msgTone = typeof Audio !== 'undefined' ? new Audio('/sounds/message-124468.mp3') : null;

    const [joined, setJoined] = useState(false);
    const [members, setMembers] = useState(0);
    const [messages, setMessages] = useState<{sender: string; message: string} []>([]);

    const [roomID, setRoomID] = useState('');
    const [userName, setUserName] = useState(''); 

    const handleSendMessage = (message: string) => {
        const data = {
            room: roomID, message, sender: userName
        }
        setMessages((prev => [...prev, {sender: userName, message}]))
        socket.emit("message", data);

    }

    // const handleSubmit = (e: React.FormEvent) => {
    //         e.preventDefault();
    
    //         console.log('Name: ', name);
    //         console.log('Room ID: ', roomID);
    //         socket.emit("join_room", {roomID, name})
    //         handleJoinRoom()
    
    //     }

    const handleSubmit = (username: string, room: string) => {
        console.log('Submitted: ', username, ' Room: ', roomID)
        setUserName(username);
        setRoomID(roomID);
        if(room && username){
            socket.emit("join-room", {room: room, username: username})
            setJoined(true);
        }
    }

    

    useEffect(() => {
        socket.on("message", (data) => {
            console.log(data);
            setMessages((prev) => [...prev, data]);

            if(msgTone){
                msgTone.play().catch((err) => {
                    console.log('Audio play issue: ', err);
                })
            }
        })

        socket.on("user_joined", (data) => {
            setMembers(data.members)
            setMessages((prev => [...prev, {sender: "system", message: data.message}]))
        });

        

        return () => {
            socket.off("user_joined");
            socket.off("message");
        }
    }, [])


    return(
        <div className="flex mt-24 justify-center w-full">


            {!joined ? 
            <HomeForm onSubmitForm={handleSubmit}/>
            :
                <div className="w-full max-w-3xl mx-auto">
                    <div>Welcome to Room {roomID}</div>
                    <div>Members: {members}</div>
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
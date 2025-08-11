"use client"
import React, {useEffect, useState} from "react";
import ChatForm from "@/Components/Chat/ChatForm/ChatForm";
import ChatMessage from "@/Components/Chat/ChatForm/ChatMessage/ChatMessage";
import {socket} from '@/lib/SocketClient';
import HomeForm from "@/Components/HomeForm/HomeForm";
import GameGrid from "@/Components/GameGrid/GameGrid";
import './HomePage.css';
import UserDisplay from "@/Components/UserDisplay/UserDisplay";
import ResultDisplay from "@/Components/ResultDisplay/ResultDisplay";

export default function ChatRoom() {

    // const msgTone = typeof Audio !== 'undefined' ? new Audio('/sounds/message-124468.mp3') : null;

    const [joined, setJoined] = useState(false);
    const [ready, setReady] = useState(false);
    const [members, setMembers] = useState(0);
    const [colour, setColour] = useState('');
    const [messages, setMessages] = useState<{sender: string; message: string; colour: string} []>([]);
    const [users, setUsers] = useState<{username: string, colour: string, x: number, y: number, lives: number, room: string, ready: boolean, connected: boolean} []>([]);

    const [roomID, setRoomID] = useState('');
    const [userName, setUserName] = useState(''); 

    const handleSendMessage = (message: string) => {
        const data = {
            room: roomID, message, sender: userName, colour: colour
        }
        setMessages((prev => [...prev, {sender: userName, message, colour}]))
        socket.emit("message", data);

    }



    const handleSubmit = (username: string, room: string) => {

        setUserName(username);
        setRoomID(room);
        if(room && username){
            socket.emit("join-room", {room: room, username: username});            
            // setJoined(true);
        }
    }

    const handleSelectSquare = (X: number, Y: number) => {
            const newPoint = {
                x: X,
                y: Y,
                username: userName
            }
            socket.emit("select-square", {room: roomID, point: newPoint});
        }

        const handleReadyUp = () => {
            socket.emit("ready-up", {room: roomID, username: userName, ready: !ready});
            setReady(!ready);
        }
    
    
    // useEffect(() => {
    //     socket.on("message", (data) => {
            
    //         setMessages((prev) => [...prev, data]);

    //         if(msgTone){
    //             msgTone.play().catch((err) => {
    //                 console.log('Audio play issue: ', err);
    //             })
    //         }
    //     })

    // }, [msgTone])

    useEffect(() => {

        socket.on('connect', () => {
      console.log('[CLIENT] Connected:', socket.id);
    });

        socket.on('chat-history', (data) => {
            
            setMessages(data);
        })
        

        socket.on("ready-up", (data) => {
            setUsers(data);
        })
       
        socket.on("you_joined", (data) => {
            
            setJoined(true);
            setMembers(data.members);
            setColour(data.colour)
            setUsers(data.users);
            // setUsers((prev => [...prev, data.users]))
            setMessages((prev => [...prev, {sender: "system", message: data.message, colour: 'gray'}]))
        });

        socket.on("message", (data) => {
            setMessages((prev) => [...prev, data]);
        })

        socket.on("user-tiles", (data) => {
            setUsers(data);
        })

        socket.on("user_joined", (data) => {
            setMembers(data.members);
            // setColour(data.colour);
            setUsers(data.users)
            setMessages((prev => [...prev, {sender: "system", message: data.message, colour: 'gray'}]))
        });

        socket.on("user-square-selected", (data) => {
            setUsers(data);
        })

        socket.on("users-hit", (data) => {
            setUsers(data);
        })

        socket.on('reset-board', (data) => {
            console.log('reset ', data)
            setUsers(data);
        })

        return () => {
            socket.off("user_joined");
            socket.off("message");
        }
    }, [])


    return(
        <div>
            {!joined ? 
            <HomeForm onSubmitForm={handleSubmit}/>
            :
                <div>
                    <div>Welcome to Room {roomID}</div>
                    <div>Members: {members}</div>
                    
                    <div className="game-container">
                        <div className="item">
                            {users.length !== users.filter((user) => user.ready).length && <button onClick={handleReadyUp} className={ready ? 'ready-button ready' : 'ready-button'}>{ready? 'Unready':'Ready Up'}</button>}
                            <div>
                                <table style={{width: '100%'}}>
                                                <thead>
                                                    <tr>
                                                        <th align="left">Username</th>
                                                        <th>Colour</th>
                                                        <th>Ready</th>
                                                        <th>Signal</th>
                                                        <th>Lives</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                {users.map((user, index) => {
                                    return(
                                        <UserDisplay user={user} key={index} />
                                    )   
                                })}
                                </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="item">
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            {(users.filter((user) => user.lives === 1 && user.ready).length === 1) && users.filter((user) => user.lives === 0).length === users.length - 1 ? 
                                <ResultDisplay leaderboard={messages.filter((msg) => msg.sender === 'game')} winner={users.find((user) => user.lives === 1 && user.ready)?.username ?? ''} />
                                :
                                <GameGrid users={users} handleSelectSquare={handleSelectSquare}/>
                            }
                            </div>
                        </div>
                        <div className="item">

                             <div className="h-[500px] overflow-y-auto p-4 mb-4 bg-gray-200 border-2 rounded-lg">
                                {messages.length === 0 ? 
                                    <div className="text-black">No messages yet...</div>
                                    :
                                messages.map((message, index) => (
                                    <ChatMessage key={index} sender={message.sender} message={message.message} colour={message.colour} isOwnMsg={message.sender === userName}/>
                                ))}
                            </div>
                            <div>
                                <ChatForm onSendMessage={handleSendMessage}/>
                            </div>

                        </div>
                    </div>
                    
                    
                   
                </div>
            } 
        </div>
    )
}
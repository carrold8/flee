"use client"


import React, {useState} from "react"

export default function ChatForm({
    onSendMessage,
}: {
    onSendMessage: (message: string) => void;
}){

    const [message, setMessage] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if(message.trim() !== ""){
            onSendMessage(message);
            setMessage("");
        }
    };


    return(
        <div>
            <form onSubmit={handleSubmit}>
                <input type={'text'} required placeholder="Enter Message..." className="px-4 border-2 rounded-lg" value={message} onChange={(e) => setMessage(e.target.value)} />
                <button type='submit' className="px-4 py-2 rounded-lg">Submit</button>
            </form>
        </div>
    )
}
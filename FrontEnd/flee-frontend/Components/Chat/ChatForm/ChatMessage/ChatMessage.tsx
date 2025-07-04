import React from "react";

interface ChatMessageProps { 
    sender: string;
    message: string;
    isOwnMsg: boolean;
}

export default function ChatMessage({sender, message, isOwnMsg}: ChatMessageProps){

    const isSystemMsg = sender === 'system';

    return(
        <div className={`flex ${
          isSystemMsg ? "justify-end" : isOwnMsg ?  "justify-end" : "justify-start"
        } items-center`}
        >
            <div className={`max-w-xs px-4 py-2 rounded-lg ${isSystemMsg ? "bg-gray-800 text-white text-center text-xs" : isOwnMsg ?  "bg-blue-500" : "bg-white-100 text-black"}`}>
                {!isSystemMsg && <p className="text-sm font-bold">{sender}</p>}
                <p>{message}</p>
            </div>

        </div>
    )
} 
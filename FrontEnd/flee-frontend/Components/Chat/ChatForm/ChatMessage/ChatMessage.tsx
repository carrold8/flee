import React from "react";

interface ChatMessageProps { 
    sender: string;
    message: string;
    colour: string;
    isOwnMsg: boolean;
}

export default function ChatMessage({sender, message, colour, isOwnMsg}: ChatMessageProps){

    const isSystemMsg = sender === 'system';

    return(
        <div className={`flex ${
          isSystemMsg 
          ? "justify-center" 
          : isOwnMsg 
          ?  "justify-end" 
          : "justify-start"
        } mb-3`}
        >
            <div style={{backgroundColor: colour}} className={`max-w-xs px-4 py-2 rounded-lg ${
                isSystemMsg 
                ? "bg-gray-800 text-white text-center text-xs " 
                : isOwnMsg 
                ?  "text-white" 
                : "text-white"
                }`}>
                {!isSystemMsg && <p className="text-sm font-bold">{sender}</p>}
                <p>{message}</p>
            </div>

        </div>
    )
} 
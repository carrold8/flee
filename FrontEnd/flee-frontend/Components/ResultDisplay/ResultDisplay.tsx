import React from "react";


interface messageInterface {sender: string; message: string; colour: string}

export default function ResultDisplay({winner, leaderboard} : {winner: string, leaderboard: messageInterface[]}){

    return(
        <div>

            <div>1 - {winner}</div>

            {leaderboard.map((player, index) => {
                return(
                    <div key={index}>
                        {(index + 2).toString()} - {player.message.split('was eliminated.')[0]}
                    </div>
                )
            })}
        </div>
    )
}
"use client"


import React, {useEffect, useState} from "react"
import {socket} from '@/lib/SocketClient';

interface pointInterface {
    x: Number; y: Number; colour: string, username: string
}

export default function GameGrid({roomID, username, colour} : {roomID: string, username: string, colour: string}){

    const xVals = [1,2,3,4,5,6,7,8,9,10]
    const yVals = [1,2,3,4,5,6,7,8,9,10]
    const [points, setPoints] = useState<{point: pointInterface} []>([]);

    const handleSelectSquare = (X: Number, Y: Number) => {
        const newPoint = {
            x: X,
            y: Y,
            colour: colour,
            username: username
        }

        
        setPoints((prev => [...prev.filter((point) => point.point.username !== username), {point: newPoint}]))
        socket.emit("select-square", {room: roomID, point: newPoint});
    }

    useEffect(() => {

        socket.on("points-history", (data) => {
            console.log('Points history: ',data)
            setPoints(data);
        })

        socket.on("square-selected", (data) => {
            console.log('Square Grid: ', data);
            setPoints((prev) => [...prev.filter((point) => point.point.username !== data.point.username), data]);
        })
    }, [])

    return(
        <div>
            <div>Game Grid</div>
            <div>
                <table>
                    <tbody>
            {xVals.map((xVal) => {
                return(
                    <tr key={xVal}>
                    {yVals.map((yVal) => {
                        if(points.find((point) => point.point.x === xVal && point.point.y === yVal)){
                         
                            const bgColour = points.find((point) => point.point.x === xVal && point.point.y === yVal)?.point.colour;
                            return (       
                                <td 
                                    key={yVal} 
                                    style={{height: '60px', width: '60px', border: '2px solid red', backgroundColor: bgColour, margin: '5px'}} 
                                    onClick={() => handleSelectSquare(xVal, yVal)}
                                ></td>
                            )
                            }
                            else {
                                return(
                                <td 
                                    key={yVal} 
                                    style={{height: '60px', width: '60px', border: '2px solid red', backgroundColor: 'white', margin: '5px'}} 
                                    onClick={() => handleSelectSquare(xVal, yVal)}
                                ></td>
                                )
                            }
                            
                        
                    })}
                    </tr>
                )
            })}
            </tbody>
            </table>
            </div>
        </div>
    )

}
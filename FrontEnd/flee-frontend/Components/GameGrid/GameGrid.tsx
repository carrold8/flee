"use client"


import React, {useEffect, useState} from "react"
import {socket} from '@/lib/SocketClient';

export default function GameGrid({roomID, colour} : {roomID: string, colour: string}){

    const xVals = [1,2,3,4,5,6,7,8,9,10]
    const yVals = [1,2,3,4,5,6,7,8,9,10]
    const [points, setPoints] = useState<{x: Number; y: Number; colour: string} []>([]);

    const handleSelectSquare = (X: Number, Y: Number) => {
        const newPoint = {
            x: X,
            y: Y,
            colour: colour
        }
        setPoints((prev => [...prev, newPoint]))
        socket.emit("select-square", {room: roomID, point: newPoint});
    }

    useEffect(() => {
        socket.on("square-selected", (data) => {
            console.log('Square Grid: ', data);
            setPoints((prev) => [...prev, data]);
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
                        if(points.find((point) => point.x === xVal && point.y === yVal)){
                         
                            const bgColour = points.find((point) => point.x === xVal && point.y === yVal)?.colour;
                            return (       
                                <td 
                                    key={yVal} 
                                    style={{height: '30px', width: '30px', border: '2px solid red', backgroundColor: bgColour, margin: '5px'}} 
                                    onClick={() => handleSelectSquare(xVal, yVal)}
                                ></td>
                            )
                            }
                            else {
                                return(
                                <td 
                                    key={yVal} 
                                    style={{height: '30px', width: '30px', border: '2px solid red', backgroundColor: 'white', margin: '5px'}} 
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
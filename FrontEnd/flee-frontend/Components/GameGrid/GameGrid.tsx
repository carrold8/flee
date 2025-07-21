"use client"


import React from "react"

interface userInterface {
    username: string,
    colour: string,
    x: Number,
    y: Number,
    lives: Number,
    room: string,
    ready: boolean
}



export default function GameGrid({ users, handleSelectSquare} : {users: userInterface[], handleSelectSquare: (X: Number, Y: Number) => void}){

    const xVals = [1,2,3,4,5,6,7,8,9,10]
    const yVals = [1,2,3,4,5,6,7,8,9,10]
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
                        if(users.find((user) => user.x === xVal && user.y === yVal)){
                         
                            const bgColour = users.find((user) => user.x === xVal && user.y === yVal)?.colour;
                            return (       
                                <td 
                                    key={yVal} 
                                    style={{height: '4rem', width: '4rem', border: '2px solid red', backgroundColor: bgColour, margin: '5px'}} 
                                    onClick={() => {if(!users.find((user) => user.x === xVal && user.y === yVal)) handleSelectSquare(xVal, yVal)}}
                                ></td>
                            )
                            }
                            else {
                                return(
                                <td 
                                    key={yVal} 
                                    style={{height: '4rem', width: '4rem', border: '2px solid red', backgroundColor: 'white', margin: '5px'}} 
                                    onClick={() => {if(!users.find((user) => user.x === xVal && user.y === yVal)) handleSelectSquare(xVal, yVal)}}
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
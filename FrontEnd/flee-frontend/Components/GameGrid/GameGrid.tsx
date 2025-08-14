"use client"


import React, { useEffect, useState } from "react"
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import {socket} from '@/lib/SocketClient';
import './GameGrid.css';

interface userInterface {
    username: string,
    colour: string,
    x: number,
    y: number,
    lives: number,
    room: string,
    ready: boolean
}



export default function GameGrid({ users, handleSelectSquare} : {users: userInterface[], handleSelectSquare: (X: number, Y: number) => void}){

    const xVals = [1,2,3,4,5,6,7,8,9,10]
    const yVals = [1,2,3,4,5,6,7,8,9,10]

    const [hitPoint, setHitPoint] = useState({x: 0, y: 0});
    const [clickable, setClickable] = useState(false);
    // const [countDown, setCountDown] = useState<number | null>(10);

    const clickGridLocation = (x: number, y: number) => {
        if((users.filter((user) => user.ready).length === users.length) && clickable){
            if(!users.find((user) => user.x === x && user.y === y)){
                handleSelectSquare(x, y);
            } else {
                // console.log(users.find((user) => user.x === x && user.y === y))
            }
        }
    }

    useEffect(() => {
    
        // socket.on('countdown', (time) => {
        //   setCountDown(time)
        // })
    
        // socket.on('countdown-end', () => {
        //   setCountDown(null);
        // })

        socket.on('grid-clickable', (bool) => {
            setClickable(bool);
        })

        socket.on('hit-point', (data) => {
            setHitPoint(data);
        })
    
      }, []);

    return(
        <div className="game-grid-container">
            <div>
                

                {(users.filter((user) => user.ready).length === users.length) ? 
                <div>
                    <div className="p-2" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{clickable === undefined && 'Here we go!'} {clickable ? 'Choose your square! ' : 'Round starts in: '} <CountdownTimer /></div>
                {/* <table>
                    <tbody>
            {xVals.map((xVal) => {
                return(
                    <tr key={xVal}>
                    {yVals.map((yVal) => {
                        if(users.find((user) => user.x === xVal && user.y === yVal)){
                         
                            const bgColour = users.find((user) => user.x === xVal && user.y === yVal)?.colour;
                            const hitSquare = (xVal == hitPoint.x) && (yVal === hitPoint.y)
                            return (       
                                <td 
                                    key={yVal} 
                                    style={{height: '3rem', width: '3rem', border: hitSquare ? '2px solid red' : '1px solid black', backgroundColor: bgColour, margin: '5px'}} 
                                    // onClick={() => {if(!users.find((user) => user.x === xVal && user.y === yVal)) handleSelectSquare(xVal, yVal)}}
                                    onClick={() => {clickGridLocation(xVal, yVal)}}
                                >{hitPoint.x === xVal && hitPoint.y===yVal && 'HIT'}</td>
                            )
                            }
                            else {
                                const hitSquare = (xVal == hitPoint.x) && (yVal === hitPoint.y)
                                return(
                                <td 
                                    key={yVal} 
                                    style={{height: '3rem', width: '3rem', border: hitSquare ? '2px solid red' : '1px solid black', backgroundColor: 'white', margin: '5px'}} 
                                    onClick={() => {clickGridLocation(xVal, yVal)}}
                                ></td>
                                )
                            }
                            
                        
                    })}
                    </tr>
                )
            })}
            </tbody>
            </table> */}

            <div >
            {xVals.map((xVal) => {
                return(
                    <div key={xVal} style={{display: 'flex'}}>
                    {yVals.map((yVal) => {
                        if(users.find((user) => user.x === xVal && user.y === yVal)){
                         
                            const bgColour = users.find((user) => user.x === xVal && user.y === yVal)?.colour;
                            const hitSquare = (xVal == hitPoint.x) && (yVal === hitPoint.y)
                            return (       
                                <span 
                                    key={yVal} 
                                    className={hitSquare ? "game-grid-tile hit" : "game-grid-tile"}
                                    style={{ backgroundColor: bgColour}} 
                                    // onClick={() => {if(!users.find((user) => user.x === xVal && user.y === yVal)) handleSelectSquare(xVal, yVal)}}
                                    onClick={() => {clickGridLocation(xVal, yVal)}}
                                ></span>
                            )
                            }
                            else {
                                const hitSquare = (xVal == hitPoint.x) && (yVal === hitPoint.y)
                                return(
                                <span 
                                    key={yVal} 
                                    className={hitSquare ? "game-grid-tile hit" : "game-grid-tile"}
                                    style={{ backgroundColor: 'white'}} 
                                    onClick={() => {clickGridLocation(xVal, yVal)}}
                                ></span>
                                )
                            }
                            
                        
                    })}
                    </div>
                )
            })}
            </div>


            </div>
            :
              <h1>Waiting for everyone to ready up...</h1>  
            }
            </div>
        </div>
    )

}
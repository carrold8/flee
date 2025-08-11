"use client"


import React, { useEffect, useState } from 'react';
import {socket} from '@/lib/SocketClient';



function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);

  useEffect(() => {
    socket.on('countdownStart',  (time) => {
      // setTime(time);
    });
    
    socket.on('countdown', (time) => {
      setTime(time)
    })

    socket.on('countdown-end', () => {
      setTime(null);
    })

  }, []);

  return (
    <div className='p-3'>
      <h1>{time !== null && time }</h1>
    </div>
  );
}

export default CountdownTimer;

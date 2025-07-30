"use client"


import React, { useEffect, useState } from 'react';
import {socket} from '@/lib/SocketClient';



function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    socket.on('countdownStart', ({ endTime }) => {
      setEndTime(endTime);
    });

    return () => {
      socket.off('countdownStart');
    };
  }, []);

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);

      if (diff === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const startCountdown = () => {
    socket.emit('startCountdown');
  };

  return (
    <div>
      <h1>Countdown: {timeLeft !== null ? timeLeft : 'Waiting...'}</h1>
      <button onClick={startCountdown}>Start Countdown</button>
    </div>
  );
}

export default CountdownTimer;

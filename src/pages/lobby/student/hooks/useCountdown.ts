import { useState, useEffect } from "react";

export function useCountdown(
  durationMinutes: number, 
  startedAt?: string | Date, 
  isStarted: boolean = true
) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!isStarted) {
      return;
    }

    const calculateTimeLeft = () => {
      if (!startedAt) {
        return durationMinutes * 60;
      }
      
      const now = Date.now();
      const startTime = new Date(startedAt).getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const totalSeconds = durationMinutes * 60;
      const remaining = totalSeconds - elapsedSeconds;
      
      return Math.max(0, remaining);
    };

    const updateTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    updateTimer();

    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [durationMinutes, startedAt, isStarted]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return { 
    formattedTime: formatTime(timeLeft), 
    timeLeft,
    isExpired: timeLeft <= 0 
  };
}
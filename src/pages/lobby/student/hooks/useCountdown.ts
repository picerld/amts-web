import { useState, useEffect } from "react";

export function useCountdown(initialMinutes: number) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert minutes to seconds

  useEffect(() => {
    if (initialMinutes <= 0) return;
    
    setTimeLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "00:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return formatTime(timeLeft);
}
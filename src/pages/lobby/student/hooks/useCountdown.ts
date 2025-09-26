import { useEffect, useState } from "react";

export function useCountdown(durationInMinutes: number) {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

  useEffect(() => {
    setTimeLeft(durationInMinutes * 60);
  }, [durationInMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  if (durationInMinutes === 0) return "0:00";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
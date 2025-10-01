import { motion } from "framer-motion";
import { useCountdown } from "@/features/quiz/hooks/useCountdown";
import { Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

type QuizTimeDurationCardProps = {
  duration: number;
  startTime: string;
  status: string;
  onExpired?: () => void;
};

export default function QuizTimeDurationCard({
  duration,
  startTime,
  status,
  onExpired,
}: QuizTimeDurationCardProps) {
  const [isActive, setIsActive] = useState<boolean>(false);

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [hasHandledExpiration, setHasHandledExpiration] =
    useState<boolean>(false);

  useEffect(() => {
    console.log("Status changed to:", status);
    if (status == "ONGOING") {
      setIsActive(true);
    } else if (status == "FINISHED" || status == "WAITING") {
      setIsActive(false);
    }
  }, [status]);

  useEffect(() => {
    if (startTime && status == "ONGOING") {
      console.log("StartTime updated:", startTime);
      setIsActive(true);
    }
  }, [startTime, status]);

  const { formattedTime, timeLeft, isExpired } = useCountdown(
    duration,
    startTime,
    isActive
  );

  useEffect(() => {
    if (isActive) {
      setHasStarted(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (
      hasStarted &&
      isExpired &&
      status === "ONGOING" &&
      onExpired &&
      !hasHandledExpiration
    ) {
      setHasHandledExpiration(true);
      setIsActive(false);
      onExpired();
    }
  }, [hasStarted, isExpired, status, onExpired, hasHandledExpiration]);

  if (status == "WAITING") return null;

  const getProgressPercentage = () => {
    return (timeLeft / (duration * 60)) * 100;
  };

  const getTimeColor = () => {
    if (status == "FINISHED") return "text-gray-600";
    const percentage = getProgressPercentage();
    if (percentage > 20) return "text-blue-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (status == "FINISHED") return "bg-gray-400";
    const percentage = getProgressPercentage();
    if (percentage > 20) return "bg-blue-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-xl max-w-md w-full mb-5"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={`w-6 h-6 ${getTimeColor()}`} />
          <h3 className="text-lg font-bold text-gray-800">Quiz Timer</h3>
        </div>
        {status == "FINISHED" && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Finished
          </span>
        )}
        {isExpired && status == "ONGOING" && (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
            Expired
          </span>
        )}
      </div>

      <div className="mb-6">
        <div
          className={`text-5xl font-bold text-center mb-2 ${getTimeColor()}`}
        >
          {formattedTime}
        </div>
        <p className="text-center text-gray-500 text-sm">
          {status == "FINISHED" ? "Final Time" : "Time Remaining"}
        </p>
      </div>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0:00</span>
          <span>{duration}:00</span>
        </div>
      </div>

      {isExpired && status == "ONGOING" && (
        <p className="mt-3 text-center text-sm text-gray-600">
          Time&apos;s up! Please end the quiz.
        </p>
      )}

      {status == "FINISHED" && (
        <p className="mt-3 text-center text-sm text-green-600 font-medium">
          Quiz completed successfully!
        </p>
      )}
    </motion.div>
  );
}

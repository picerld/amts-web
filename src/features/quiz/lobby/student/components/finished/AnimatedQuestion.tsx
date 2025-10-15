import { IAnswer } from "@/types/answer";
import { IQuestion } from "@/types/question";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRef } from "react";

export default function AnimatedQuestion({
  question,
  qIndex,
  getUserAnswer,
  isCorrectAnswer,
}: {
  question: IQuestion;
  qIndex: number;
  getUserAnswer: (questionId: number) => number | undefined;
  isCorrectAnswer: (questionId: number) => boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const userAnswerIndex = getUserAnswer(question.id);
  const isCorrect = isCorrectAnswer(question.id);
  const correctAnswer = question.answers?.find((a) => a.isTrue);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 50, scale: 0.95 }
      }
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
        isCorrect
          ? "border-green-500"
          : userAnswerIndex === undefined
          ? "border-gray-400"
          : "border-red-500"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-start gap-3 mb-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.4, delay: 0.3, type: "spring" }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isCorrect
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {qIndex + 1}
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {question.question}
          </h3>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={
            isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }
          }
          transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          )}
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        {question.answers?.map((answer, aIndex) => {
          const isUserAnswer = userAnswerIndex === aIndex;
          const isCorrectOption = answer.id === correctAnswer?.id;

          return (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.4, delay: 0.3 + aIndex * 0.1 }}
              className={`p-4 rounded-lg border-2 transition ${
                isCorrectOption
                  ? "bg-green-50 border-green-500"
                  : isUserAnswer && !isCorrect
                  ? "bg-red-50 border-red-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.4 + aIndex * 0.1,
                    type: "spring",
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${
                    isCorrectOption
                      ? "bg-green-500 text-white"
                      : isUserAnswer && !isCorrect
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {String.fromCharCode(65 + aIndex)}
                </motion.div>
                <p
                  className={`flex-1 ${
                    isCorrectOption || (isUserAnswer && !isCorrect)
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  {answer.text}
                </p>
                {isCorrectOption && (
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -90 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + aIndex * 0.1,
                      type: "spring",
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  </motion.div>
                )}
                {isUserAnswer && !isCorrect && (
                  <motion.div
                    initial={{ scale: 0, rotate: 90 }}
                    animate={
                      isInView
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: 90 }
                    }
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + aIndex * 0.1,
                      type: "spring",
                    }}
                  >
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className={`mt-4 p-3 rounded-lg ${
          isCorrect ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <p
          className={`text-sm font-medium ${
            isCorrect ? "text-green-800" : "text-red-800"
          }`}
        >
          {isCorrect
            ? "✓ Correct Answer!"
            : userAnswerIndex != null && userAnswerIndex >= 0
            ? `✗ Your answer is: ${String.fromCharCode(
                65 + userAnswerIndex
              )} | Correct answer: ${String.fromCharCode(
                65 +
                  (question.answers?.findIndex((a: IAnswer) => a.isTrue) || 0)
              )}`
            : "❗ You didn't answer this question"}
        </p>
      </motion.div>
    </motion.div>
  );
}
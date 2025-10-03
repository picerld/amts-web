import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { IQuestion } from "@/types/question";

interface QuestionCardProps {
  question: IQuestion;
  questionIndex: number;
  selectedAnswer: number | undefined;
  onSelectAnswer: (answerIndex: number) => void;
  animationDelay: number;
}

export const QuestionCard = ({
  question,
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  animationDelay,
}: QuestionCardProps) => {
  const isAnswered = selectedAnswer !== undefined;
  const correctAnswerIndex =
    question.answers?.findIndex((answer) => answer.isTrue) ?? -1;
  const isCorrectAnswer = selectedAnswer === correctAnswerIndex;

  return (
    <motion.div
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: animationDelay }}
    >
      <div className="flex gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
          {questionIndex + 1}
        </div>
        <p className="text-gray-800 font-medium leading-relaxed pt-1">
          {question.question}
        </p>
      </div>

      <div className="space-y-2">
        {question.answers?.map((answer, aIndex) => {
          const optionLabel = String.fromCharCode(65 + aIndex);
          const isSelected = selectedAnswer === aIndex;
          const isCorrect = answer.isTrue;
          const showCorrect = isAnswered && isCorrect;
          const showWrong = isAnswered && isSelected && !isCorrect;

          return (
            <button
              key={aIndex}
              onClick={() => !isAnswered && onSelectAnswer(aIndex)}
              disabled={isAnswered}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                isAnswered
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:shadow-md hover:border-gray-300"
              } ${
                showCorrect
                  ? "bg-green-50 border-green-400"
                  : showWrong
                  ? "bg-red-50 border-red-400"
                  : isSelected
                  ? "bg-blue-50 border-blue-400"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  showCorrect
                    ? "bg-green-500 text-white"
                    : showWrong
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {optionLabel}
              </div>
              <p
                className={`text-sm text-left flex-1 ${
                  showCorrect
                    ? "text-green-800 font-medium"
                    : showWrong
                    ? "text-red-800"
                    : isSelected
                    ? "text-blue-800"
                    : "text-gray-700"
                }`}
              >
                {answer.text}
              </p>
              {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.div
          className={`mt-4 p-3 rounded-lg ${
            isCorrectAnswer ? "bg-green-100" : "bg-red-100"
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p
            className={`text-sm font-medium ${
              isCorrectAnswer ? "text-green-800" : "text-red-800"
            }`}
          >
            {isCorrectAnswer ? "✓ Jawaban Benar!" : "✗ Jawaban Salah!"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
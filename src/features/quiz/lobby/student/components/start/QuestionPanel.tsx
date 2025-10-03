import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { IQuestion } from "@/types/question";
import { QuestionCard } from "./QuestionCard";
import { ButtonQuiz } from "@/features/quiz/components/ui/button-quiz";

interface QuestionsPanelProps {
  questions: IQuestion[];
  selectedAnswers: Record<number, number>;
  onSelectAnswer: (questionIndex: number, answerIndex: number) => void;
  onReset: () => void;
}

export const QuestionsPanel = ({
  questions,
  selectedAnswers,
  onSelectAnswer,
  onReset,
}: QuestionsPanelProps) => {
  const getCorrectAnswerIndex = (question: IQuestion) => {
    return question.answers?.findIndex((answer) => answer.isTrue) ?? -1;
  };

  const calculateScore = () => {
    return questions.reduce((score, question, qIndex) => {
      const correctIndex = getCorrectAnswerIndex(question);
      return score + (selectedAnswers[qIndex] === correctIndex ? 1 : 0);
    }, 0);
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6 shadow-sm"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.45 }}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-800">Soal dan Jawaban</h3>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {questions.map((question, qIndex) => (
          <QuestionCard
            key={qIndex}
            question={question}
            questionIndex={qIndex}
            selectedAnswer={selectedAnswers[qIndex]}
            onSelectAnswer={(answerIndex) =>
              onSelectAnswer(qIndex, answerIndex)
            }
            animationDelay={0.5 + qIndex * 0.1}
          />
        ))}
      </div>

      <ButtonQuiz
        onClick={onReset}
        variant={"abort"}
        className="w-full mt-5"
      >
        Reset!
      </ButtonQuiz>

      {Object.keys(selectedAnswers).length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-white rounded-xl border border-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Progres:</span>
            <span className="text-blue-600 font-bold">
              {Object.keys(selectedAnswers).length} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  (Object.keys(selectedAnswers).length / questions.length) * 100
                }%`,
              }}
            />
          </div>

          {Object.keys(selectedAnswers).length === questions.length && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Skor:</span>
                <span className="text-lg font-bold text-blue-600">
                  {calculateScore()} / {questions.length}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
import { useState, useEffect } from "react";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import { GameHero } from "../components/GameHero";
import GameLayoutContainer from "../components/GameLayoutContainer";

export default function ExamPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showStudents, setShowStudents] = useState<boolean>(false);
  const [typewriterText, setTypewriterText] = useState<string>("");
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  const fullText =
    "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const studentsTimer = setTimeout(() => {
        setShowStudents(true);
      }, 900);

      return () => clearTimeout(studentsTimer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (showStudents && !isLoading) {
      const typewriterTimer = setTimeout(() => {
        let i = 0;
        const typing = setInterval(() => {
          if (i < fullText.length) {
            setTypewriterText(fullText.slice(0, i + 1));
            i++;
          } else {
            clearInterval(typing);
            setTimeout(() => setShowButtons(true), 500);
          }
        }, 50);

        return () => clearInterval(typing);
      }, 300);

      return () => clearTimeout(typewriterTimer);
    }
  }, [showStudents, fullText, isLoading]);

  return (
    <>
      <HeadMetaData title="Exams" />
      <GameLayoutContainer
        isLoading={isLoading}
        loadingProgress={loadingProgress}
      >
        <GameHero
          showStudents={showStudents}
          showButtons={showButtons}
          typewriterText={typewriterText}
        />
      </GameLayoutContainer>
    </>
  );
}

import { useState, useEffect } from "react";
import { HeadMetaData } from "@/components/meta/HeadMetaData";
import GameLayoutContainer from "../../components/GameLayoutContainer";

export default function ExamPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

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

  return (
    <>
      <HeadMetaData title="Exams" />
      <GameLayoutContainer
        isLoading={isLoading}
        loadingProgress={loadingProgress}
      >
        test
      </GameLayoutContainer>
    </>
  );
}

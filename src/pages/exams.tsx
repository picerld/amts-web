import { PageContainer } from "@/components/container/PageContainer";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

export default function ExamPage() {
  const [showStudents, setShowStudents] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [showButtons, setShowButtons] = useState(false);

  const fullText =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus delectus voluptatem recusandae explicabo accusantium culpa magni impedit harum, veniam ullam atque repellat, sit optio consectetur eveniet nisi dignissimos, ad maxime!";

  useEffect(() => {
    const studentsTimer = setTimeout(() => {
      setShowStudents(true);
    }, 900);

    return () => clearTimeout(studentsTimer);
  }, []);

  useEffect(() => {
    if (showStudents) {
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
        }, 30);

        return () => clearInterval(typing);
      }, 300);

      return () => clearTimeout(typewriterTimer);
    }
  }, [showStudents, fullText]);

  return (
    <PageContainer withFooter={false}>
      <div className="w-full flex items-center justify-center min-h-screen">
        <motion.div
          className="flex flex-col max-w-5xl gap-5 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="font-extrabold tracking-tighter text-[5rem] text-center flex justify-center gap-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "backOut", delay: 0.2 }}
            >
              Welcome
            </motion.div>

            {showStudents && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "backOut" }}
              >
                Students
              </motion.div>
            )}
          </div>

          <div className="text-lg text-pretty text-center min-h-[4rem]">
            {typewriterText}
            <motion.span
              className="inline-block w-0.5 h-6 bg-current ml-1"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              |
            </motion.span>
          </div>

          {showButtons && (
            <motion.div
              className="flex gap-5 pt-10 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, staggerChildren: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  delay: 0.1,
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                whileHover={{
                  scale: 1.15,
                }}
                whileTap={{ scale: 0.9 }}
                className="relative group cursor-pointer"
              >
                <Button
                  className="relative px-20 py-8 text-3xl font-bold rounded-2xl overflow-hidden
                   bg-gradient-to-b from-[var(--main)] to-[color-mix(in srgb,var(--main)_70%,black)]
                   text-main-foreground border-4 border-[var(--main)]
                   transition-all duration-300 group-hover:border-[color-mix(in srgb,var(--main)_120%,white)]"
                >
                  <motion.div
                    className="absolute inset-0 bg-[var(--main)]"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                    animate={{ x: [-100, 100] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  <span className="relative z-10 drop-shadow-lg">Start!</span>

                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-[var(--main)] blur-xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  delay: 0.3,
                  scale: {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                whileHover={{
                  scale: 1.1,
                  rotateY: [0, 5, -5, 0],
                  transition: {
                    scale: { duration: 0.2 },
                    rotateY: { duration: 0.4, repeat: Infinity },
                  },
                }}
                whileTap={{ scale: 0.9 }}
                className="relative group cursor-pointer"
              >
                <Button
                  className="relative px-20 py-8 text-3xl font-bold rounded-2xl overflow-hidden
                   bg-gradient-to-b from-gray-600 to-black text-white
                   border-4 border-gray-500 group-hover:border-gray-300
                   transition-all duration-300"
                >
                  <motion.div
                    className="absolute inset-0 bg-gray-400"
                    animate={{
                      opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <span className="relative z-10 drop-shadow-lg">Exit</span>

                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gray-400 blur-xl"
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}

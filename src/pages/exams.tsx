import { PageContainer } from "@/components/container/PageContainer";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function ExamPage() {
  return (
    <PageContainer withFooter={false}>
      <div className="w-full flex items-center justify-center min-h-screen">
        <motion.div
          className="flex flex-col max-w-4xl gap-5 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="font-extrabold text-[5rem] text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "backOut", delay: 0.2 }}
          >
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "backOut", delay: 0.4 }}
              className="bg-main px-2 rounded-xl text-main-foreground"
            >
              Welcome
            </motion.span>{" "}
            Student!
          </motion.h1>

          <motion.p
            className="text-lg text-pretty text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus
            delectus voluptatem recusandae explicabo accusantium culpa magni
            impedit harum, veniam ullam atque repellat, sit optio consectetur
            eveniet nisi dignissimos, ad maxime!
          </motion.p>

          <motion.div
            className="flex gap-5 pt-10 justify-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 1 },
              },
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Button className="px-20 py-8 text-3xl font-bold">
                Start!
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Button className="px-20 py-8 text-3xl font-bold">Exit</Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PageContainer>
  );
}

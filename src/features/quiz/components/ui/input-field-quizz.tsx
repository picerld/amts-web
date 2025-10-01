"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import * as React from "react";

interface InputFieldQuizzProps extends HTMLMotionProps<"input"> {
  className?: string;
}

export const InputFieldQuizz = ({
  className,
  type = "text",
  ...props
}: InputFieldQuizzProps) => {
  return (
    <motion.input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-xl border-2 border-blue-500 bg-white text-gray-800",
        "shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400",
        "placeholder-slate-800/70 font-semibold tracking-wide px-3 py-5",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      whileFocus={{ scale: 1.03 }}
      whileHover={{ scale: 1.02 }}
      {...props}
    />
  );
};

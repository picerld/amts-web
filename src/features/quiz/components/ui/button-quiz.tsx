"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonQuizVariants = cva(
  "inline-flex items-center cursor-pointer justify-center font-semibold gap-2 rounded-xl [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3",
        softPrimary:
          "bg-blue-200 border border-blue-400 hover:bg-blue-300 text-blue-600 py-3 flex-1",
        softDarkPrimary:
          "bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-500/40 py-3 flex-1",
        secondary:
          "bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 justify-center",
        secondaryGray:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-3 justify-center",
        start:
          "bg-green-100 text-green-700 border border-green-300 py-3 flex-1 shadow-inner hover:bg-green-200",
        completed:
          "bg-green-100 text-green-700 border border-green-300 py-3 flex-1 shadow-inner",
        abort:
          "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3",
        softAbort:
          "bg-red-200 border border-red-400 hover:bg-red-300 text-red-600 py-3 flex-1",
      },
      size: {
        default: "",
        sm: "text-sm px-3 py-2",
        lg: "text-lg px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface ButtonQuizProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonQuizVariants> {
  icon?: LucideIcon;
  asChild?: boolean;
}

export function ButtonQuiz({
  className,
  variant,
  size,
  icon: Icon,
  asChild = false,
  disabled,
  children,
  onClick,
  ...props
}: ButtonQuizProps) {
  const isCompleted = variant === "completed";

  const Comp = asChild ? Slot : isCompleted ? motion.div : motion.button;

  const clickHandler =
    !isCompleted && !disabled
      ? (onClick as React.MouseEventHandler<HTMLButtonElement>)
      : undefined;

  return (
    <Comp
      {...(!isCompleted ? { onClick: clickHandler } : {})}
      className={cn(buttonQuizVariants({ variant, size, className }))}
      whileHover={!isCompleted ? { scale: 1.05 } : undefined}
      whileTap={!isCompleted ? { scale: 0.95 } : undefined}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </Comp>
  );
}

export { buttonQuizVariants };

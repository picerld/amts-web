"use client";

import { useState } from "react";
import { ButtonQuiz } from "../ui/button-quiz";
import { Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QuizConfirmDialogProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;

  mode?: "dark" | "light";
  contentClassName?: string;
  footerClassName?: string;
}

export function QuizConfirmDialog({
  trigger,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes, Confirm",
  cancelText = "No, Cancel",
  onConfirm,
  mode = "dark",
  contentClassName,
  footerClassName,
}: QuizConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const isDark = mode === "dark";
  const contentClasses = isDark
    ? `bg-[#0A0F1F] border border-blue-500/30 shadow-[0_0_25px_rgba(0,123,255,0.25)] text-white rounded-xl`
    : `bg-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-gray-900 rounded-xl`;

  const iconWrapperClasses = isDark
    ? "p-4 bg-[rgba(0,123,255,0.25)] rounded-full mb-2"
    : "p-4 bg-blue-100 rounded-full mb-2";

  const titleClasses = isDark
    ? "text-blue-400 font-bold text-2xl tracking-wide"
    : "text-blue-700 font-bold text-2xl tracking-wide";

  const descClasses = isDark
    ? "text-blue-200/70 text-lg"
    : "text-gray-700 text-lg";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className={`${contentClasses} ${contentClassName || ""}`}>
        <AlertDialogHeader className="flex flex-col justify-center items-center">
          <div className={iconWrapperClasses}>
            <Info className={`${isDark ? "text-blue-200" : "text-blue-600"} w-8 h-8`} strokeWidth={2.5} />
          </div>
          <AlertDialogTitle className={titleClasses}>{title}</AlertDialogTitle>
          <AlertDialogDescription className={descClasses}>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className={`flex justify-end gap-3 mt-4 ${footerClassName || ""}`}>
          <ButtonQuiz className="flex-1" onClick={() => setOpen(false)} variant={isDark ? "softDarkPrimary" : "primary"}>
            {cancelText}
          </ButtonQuiz>

          <ButtonQuiz
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            variant={"abort"}
            className="flex-1"
          >
            {confirmText}
          </ButtonQuiz>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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

  contentClassName?: string;
  footerClassName?: string;
}

export function QuizConfirmDialog({
  trigger,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes,Confirm",
  cancelText = "No, Cancel",
  onConfirm,
  contentClassName,
  footerClassName,
}: QuizConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent
        className={`bg-[#0A0F1F] border border-blue-500/30 shadow-[0_0_25px_rgba(0,123,255,0.25)] text-white rounded-xl ${
          contentClassName || ""
        }`}
      >
        <AlertDialogHeader className="flex flex-col justify-center items-center">
          <div className="p-4 bg-[rgba(0,123,255,0.25)] rounded-full mb-2">
            <Info className="text-blue-200 w-8 h-8" strokeWidth={2.5} />
          </div>
          <AlertDialogTitle className="text-blue-400 font-bold text-2xl tracking-wide">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-blue-200/70 text-lg">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter
          className={`flex justify-end gap-3 mt-4 ${footerClassName || ""}`}
        >
          <ButtonQuiz
            onClick={() => setOpen(false)}
            variant={"softDarkPrimary"}
          >
            {cancelText}
          </ButtonQuiz>

          <ButtonQuiz
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            variant={"abort"}
          >
            {confirmText}
          </ButtonQuiz>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

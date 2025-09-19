"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookMarked, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { OnDeleteLoadingDialog } from "@/components/dialog/onDeleteConfirmationDialog";
import { trpc } from "@/utils/trpc";
import { IBank } from "@/types/bank";
import { useRouter } from "next/navigation";

type ActionsCellProps = {
  bank: IBank;
  type: string;
  onEdit: (subject: IBank) => void;
};

export const ActionsCell: React.FC<ActionsCellProps> = ({
  bank,
  type,
  onEdit,
}) => {
  const router = useRouter();

  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const deleteSubject = trpc.bank.delete.useMutation();

  const handleDeleteCourse = async (locationId: number) => {
    try {
      setDeleteStatus("loading");

      await deleteSubject.mutateAsync({ id: locationId });

      setDeleteStatus("success");

      toast.success("Success!!", {
        description: "Subject deleted successfully!",
      });

      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast.error("Oops! Something went wrong", {
        description: error.message,
      });
      setDeleteStatus("error");
    } finally {
      setTimeout(() => setDeleteStatus("idle"), 2000);
    }
  };

  function handleNavigateToQuestion() {
    router.push(`/subjects/${bank.id}/questions`);
    localStorage.setItem("subjectId", bank.id.toString());
  }

  return (
    <div className="flex justify-center gap-3">
      {type == "PG" && (
        <Button variant={"neutral"} onClick={handleNavigateToQuestion}>
          <BookMarked className="size-4" />
        </Button>
      )}

      <Button variant="neutral" onClick={() => onEdit(bank)}>
        <SquarePen className="size-4" />
      </Button>

      <OnDeleteLoadingDialog
        status={deleteStatus}
        handleSubmit={() => handleDeleteCourse(bank.id)}
      />
    </div>
  );
};

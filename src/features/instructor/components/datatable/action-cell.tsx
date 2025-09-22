"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
import { toast } from "sonner";
import { OnDeleteLoadingDialog } from "@/components/dialog/onDeleteConfirmationDialog";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

type ActionsCellProps = {
  user: User;
  onEdit: (subject: User) => void;
};

export const ActionsCell: React.FC<ActionsCellProps> = ({ user, onEdit }) => {
  const router = useRouter();

  const [deleteStatus, setDeleteStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const deleteUser = trpc.users.delete.useMutation();

  const handleDeleteInstructor = async (userId: string) => {
    try {
      setDeleteStatus("loading");

      await deleteUser.mutateAsync(userId);

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

  return (
    <div className="flex justify-center gap-3">
      <Button variant="neutral" onClick={() => onEdit(user)}>
        <SquarePen className="size-4" />
      </Button>

      <OnDeleteLoadingDialog
        status={deleteStatus}
        handleSubmit={() => handleDeleteInstructor(user.id)}
      />
    </div>
  );
};

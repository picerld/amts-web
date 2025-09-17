"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const ForgotPasswordContainer = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="flex justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <p className="cursor-pointer text-sm font-semibold">Lupa Password?</p>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Lupa Password</DialogTitle>
            <DialogDescription>
              Oops! Sepertinya kamu lupa password. Tidak perlu khawatir, kami
              akan membantu.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label className="text-base font-bold">Username Kamu</Label>
            <Input type="text" />
          </div>
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="neutral">Tidak, Batal</Button>
            </DialogClose>
            <Button
              onClick={() => {
                toast.success("Yeay! Mohon ditunggu", {
                  description:
                    "Kami akan menghubungi admin untuk mereset password.",
                });

                setOpen((state) => !state);
              }}
              type="submit"
            >
              Ya, Kirim!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

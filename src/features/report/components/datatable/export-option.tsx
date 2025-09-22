import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Table } from "@tanstack/react-table";
import React from "react";
import { DatePickerInput } from "@/components/DatePickerInput";
import { Download, Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { FormCombobox } from "@/components/ui/form-combobox";

export function ExportOption<TData>({
  table,
}: {
  readonly table: Table<TData>;
}) {
  const now = new Date();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(now);

  const [value, setValue] = React.useState("");

  const { data: subjects } = trpc.bank.getAll.useQuery();

  const exportCSV = trpc.userGrade.exportCsv.useMutation();

  const handleDownloadCSV = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const csvData = await exportCSV.mutateAsync({
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString() ?? new Date().toISOString(),
        bankId: Number(value),
      });

      const blob = new Blob([csvData.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", csvData.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download CSV:", error);
      toast.error("Oops, Something went wrong!", {
        description: "Try again later!",
      });
    } finally {
      setIsLoading(false);
      setStartDate(undefined);
      setEndDate(now);
    }
  };

  const subjectsArray = [
    ...(subjects ?? []).map((subject) => ({
      label: `${subject.title} (${subject.type} - ${subject.category})`,
      value: subject.id.toString(),
    })),
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"sm"} variant={"default"}>
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Users Grade</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="noShadow"
                className="hover:border-border w-full justify-start border-transparent px-2.5 shadow-none"
              >
                CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <form onSubmit={handleDownloadCSV}>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    Download as CSV
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    You can find what you are looking for by downloading as CSV
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-5 space-y-5">
                  <Label htmlFor="subject">Subject</Label>
                  <FormCombobox
                    value={value}
                    onChange={setValue}
                    options={subjectsArray}
                    placeholder="Select subject..."
                  />
                  <Label htmlFor="date">Start Date</Label>
                  <DatePickerInput
                    disabled={isLoading}
                    value={startDate}
                    onChange={setStartDate}
                  />
                  <Label htmlFor="date">End Date</Label>
                  <DatePickerInput
                    disabled={isLoading}
                    value={endDate}
                    onChange={setEndDate}
                  />
                </div>
                <DialogFooter className="mt-10">
                  <DialogClose asChild>
                    <Button
                      disabled={isLoading}
                      variant="neutral"
                      className="py-5"
                    >
                      No, Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5"
                  >
                    {isLoading ? (
                      <Loader
                        className="!size-5 animate-spin"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <Download className="!size-5" strokeWidth={2.5} />
                    )}
                    {isLoading ? "Downloading..." : "Yes, Download it!"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

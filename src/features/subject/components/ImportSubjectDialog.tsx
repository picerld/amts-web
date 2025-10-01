"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Upload, FileDown } from "lucide-react";

interface ImportSubjectDialogProps {
  onImport: (
    file: File,
    type: "PG" | "EX",
    category: "NORMAL" | "EMERGENCY"
  ) => void;
}

export default function ImportSubjectDialog({
  onImport,
}: ImportSubjectDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [type, setType] = React.useState<"PG" | "EX">("PG");
  const [category, setCategory] = React.useState<"NORMAL" | "EMERGENCY">(
    "NORMAL"
  );

  const handleDownloadTemplate = (format: "xlsx" | "csv") => {
    const ws = XLSX.utils.aoa_to_sheet([["title"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    if (format === "xlsx") {
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(blob, "subject-template.xlsx");
    } else {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "subject-template.csv");
    }
  };

  const handleSubmit = () => {
    if (file) {
      onImport(file, type, category);
      setOpen(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="neutral" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import Subject
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-3xl">Import Subjects</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Upload File (.xlsx or .csv)</Label>
          <Input
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="space-y-2">
          <Label>Download Template</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="neutral"
                className="flex items-center gap-2 w-full"
              >
                <FileDown className="h-4 w-4" />
                Download Template
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDownloadTemplate("xlsx")}>
                XLSX
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadTemplate("csv")}>
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(val) => setType(val as "PG" | "EX")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PG">PG</SelectItem>
              <SelectItem value="EX">EX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(val) => setCategory(val as "NORMAL" | "EMERGENCY")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">NORMAL</SelectItem>
              <SelectItem value="EMERGENCY">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="neutral" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

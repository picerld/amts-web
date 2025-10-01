"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/datatable/data-table-view-option";
import { Loader } from "lucide-react";
import ImportSubjectDialog from "../ImportSubjectDialog";
import { trpc } from "@/utils/trpc";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search: string;
  isLoading: boolean;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search,
  isLoading,
  handleSearch,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const importMutation = trpc.bank.import.useMutation();

  const handleImport = async (
    file: File,
    type: "PG" | "EX",
    category: "NORMAL" | "EMERGENCY"
  ) => {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const response = await importMutation.mutateAsync({
      filename: file.name,
      fileBase64: base64,
      type,
      category,
      userId: Cookies.get("user.id") ?? "",
    });

    toast.success("Success!!", {
      description: `${response.createdCount} rows imported successfully!`,
    });

    table.reset();

    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <>
      <div className="flex items-center justify-between pb-5">
        <Input
          placeholder="Search your subject..."
          value={search}
          onChange={handleSearch}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <ImportSubjectDialog onImport={handleImport} />
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className="rounded-md border-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="even:bg-main/10 bg-white/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className=" py-3" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Oops, no data found!
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <Loader className="animate-spin size-6" />
              <p className="ml-2 text-base font-normal">Loading ...</p>
            </div>
          )}
        </Table>
      </div>
    </>
  );
}

"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { IUserGrade } from "@/types/userGrade";
import { Button } from "@/components/ui/button";

export function columns(meta: {
  page: number;
  perPage: number;
}): ColumnDef<IUserGrade>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="mr-2"
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: () => <div className="text-left font-semibold text-base">#</div>,
      cell: ({ row }) => (
        <p className="text-center">
          {meta
            ? (meta.page - 1) * meta.perPage + row.index + 1
            : row.index + 1}
        </p>
      ),
    },
    {
      accessorKey: "user.username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
    },
    {
      accessorKey: "bank.title",
      header: () => (
        <div className="text-left text-base font-semibold">Subject</div>
      ),
      cell: ({ row }) => {
        return <p className="text-pretty text-sm">{row.original.bank.title}</p>;
      },
    },
    {
      accessorKey: "bank.category",
      header: () => (
        <div className="text-left text-base font-semibold">Category</div>
      ),
      cell: ({ row }) => {
        return <Badge variant={"default"}>{row.original.bank.category}</Badge>;
      },
    },
    {
      accessorKey: "bank.type",
      header: () => (
        <div className="text-left text-base font-semibold">Type of Subject</div>
      ),
      cell: ({ row }) => {
        return <Badge variant={"neutral"}>{row.original.bank.type}</Badge>;
      },
    },
    {
      accessorKey: "grade",
      header: () => (
        <div className="text-left text-base font-semibold">Grade</div>
      ),
      cell: ({ row }) => {
        return <p className="text-pretty text-sm font-bold">{row.original.grade}</p>;
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="text-left text-base font-semibold">Created At</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-justify text-pretty">
            {row.original.createdAt?.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: () => (
        <div className="text-center text-base font-semibold">Actions</div>
      ),
      cell: ({ row }) => {
        const bank = row.original;

        return (
          <Button variant={"neutral"}>
            <Info />
          </Button>
        );
      },
    },
  ];
}

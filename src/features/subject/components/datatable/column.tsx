"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import { ActionsCell } from "./action-cell";
import { IBank } from "@/types/bank";
import { Badge } from "@/components/ui/badge";

export function columns(
  onEdit: (bank: IBank) => void,
  meta: {
    page: number;
    perPage: number;
  }
): ColumnDef<IBank>[] {
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
    },
    {
      accessorKey: "user.username",
      header: () => (
        <div className="text-left text-base font-semibold">Created By</div>
      ),
      cell: ({ row }) => {
        return <div className="text-justify text-pretty">Admin</div>;
      },
    },
    {
      accessorKey: "category",
      header: () => (
        <div className="text-left text-base font-semibold">Category</div>
      ),
      cell: ({ row }) => {
        return <Badge variant={"default"}>{row.original.category}</Badge>;
      },
    },
    {
      accessorKey: "type",
      header: () => (
        <div className="text-left text-base font-semibold">Type of Subject</div>
      ),
      cell: ({ row }) => {
        return <Badge variant={"neutral"}>{row.original.type}</Badge>;
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

        return <ActionsCell bank={bank} type={bank.type} onEdit={onEdit} />;
      },
    },
  ];
}

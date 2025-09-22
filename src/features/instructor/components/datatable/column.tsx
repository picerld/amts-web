"use client";

import { DataTableColumnHeader } from "@/components/datatable/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import { ActionsCell } from "./action-cell";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user";

export function columns(
  onEdit: (user: User) => void,
  meta: {
    page: number;
    perPage: number;
  }
): ColumnDef<User>[] {
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
      accessorKey: "username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "_count.Bank",
      header: () => (
        <div className="text-left text-base font-semibold">Total Subject</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-justify text-pretty">
            {row.original._count.Bank}
          </div>
        );
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
        const user = row.original;

        return <ActionsCell user={user} onEdit={onEdit} />;
      },
    },
  ];
}

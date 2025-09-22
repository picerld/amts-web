"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import React from "react";

type DatePickerInputProps = {
  value?: Date;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
};

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="neutral"
            size={"sm"}
            id="date"
            className="flex items-center justify-start text-sm"
          >
            <CalendarDays className="mr-2 !size-6" />
            {value ? formatDate(value) : "DD/MM/YYYY"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            disabled={disabled}
            mode="single"
            selected={value}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
              console.log(date);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

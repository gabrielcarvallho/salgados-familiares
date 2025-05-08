"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Locale } from "date-fns";
import { CalendarIcon } from "lucide-react";

/**
 * Props for the DatePicker component
 */
export interface DatePickerProps {
  /** Date string in yyyy-mm-dd format */
  value: string;
  /** Callback function when date changes */
  onChange: (date: string) => void;
  /** Optional label for the date picker */
  label?: string;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Additional classes for the container */
  className?: string;
  /** Additional classes for the button */
  buttonClassName?: string;
  /** Additional classes for the dropdown content */
  dropdownClassName?: string;
  /** Format for the displayed date using date-fns format string */
  dateFormat?: string;
  /** Whether the date picker is disabled */
  disabled?: boolean;
  /** Whether the date picker is required */
  required?: boolean;
  /** Locale object from date-fns */
  locale?: Locale;
  /** Error message to display */
  errorMessage?: string;
  /** Callback function when the date picker loses focus */
  onBlur?: () => void;
  /** ID for the input element */
  id?: string;
  /** Name for the input element */
  name?: string;
}

/**
 * DatePicker component that formats dates in yyyy-mm-dd format
 */
export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Selecione uma data",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  dateFormat = "PPP",
  disabled = false,
  required = false,
  locale = ptBR,
  errorMessage,
  onBlur,
  id,
  name,
}: DatePickerProps) {
  // Format the date for display in the button
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) {
      return placeholder;
    }

    try {
      // Parse the ISO date string
      const date = parseISO(dateString);
      // Format using date-fns with provided locale
      return format(date, dateFormat, { locale });
    } catch (error) {
      console.error("Invalid date format:", error);
      return "Data inválida";
    }
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  return (
    <div className={cn("flex flex-col gap-2 my-2", className)}>
      {label && (
        <label className="text-sm font-bold" htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <DropdownMenu onOpenChange={(open: boolean) => !open && handleBlur()}>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            name={name}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full text-left font-normal ",
              "flex justify-start", // flex to align icon
              !value && "text-gray-500",
              errorMessage && "border-red-500",
              buttonClassName
            )}
            aria-required={required}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {formatDate(value)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn("p-0", dropdownClassName)}>
          <Calendar
            locale={locale}
            mode="single"
            selected={value ? parseISO(value) : undefined}
            onSelect={(date) => {
              if (!date) return;
              const iso = date.toISOString().split("T")[0];
              onChange(iso);
            }}
            initialFocus
            // desabilita sábado(6) e domingo(0)
            disabled={(date: Date) => {
              const d = date.getDay();
              return d === 0 || d === 6;
            }}
            className="[&_[aria-selected='true']]:bg-[#FF8F3F] [&_[aria-selected='true']]:text-white"
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}

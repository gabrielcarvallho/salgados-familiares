// This is a wrapper component that helps with select defaults
import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SafeSelectProps {
  value: any;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SafeSelect({
  value,
  onValueChange,
  options,
  placeholder = "Selecione",
  disabled = false,
  className = "",
}: SafeSelectProps) {
  // Convert value to string and handle undefined/null cases
  const [safeValue, setSafeValue] = useState<string>("");
  
  // Set the safe value whenever the original value changes
  useEffect(() => {
    // Ensure we always have a string, even if value is null/undefined
    const stringValue = value === null || value === undefined ? "" : String(value);
    setSafeValue(stringValue);
  }, [value]);
  
  // Ensure options are always available
  const safeOptions = options || [];
  
  // Check if the current value is valid (exists in options)
  const isValidValue = safeValue && safeOptions.some(opt => String(opt.value) === safeValue);
  
  // If value isn't valid and we have options, set to first option as default
  useEffect(() => {
    if (!isValidValue && safeOptions.length > 0 && !safeValue && value !== "") {
      const defaultValue = String(safeOptions[0].value);
      console.log("Setting default value:", defaultValue);
      setSafeValue(defaultValue);
      onValueChange(defaultValue);
    }
  }, [safeValue, safeOptions, isValidValue, onValueChange, value]);

  return (
    <Select
      value={safeValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {safeOptions.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
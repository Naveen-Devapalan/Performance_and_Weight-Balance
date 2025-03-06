import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  tooltip?: string;
  required?: boolean;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  min,
  max,
  step,
  units,
  tooltip,
  required = false
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'number' ? 
      (e.target.value === '' ? '' : Number(e.target.value)) : 
      e.target.value;
    onChange(value);
  };

  // Use label as placeholder if no placeholder is provided
  const displayPlaceholder = placeholder || `Enter ${label.toLowerCase()}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {tooltip && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className="inline-flex items-center">
                <Info className="h-4 w-4 text-muted-foreground" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{tooltip}</p>
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <div className="relative">
        <Input
          type={type}
          id={id}
          value={value || ''}
          onChange={handleChange}
          placeholder={displayPlaceholder}
          min={min}
          max={max}
          step={step}
          className={`
            ${type === 'number' ? 'font-mono tabular-nums text-right pr-12' : ''}
            ${error ? 'border-destructive' : ''}
            ${!value ? 'text-muted-foreground' : ''}
          `}
        />
        {units && (
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground text-sm">
            {units}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
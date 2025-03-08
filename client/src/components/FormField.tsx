import React from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  units?: string;
  error?: string;
  tooltip?: string;
  required?: boolean;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
  units,
  error,
  tooltip,
  required,
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = type === 'number' ? e.target.valueAsNumber : e.target.value;
    onChange(value);
  };

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label 
            htmlFor={id}
            className={`${error ? 'text-destructive' : ''} transition-colors duration-200 group-hover:text-foreground/90`}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {tooltip && (
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help hover:text-blue-500 transition-colors" />
              </HoverCardTrigger>
              <HoverCardContent 
                className="w-80 text-sm shadow-lg border-slate-200 backdrop-blur-sm" 
                side="top"
                align="start"
              >
                {tooltip}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        {units && (
          <span className="text-sm text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
            {units}
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            ${type === 'number' ? 'font-mono tabular-nums text-right pr-3' : ''}
            ${error ? 'border-destructive' : ''}
            transition-all duration-200
            focus-visible:ring-1 focus-visible:ring-ring focus-visible:shadow-sm
            hover:border-input
            group-hover:border-slate-300 dark:group-hover:border-slate-700
          `}
        />
        {error && (
          <div className="absolute -bottom-5 left-0 text-xs text-destructive animate-in fade-in-50 slide-in-from-top-1 font-medium">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
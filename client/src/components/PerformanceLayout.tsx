'use client';

import React, { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackgroundPattern } from './BackgroundPattern';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  date?: string;
}

interface SectionProps {
  children: ReactNode;
  title: string;
  description?: ReactNode; // Changed from string to ReactNode to allow JSX
}

export function PerformanceLayout({ children, title }: LayoutProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <BackgroundPattern className="absolute inset-0 -z-10 opacity-40" />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-[700px] text-sm sm:text-base">
              Calculate aircraft performance parameters with precision and accuracy
            </p>
          </div>
          <div className="w-full max-w-4xl rounded-xl border bg-card/95 backdrop-blur-sm shadow-md transition-all hover:shadow-lg">
            <div className="p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PerformanceInputSection({ children, title, description }: SectionProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card/50 p-5 backdrop-blur-sm sm:p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      <Separator className="my-2" />
      <div className="grid gap-5 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

export function PerformanceOutputSection({ children, title, description }: SectionProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card/50 p-5 backdrop-blur-sm animate-in fade-in-50 duration-300 sm:p-6 shadow-sm transition-all">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        {description && (
          <div className="text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      <Separator className="my-2" />
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FieldValueProps {
  label: string;
  value: string | number;
  units?: string;
  output?: boolean;
}

export function FieldValue({ label, value, units, output = false }: FieldValueProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 px-2 rounded transition-colors">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums text-sm ${output ? 'font-semibold' : ''}`}>
        {value}
        {units && <span className="ml-1 text-muted-foreground">{units}</span>}
      </span>
    </div>
  );
}
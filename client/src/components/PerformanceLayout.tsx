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
    <>
      <BackgroundPattern />
      <div className="relative container max-w-5xl mx-auto p-4 space-y-6 pb-20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500">
            {title}
          </h1>
          <h2 className="text-xl font-semibold text-zinc-700">TECNAM P2008JC</h2>
          <Separator className="my-4" />
        </div>
        {children}
      </div>
    </>
  );
}

export function PerformanceInputSection({ children, title, description }: SectionProps) {
  return (
    <Card className="border-zinc-200 shadow-sm backdrop-blur-sm bg-white/80">
      <CardHeader className="bg-zinc-50/80 border-b border-zinc-100">
        <CardTitle className="text-xl text-zinc-900">{title} - [USER INPUTS]</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceOutputSection({ children, title, description }: SectionProps) {
  return (
    <Card className="border-zinc-200 shadow-sm backdrop-blur-sm bg-white/80">
      <CardHeader className="bg-zinc-50/80 border-b border-zinc-100">
        <CardTitle className="text-xl text-zinc-900">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
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
    <div className={`${output ? 'bg-zinc-50/80 border border-zinc-100' : ''} p-3 rounded-md`}>
      <label className="block text-sm font-medium text-zinc-700">{label}</label>
      <div className="mt-1">
        {value ? (
          <>
            <span className="text-lg font-semibold text-zinc-900 font-mono tabular-nums">{value}</span>
            {units && <span className="text-sm text-zinc-600 ml-1">{units}</span>}
          </>
        ) : (
          <span className="text-sm text-zinc-500 italic">Not specified</span>
        )}
      </div>
    </div>
  );
}
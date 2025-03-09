'use client';

import React from 'react';
import { PerformanceLayout } from './PerformanceLayout';

interface WeightBalanceLayoutProps {
  children: React.ReactNode;
}

export function WeightBalanceLayout({ children }: WeightBalanceLayoutProps) {
  return (
    <PerformanceLayout title="Weight & Balance Calculator">
      <div className="space-y-8">
        <div className="border-b pb-4 mb-2">
          <p className="text-sm text-muted-foreground text-center italic">
            Precise weight and balance calculations for Tecnam P2008JC (Part 135)
          </p>
        </div>
        {children}
      </div>
    </PerformanceLayout>
  );
}
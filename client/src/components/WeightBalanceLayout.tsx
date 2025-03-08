'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PerformanceLayout } from './PerformanceLayout';

interface WeightBalanceLayoutProps {
  children: React.ReactNode;
}

export function WeightBalanceLayout({ children }: WeightBalanceLayoutProps) {
  return (
    <PerformanceLayout title="W&B CALCULATOR (PART 135) – TECNAM P2008JC">
      <div className="space-y-6">

        {children}
      </div>
    </PerformanceLayout>
  );
}
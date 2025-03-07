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
        <section>
          <h2 className="text-xl font-semibold mb-4">SECTION 1: MINIMUM FUEL REQUIRED</h2>
          <Card className="p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Fuel Item</th>
                  <th className="text-right">Time (hrs)</th>
                  <th className="text-right">Litres (L)</th>
                  <th className="text-right">Weight (KG)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Trip Fuel</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Contingency (10% of A-B)</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Alternate (if applicable)</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Other Fuel</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Reserve (Day/Night)</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Taxi</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr className="font-bold">
                  <td>Minimum fuel required</td>
                  <td className="text-right">{/* Total */}</td>
                  <td className="text-right">{/* Total */}</td>
                  <td className="text-right">{/* Total */}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">SECTION 2: ACTUAL FUEL STATE</h2>
          <Card className="p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Fuel State</th>
                  <th className="text-right">Time (hrs)</th>
                  <th className="text-right">Litres (L)</th>
                  <th className="text-right">Weight (KG)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Actual Dip (Useable)*</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Taxi</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Actual Flight Fuel</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
                <tr>
                  <td>Burn Off</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm mt-2">* NZAA aircraft dipsticks measure useable fuel</p>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">SECTION 3: WEIGHT AND BALANCE</h2>
          <Card className="p-4">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-right">Weight (KG)</th>
                  <th className="text-right">ARM (m)</th>
                  <th className="text-right">Moment (Kgm)</th>
                  <th className="text-right">Max</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Empty Weight</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">-</td>
                </tr>
                <tr>
                  <td>Pilot & Passenger</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">1.800</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">-</td>
                </tr>
                <tr>
                  <td>Fuel Mass</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">2.209</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">-</td>
                </tr>
                <tr>
                  <td>Baggage</td>
                  <td className="text-right">{/* Input field */}</td>
                  <td className="text-right">2.417</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">20 KG</td>
                </tr>
                <tr className="font-bold">
                  <td>Take Off Weight</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">650 KG</td>
                </tr>
                <tr>
                  <td>Burn Off</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">2.209</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">-</td>
                </tr>
                <tr className="font-bold">
                  <td>Landing Weight</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">{/* Calculated */}</td>
                  <td className="text-right">650 KG</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">CONVERSION FACTORS</h2>
          <Card className="p-4">
            <table className="w-full">
              <tbody>
                <tr>
                  <td>US Gal. → Litres (Avgas/Petrol)</td>
                  <td className="text-right">× 3.78</td>
                </tr>
                <tr>
                  <td>US Gal. → KG (Avgas/Petrol)</td>
                  <td className="text-right">× 2.72</td>
                </tr>
                <tr>
                  <td>Litres → KG (Avgas/Petrol)</td>
                  <td className="text-right">× 0.72</td>
                </tr>
                <tr>
                  <td>Imp Gal. → KG (Avgas/Petrol)</td>
                  <td className="text-right">× 3.27</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Centre of Gravity Limits</h2>
          <Card className="p-4">
            <ul className="space-y-2">
              <li>Forward limit: 1.841 m</li>
              <li>Aft limit: 1.978 m</li>
            </ul>
            <p className="mt-2">Aircraft must be within these limits for take-off and landing.</p>
          </Card>
        </section>

        {children}
      </div>
    </PerformanceLayout>
  );
}
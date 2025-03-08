'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { WeightBalanceLayout } from '@/components/WeightBalanceLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  WeightBalanceInputs, 
  WeightBalanceOutput, 
  CONVERSION_FACTORS,
  TAXI_FUEL_LITRES,
  calculateMinimumFuel,
  CG_LIMITS
} from '@/utils/weight-balance';
import { validateWeightBalanceInputs } from '@/utils/validation';
import styles from './styles.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function WeightAndBalancePage() {
  const [inputs, setInputs] = useState<WeightBalanceInputs>({
    emptyWeight: 432.21,
    emptyArm: 1.86,
    pilotWeight: 75,
    passengerWeight: 80,
    // fuelMass is now auto-populated so set an initial dummy value
    fuelMass: 0,
    baggageWeight: 3,
    flightTime: {
      trip: 2.0,
      contingency: 0.42,
      alternate: 0,
      other: 0.2,
      reserve: 0.5,
      // Updated default taxi fuel value to standard 3L
      taxi: 3
    },
    // Added default scenario value
    scenario: 'standard'
  });
  
  const [results, setResults] = useState<WeightBalanceOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof WeightBalanceInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFlightTimeChange = (field: keyof WeightBalanceInputs['flightTime'], value: number) => {
    setInputs(prev => {
      let updatedFlightTime = { ...prev.flightTime, [field]: value };
      // Auto-calculate contingency as 10% of trip fuel when trip time changes
      if (field === 'trip') {
        updatedFlightTime.contingency = Number((value * 0.1).toFixed(2));
      }
      return { ...prev, flightTime: updatedFlightTime };
    });
  };

  // New handler for scenario dropdown
  const handleScenarioChange = (value: string) => {
    setInputs(prev => ({ ...prev, scenario: value }));
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let finalInputs = { ...inputs };
      // For maxFuel scenario, compute fuelMass using allowance logic.
      if (inputs.scenario === 'maxFuel') {
        const { emptyWeight, pilotWeight, passengerWeight, baggageWeight, flightTime } = inputs;
        const totalStatic = emptyWeight + pilotWeight + passengerWeight + baggageWeight;
        const remaining = CG_LIMITS.MAX_TAKEOFF_WEIGHT - totalStatic;
        if (remaining <= 0) {
          setError("Operation not feasible: total weight exceeds maximum takeoff weight.");
          setLoading(false);
          return;
        }
        const absoluteMaxFuel = 120 * CONVERSION_FACTORS.LITRES_TO_KG;
        const fuelMass = remaining > absoluteMaxFuel ? absoluteMaxFuel : remaining;
        finalInputs = { ...inputs, fuelMass };
      } else {
        // Standard scenario: auto-calculate fuel mass from flight time.
        const minFuelLitres = calculateMinimumFuel(inputs);
        const computedFuelMass = Number(((minFuelLitres - inputs.flightTime.taxi) * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
        finalInputs = { ...inputs, fuelMass: computedFuelMass };
      }

      // Run weight and balance validations.
      const validationErrors = validateWeightBalanceInputs(finalInputs);
      if (validationErrors.length > 0) {
        setError(validationErrors.map(err => err.message).join(', '));
        setLoading(false);
        return;
      }

      const response = await fetch('/api/weight-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalInputs)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Calculation failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WeightBalanceLayout>
      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Aircraft Data</h2>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emptyWeight">Empty Weight (kg)</Label>
                <Input 
                  id="emptyWeight" 
                  type="number" 
                  value={inputs.emptyWeight} 
                  onChange={(e) => handleInputChange('emptyWeight', parseFloat(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="emptyArm">Empty Arm (m)</Label>
                <Input 
                  id="emptyArm" 
                  type="number" 
                  value={inputs.emptyArm} 
                  onChange={(e) => handleInputChange('emptyArm', parseFloat(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="emptyMoment">Empty Moment (kg·m) (optional)</Label>
                <Input 
                  id="emptyMoment" 
                  type="number" 
                  placeholder="Will be calculated if not provided" 
                  onChange={(e) => handleInputChange('emptyMoment', parseFloat(e.target.value))} 
                />
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Weights</h2>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pilotWeight">Pilot Weight (kg)</Label>
                <Input 
                  id="pilotWeight" 
                  type="number" 
                  value={inputs.pilotWeight} 
                  onChange={(e) => handleInputChange('pilotWeight', parseFloat(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="passengerWeight">Passenger Weight (kg)</Label>
                <Input 
                  id="passengerWeight" 
                  type="number" 
                  value={inputs.passengerWeight} 
                  onChange={(e) => handleInputChange('passengerWeight', parseFloat(e.target.value))} 
                />
              </div>
              <div>
                <Label htmlFor="baggageWeight">Baggage Weight (kg) (max 20kg)</Label>
                <Input 
                  id="baggageWeight" 
                  type="number" 
                  value={inputs.baggageWeight} 
                  max={20}
                  onChange={(e) => handleInputChange('baggageWeight', parseFloat(e.target.value))} 
                />
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Flight Time</h2>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tripTime">Trip Time (hrs)</Label>
                <Input 
                  id="tripTime" 
                  type="number" 
                  value={inputs.flightTime.trip} 
                  onChange={(e) => handleFlightTimeChange('trip', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="contingencyTime">Contingency (hrs)</Label>
                <Input 
                  id="contingencyTime" 
                  type="number" 
                  value={inputs.flightTime.contingency} 
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="alternateTime">Alternate (hrs)</Label>
                <Input 
                  id="alternateTime" 
                  type="number" 
                  value={inputs.flightTime.alternate} 
                  onChange={(e) => handleFlightTimeChange('alternate', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="otherTime">Other (hrs)</Label>
                <Input 
                  id="otherTime" 
                  type="number" 
                  value={inputs.flightTime.other} 
                  onChange={(e) => handleFlightTimeChange('other', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="reserveTime">Reserve (hrs)</Label>
                <Input 
                  id="reserveTime" 
                  type="number" 
                  value={inputs.flightTime.reserve} 
                  onChange={(e) => handleFlightTimeChange('reserve', parseFloat(e.target.value))}
                />
              </div>
              <div>
                {/* Updated label to reflect taxi fuel in liters */}
                <Label htmlFor="taxiTime">Taxi Fuel (L)</Label>
                <Input 
                  id="taxiTime" 
                  type="number" 
                  value={inputs.flightTime.taxi} 
                  onChange={(e) => handleFlightTimeChange('taxi', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* New Scenario selection section */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Scenario</h2>
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scenario">Select Scenario</Label>
                <select
                  id="scenario"
                  value={inputs.scenario || 'standard'}
                  onChange={(e) => handleScenarioChange(e.target.value)}
                  className="border rounded p-2"
                >
                  <option value="standard">Standard</option>
                  <option value="maxFuel">Max Fuel</option>
                  <option value="minFuel">Min Fuel</option>
                  <option value="fixedBaggage">Fixed Baggage</option>
                </select>
              </div>
            </div>
          </Card>
        </section>

        <div className="flex justify-end space-x-4">
          <Button 
            disabled={loading}
            onClick={handleCalculate}
          >
            {loading ? <><LoadingSpinner size={16} /> Calculating...</> : 'Calculate'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setResults(null);
              setError(null);
            }}
          >
            Reset
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Calculation Results</h2>
            
            <Tabs defaultValue="weights">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="fuel">Fuel Calculations</TabsTrigger>
                <TabsTrigger value="weights">Weight & Balance</TabsTrigger>
                <TabsTrigger value="cg">CG Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fuel">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Minimum Fuel Required</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-right">Time (hrs)</th>
                        <th className="text-right">Litres (L)</th>
                        <th className="text-right">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Trip Fuel</td>
                        <td className="text-right">{inputs.flightTime.trip.toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.trip * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE).toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.trip * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Contingency (10% of Trip)</td>
                        <td className="text-right">{inputs.flightTime.contingency.toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.contingency * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE).toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.contingency * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Alternate</td>
                        <td className="text-right">{inputs.flightTime.alternate.toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.alternate * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE).toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.alternate * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Other</td>
                        <td className="text-right">{inputs.flightTime.other.toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.other * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE).toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.other * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Reserve</td>
                        <td className="text-right">{inputs.flightTime.reserve.toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.reserve * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE).toFixed(2)}</td>
                        <td className="text-right">{(inputs.flightTime.reserve * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Taxi</td>
                        <td className="text-right">{inputs.flightTime.taxi.toFixed(2)}</td>
                        <td className="text-right">{results.actualFuelState.taxi.litres.toFixed(2)}</td>
                        <td className="text-right">{results.actualFuelState.taxi.weight.toFixed(2)}</td>
                      </tr>
                      <tr className="font-bold">
                        <td>Total Minimum Fuel</td>
                        <td className="text-right">{results.minimumFuelRequired.time.toFixed(2)}</td>
                        <td className="text-right">{results.minimumFuelRequired.litres.toFixed(2)}</td>
                        <td className="text-right">{results.minimumFuelRequired.weight.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h3 className="font-semibold mt-6 mb-3">Actual Fuel State</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-right">Litres (L)</th>
                        <th className="text-right">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Actual Dip (Useable)</td>
                        <td className="text-right">{results.actualFuelState.actualDip.litres.toFixed(2)}</td>
                        <td className="text-right">{results.actualFuelState.actualDip.weight.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Taxi</td>
                        <td className="text-right">{results.actualFuelState.taxi.litres.toFixed(2)}</td>
                        <td className="text-right">{results.actualFuelState.taxi.weight.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Actual Flight Fuel</td>
                        <td className="text-right">{results.actualFuelState.actualFlightFuel.litres.toFixed(2)}</td>
                        <td className="text-right">{results.actualFuelState.actualFlightFuel.weight.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>Burn Off</td>
                        <td className="text-right">{results.actualFuelState.burnOff.litres.toFixed(2)}</td>
                        <td className="text-right">{results.actualFuelState.burnOff.weight.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
              </TabsContent>
              
              <TabsContent value="weights">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Weight and Balance Table</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-right">Weight (kg)</th>
                        <th className="text-right">Arm (m)</th>
                        <th className="text-right">Moment (kg·m)</th>
                        <th className="text-right">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.weightAndBalance.items.map((item, index) => (
                        <tr key={index} className={item.name.includes('Take Off Weight') || item.name.includes('Landing Weight') ? 'font-bold' : ''}>
                          <td>{item.name}</td>
                          <td className="text-right">{item.weight.toFixed(2)}</td>
                          <td className="text-right">{item.arm.toFixed(3)}</td>
                          <td className="text-right">{item.moment.toFixed(2)}</td>
                          <td className="text-right">{item.max || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </TabsContent>
              
              <TabsContent value="cg">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Center of Gravity Analysis</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-md mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Forward Limit (1.841m)</span>
                      <span>Aft Limit (1.978m)</span>
                    </div>
                    <div className="relative h-6 bg-slate-200 rounded-full">
                      <div 
                        className="absolute top-0 w-3 h-6 bg-blue-500 rounded-full"
                        style={{ 
                          left: `${((results.weightAndBalance.centerOfGravity - 1.841) / (1.978 - 1.841)) * 100}%`,
                          transform: 'translateX(-50%)'
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-center">
                      Current CG: {results.weightAndBalance.centerOfGravity.toFixed(3)}m
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-md ${results.weightAndBalance.isWithinLimits ? styles.success : styles.warning}`}>
                    <p className="font-medium">
                      {results.weightAndBalance.isWithinLimits 
                        ? '✓ CG is within limits' 
                        : '✗ CG is out of limits'
                      }
                    </p>
                    <p>
                      Takeoff Weight: {results.weightAndBalance.takeoffWeight.toFixed(2)}kg 
                      {results.weightAndBalance.takeoffWeight > 650 && ' (Exceeds maximum of 650kg)'}
                    </p>
                    <p>
                      CG Position: {results.weightAndBalance.centerOfGravity.toFixed(3)}m
                    </p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </WeightBalanceLayout>
  );
}

'use client';

import { useState } from 'react';
import { WeightBalanceLayout } from '@/components/WeightBalanceLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  WeightBalanceInputs, 
  WeightBalanceOutput, 
  validateCGLimits, 
  applyScenario, 
  ScenarioType,
  CONVERSION_FACTORS
} from '@/utils/weight-balance';
import styles from './styles.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function WeightAndBalancePage() {
  const [inputs, setInputs] = useState<WeightBalanceInputs>({
    emptyWeight: 432.21,
    emptyArm: 1.86,
    pilotWeight: 75,
    passengerWeight: 80,
    fuelMass: 59.79,
    baggageWeight: 3,
    flightTime: {
      trip: 2.0,
      contingency: 0.42,
      alternate: 0,
      other: 0.2,
      reserve: 0.5,
      taxi: 0.2
    }
  });
  
  const [results, setResults] = useState<WeightBalanceOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioType>('standard');
  const [autoCalculateFuel, setAutoCalculateFuel] = useState(true);

  const handleInputChange = (field: keyof WeightBalanceInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFlightTimeChange = (field: keyof WeightBalanceInputs['flightTime'], value: number) => {
    setInputs(prev => {
      const updatedFlightTime = { ...prev.flightTime, [field]: value };
      
      // Automatically calculate 10% contingency if trip time changes
      if (field === 'trip') {
        updatedFlightTime.contingency = Number((value * 0.1).toFixed(2));
      }
      
      const updatedInputs = {
        ...prev,
        flightTime: updatedFlightTime
      };
      
      // Auto-calculate fuel mass from flight time if enabled
      if (autoCalculateFuel) {
        const totalTime = Object.values(updatedFlightTime).reduce((sum, val) => sum + val, 0);
        const fuelLitres = totalTime * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
        updatedInputs.fuelMass = Number((fuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
      }
      
      return updatedInputs;
    });
  };
  
  const handleScenarioChange = (value: ScenarioType) => {
    setScenario(value);
    
    // Apply scenario logic using the utility function from weight-balance.ts
    const updatedInputs = applyScenario(inputs, value);
    setInputs(updatedInputs);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Update input with scenario calculations before sending
      const finalInputs = applyScenario(inputs, scenario);
      
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
        {/* Scenario Selector */}
        <section>
          <Card className="p-4">
            <h3 className="font-medium mb-3">Scenario Selection</h3>
            <Select value={scenario} onValueChange={(value) => handleScenarioChange(value as ScenarioType)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="maxFuel">Max Fuel / Min Baggage</SelectItem>
                <SelectItem value="minFuel">Min Fuel / Max Baggage</SelectItem>
                <SelectItem value="fixedBaggage">Fixed Baggage</SelectItem>
                <SelectItem value="performanceLimited">Performance-Limited</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 text-sm text-gray-600">
              {scenario === 'maxFuel' && 'Maximizes fuel while minimizing baggage to stay within weight limits.'}
              {scenario === 'minFuel' && 'Uses minimal flight fuel to maximize baggage capacity.'}
              {scenario === 'fixedBaggage' && 'Keeps baggage weight fixed while adjusting fuel to ensure W&B is within limits.'}
              {scenario === 'performanceLimited' && 'Adjusts weights to meet runway performance requirements.'}
            </div>
          </Card>
        </section>

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
                {scenario === 'fixedBaggage' && (
                  <p className="text-xs text-blue-600 mt-1">
                    In Fixed Baggage mode, this value is prioritized and fuel is adjusted accordingly
                  </p>
                )}
              </div>
              <div>
                <div className="flex justify-between">
                  <Label htmlFor="fuelMass">Fuel Mass (kg)</Label>
                  <label className="flex items-center text-xs">
                    <input 
                      type="checkbox" 
                      checked={autoCalculateFuel} 
                      onChange={() => setAutoCalculateFuel(!autoCalculateFuel)}
                      className="mr-1" 
                    />
                    Auto from flight time
                  </label>
                </div>
                <Input 
                  id="fuelMass" 
                  type="number" 
                  value={inputs.fuelMass} 
                  onChange={(e) => handleInputChange('fuelMass', parseFloat(e.target.value))} 
                  disabled={autoCalculateFuel}
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
                  onChange={(e) => handleFlightTimeChange('contingency', parseFloat(e.target.value))} 
                />
                <p className="text-xs text-gray-500 mt-1">Auto-calculated as 10% of trip time</p>
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
                <Label htmlFor="taxiTime">Taxi (hrs)</Label>
                <Input 
                  id="taxiTime" 
                  type="number" 
                  value={inputs.flightTime.taxi} 
                  onChange={(e) => handleFlightTimeChange('taxi', parseFloat(e.target.value))} 
                />
                <p className="text-xs text-gray-500 mt-1">Standard taxi fuel is 3L (2.16kg)</p>
              </div>
            </div>
            {autoCalculateFuel && (
              <div className="mt-4 p-2 bg-blue-50 rounded text-sm text-blue-700">
                Total flight time: {Object.values(inputs.flightTime).reduce((sum, val) => sum + val, 0).toFixed(2)} hrs →
                {' '}{(Object.values(inputs.flightTime).reduce((sum, val) => sum + val, 0) * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE).toFixed(2)} L →
                {' '}{inputs.fuelMass.toFixed(2)} kg
              </div>
            )}
          </Card>
        </section>

        {/* Action Buttons */}
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

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
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
                      {/* Position indicator based on CG position */}
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
                      {!validateCGLimits(results.weightAndBalance.centerOfGravity) && ' (Outside 1.841m-1.978m)'}
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

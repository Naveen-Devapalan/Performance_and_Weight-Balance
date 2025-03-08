'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import {
  PerformanceLayout,
  PerformanceInputSection,
  PerformanceOutputSection,
  FieldValue,
} from '@/components/PerformanceLayout';
import { PerformanceInputs } from '@/utils/performance';
import { usePerformance } from '@/utils/usePerformance';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/FormField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { validateRequiredFields, formatValidationErrors } from '@/utils/validation';

function getCalculationProgress(results: any) {
  if (!results) return 0;
  let progress = 0;
  
  // Pressure altitude calculated
  if (results.pressureAltitude) progress += 20;
  
  // Wind components calculated
  if (results.windCalculation) progress += 20;
  
  // Basic distances calculated
  if (results.takeoffPerformance?.groundRoll || results.landingPerformance?.groundRoll) progress += 20;
  
  // Corrections applied
  if (results.takeoffPerformance?.slopeCorrectedDistance || results.landingPerformance?.slopeCorrectedDistance) progress += 20;
  
  // Final calculation complete
  if (results.takeoffPerformance?.finalTakeoffDistance || results.landingPerformance?.finalLandingDistance) progress += 20;
  
  return progress;
}

function formatNumericDisplay(value: string | number | null | undefined, fallback: string = 'N/A'): string {
  if (value === '' || value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num.toFixed(2);
}

export default function PerformanceCalculator() {
  const [operationType, setOperationType] = useState<'takeoff' | 'landing'>('takeoff');
  
  // Initialize with empty strings for text inputs and null for numeric inputs
  const [inputs, setInputs] = useState<PerformanceInputs>({
    departure: {
      airport: '',
      elevation: '',
      runway: '',
      surface: 'B',
      toda: '',
      lda: ''
    },
    slope: {
      value: '',
      direction: 'U'
    },
    qnh: '',
    temperature: '',
    wind: {
      direction: '',
      speed: '',
      runwayHeading: ''
    },
    part: 61
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Safe toFixed function to handle null/undefined values
  const safeToFixed = (value: number | null | undefined, digits: number = 2): string => {
    if (value === null || value === undefined) return '0.00';
    return value.toFixed(digits);
  };
  const { 
    isCalculating, 
    results, 
    error, 
    lastAttemptedOperation,
    calculatePerformance,
    retryCalculation 
  } = usePerformance();

  const validateInputs = (): boolean => {
    const validationErrors = validateRequiredFields(inputs);
    
    // Additional validation for TODA and LDA
    if (operationType === 'takeoff' && (!inputs.departure.toda || inputs.departure.toda === '')) {
      validationErrors.push({ field: 'toda', message: 'TODA is required for takeoff calculations' });
    }
    
    if (operationType === 'landing' && (!inputs.departure.lda || inputs.departure.lda === '')) {
      validationErrors.push({ field: 'lda', message: 'LDA is required for landing calculations' });
    }
    
    const formattedErrors = formatValidationErrors(validationErrors);
    setErrors(formattedErrors);
    return validationErrors.length === 0;
  };

  const handleCalculate = async () => {
    if (!validateInputs()) {
      return;
    }
    
    try {
      await calculatePerformance({
        ...inputs,
        departure: {
          ...inputs.departure,
          runway: operationType === 'landing' ? `${inputs.departure.runway}-landing` : inputs.departure.runway
        }
      });
    } catch (error) {
      setErrors({ 
        calculation: error instanceof Error ? error.message : 'Error calculating performance' 
      });
    }
  };
  
  // Update the handleInputChange function to handle empty string conversions
  const handleInputChange = (field: string, value: any) => {
    // For numeric fields, allow empty string
    const processedValue = value === '' ? '' : value;
    
    // Logic for nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentKey = parent as keyof PerformanceInputs;
      
      // Make sure we're dealing with an object before spreading
      if (parentKey === 'departure') {
        setInputs({
          ...inputs,
          departure: {
            ...inputs.departure,
            [child]: processedValue
          }
        });
      } else if (parentKey === 'wind') {
        setInputs({
          ...inputs,
          wind: {
            ...inputs.wind,
            [child]: processedValue
          }
        });
      } else if (parentKey === 'slope') {
        setInputs({
          ...inputs,
          slope: {
            ...inputs.slope,
            [child]: processedValue
          }
        });
      }
    } else {
      setInputs({ ...inputs, [field]: processedValue });
    }
    
    // Clear error when value changes
    if (errors[field]) {
      const newErrors = {...errors};
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const formatCalculation = (value: string | number | null | undefined): string => {
    if (!value || value === '') return '0.00';
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const handleDisplayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') return value.toFixed(2);
    return String(value);
  };

  return (
    <ErrorBoundary>
      <PerformanceLayout title="Performance Calculator">
        <Tabs 
          value={operationType}
          onValueChange={(value) => setOperationType(value as 'takeoff' | 'landing')}
          className={styles.performanceContainer}
        >
          <div className={styles.tabsWrapper}>
            <TabsList className={styles.tabsList}>
              <TabsTrigger 
                value="takeoff" 
                className={operationType === 'takeoff' ? styles.coloredTabTrigger : styles.inactiveTabTrigger}
              >
                Takeoff
              </TabsTrigger>
              <TabsTrigger 
                value="landing" 
                className={operationType === 'landing' ? styles.coloredTabTrigger : styles.inactiveTabTrigger}
              >
                Landing
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Common part selection for both tabs */}
          <div className={styles.partSelection}>
            <RadioGroup
              value={inputs.part.toString()}
              onValueChange={(value) => handleInputChange('part', parseInt(value))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="61" id="part61" />
                <Label htmlFor="part61">Part 61</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="135" id="part135" />
                <Label htmlFor="part135">Part 135</Label>
              </div>
            </RadioGroup>
          </div>

          <TabsContent value="takeoff">
            <div className={styles.inputSection}>
              <PerformanceInputSection 
                title="Aircraft Parameters"
                description={
                  <div className={styles.badgeContainer}>
                    <Badge variant={inputs.part === 61 ? 'default' : 'secondary'}>
                      Part {inputs.part}
                    </Badge>
                    <Badge variant="outline">
                      {inputs.departure.surface === 'B' ? 'Paved' : 'Grass'} Surface
                    </Badge>
                  </div>
                }
              >
                <FormField
                  label="Airport (ICAO)"
                  id="airport"
                  value={inputs.departure.airport}
                  onChange={(value) => handleInputChange('departure.airport', String(value).toUpperCase())}
                  placeholder="Enter ICAO code"
                  error={errors.airport}
                  tooltip="Enter the 4-letter ICAO code for the departure airport"
                />

                <FormField
                  label="Elevation"
                  id="elevation"
                  type="number"
                  value={inputs.departure.elevation}
                  onChange={(value) => handleInputChange('departure.elevation', value)}
                  placeholder="Enter elevation"
                  error={errors.elevation}
                  min={-1000}
                  max={15000}
                  units="ft"
                  tooltip="Airport elevation in feet above mean sea level"
                />

                <div className="space-y-2.5">
                  <label className="text-sm font-medium">Surface Type</label>
                  <Select
                    value={inputs.departure.surface}
                    onValueChange={(value) => handleInputChange('departure.surface', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select surface type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B">Paved (B)</SelectItem>
                      <SelectItem value="G">Grass (G)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  label="TODA"
                  id="toda"
                  type="number"
                  value={inputs.departure.toda}
                  onChange={(value) => handleInputChange('departure.toda', value)}
                  placeholder="Enter TODA"
                  error={errors.toda}
                  min={0}
                  units="m"
                  tooltip="Take-off Distance Available in meters"
                  required={true}
                />

                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Slope"
                      id="slope"
                      type="number"
                      value={inputs.slope.value}
                      onChange={(value) => handleInputChange('slope.value', value)}
                      placeholder="Enter slope"
                      error={errors.slope}
                      min={-5}
                      max={5}
                      step={0.1}
                      units="%"
                      tooltip="Runway slope percentage (positive for uphill)"
                    />

                    <div className="space-y-2.5">
                      <label className="text-sm font-medium">Slope Direction</label>
                      <Select
                        value={inputs.slope.direction}
                        onValueChange={(value) => handleInputChange('slope.direction', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="U">Uphill (U)</SelectItem>
                          <SelectItem value="D">Downhill (D)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PerformanceInputSection>

              <PerformanceInputSection title="Runway Parameters">
                <FormField
                  label="Runway"
                  id="runway"
                  value={inputs.departure.runway}
                  onChange={(value) => handleInputChange('departure.runway', value)}
                  placeholder="Enter runway (e.g., 18)"
                  error={errors.runway}
                  tooltip="Runway designator (e.g., 18, 18L)"
                />
                <FormField
                  label="Runway Heading"
                  id="runwayHeading"
                  type="number"
                  value={inputs.wind.runwayHeading}
                  onChange={(value) => handleInputChange('wind.runwayHeading', value)}
                  placeholder="Enter heading"
                  error={errors.runwayHeading}
                  min={0}
                  max={360}
                  units="°"
                  tooltip="True runway heading in degrees"
                />
              </PerformanceInputSection>

              <PerformanceInputSection title="Environmental Conditions">
                <FormField
                  label="QNH"
                  id="qnh"
                  type="number"
                  value={inputs.qnh}
                  onChange={(value) => handleInputChange('qnh', value)}
                  placeholder="Enter QNH"
                  error={errors.qnh}
                  min={900}
                  max={1100}
                  units="hPa"
                  tooltip="Current atmospheric pressure adjusted to sea level"
                />

                <FormField
                  label="Temperature"
                  id="temperature"
                  type="number"
                  value={inputs.temperature}
                  onChange={(value) => handleInputChange('temperature', value)}
                  placeholder="Enter temperature"
                  error={errors.temperature}
                  min={-30}
                  max={50}
                  units="°C"
                  tooltip="Outside air temperature"
                />

                <FormField
                  label="Wind Direction"
                  id="windDirection"
                  type="number"
                  value={inputs.wind.direction}
                  onChange={(value) => handleInputChange('wind.direction', value)}
                  placeholder="Direction"
                  error={errors.windDirection}
                  min={0}
                  max={360}
                  units="°"
                  tooltip="Wind direction in degrees true"
                />

                <FormField
                  label="Wind Speed"
                  id="windSpeed"
                  type="number"
                  value={inputs.wind.speed}
                  onChange={(value) => handleInputChange('wind.speed', value)}
                  placeholder="Speed"
                  error={errors.windSpeed}
                  min={0}
                  max={99}
                  units="kts"
                  tooltip="Wind speed in knots"
                />
              </PerformanceInputSection>

              {results && (
                <Alert 
                  variant={results.takeoffPerformance?.isFeasible ? 'default' : 'destructive'}
                  className={styles.resultAlert}
                >
                  <div className="flex items-center gap-2">
                    {results.takeoffPerformance?.isFeasible ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                    <AlertTitle>
                      {results.takeoffPerformance?.isFeasible 
                        ? 'Operation is Feasible' 
                        : 'Operation is Not Feasible'
                      }
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    Required distance: <span className={styles.importantValue}>{results.takeoffPerformance?.finalTakeoffDistance.toFixed(2)}m</span>
                    {results.takeoffPerformance?.isFeasible ? ' < ' : ' > '}
                    Available: <span className={styles.importantValue}>{results.takeoffPerformance?.toda}m</span>
                  </AlertDescription>
                </Alert>
              )}

              {results?.takeoffPerformance && (
                <Card className={styles.calculationCard}>
                  <CardHeader>
                    <CardTitle>Takeoff Performance Calculations</CardTitle>
                    <CardDescription>Step-by-step calculation breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className={styles.calculationSection}>
                      <div className="mb-6">
                        <h4 className={styles.calculationHeading}>Pressure Altitude</h4>
                        <p className={styles.calculationText}>
                          (1013 - {formatCalculation(inputs.qnh)}) × 30 = {formatCalculation((1013 - Number(inputs.qnh)) * 30)} ft 
                          + {formatCalculation(inputs.departure.elevation)} ft 
                          = <span className={styles.importantValue}>{results?.pressureAltitude ? formatCalculation(results.pressureAltitude.result) : 'N/A'} ft</span>
                        </p>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Wind Components</h4>
                        <div className={styles.windComponents}>
                          <div>
                            <p className="text-sm font-medium">Part 61:</p>
                            <p className="text-sm">HW: <span className={styles.windValue}>{results.windCalculation.part61.headwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">TW: <span className={styles.windValue}>{results.windCalculation.part61.tailwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">XW: <span className={styles.windValue}>{results.windCalculation.part61.crosswind.toFixed(2)} kts</span></p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Part 135 (-50% HW, +150% TW):</p>
                            <p className="text-sm">HW: <span className={styles.windValue}>{results.windCalculation.part135.headwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">TW: <span className={styles.windValue}>{results.windCalculation.part135.tailwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">XW: <span className={styles.windValue}>{results.windCalculation.part135.crosswind.toFixed(2)} kts</span></p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 1: Base Distances</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <p className="text-sm">Ground Roll (A): <span className={styles.windValue}>{results.takeoffPerformance.groundRoll.toFixed(2)}m</span></p>
                          <p className="text-sm">50ft AGL Distance (B): <span className={styles.windValue}>{results.takeoffPerformance.takeoffDistance50ft.toFixed(2)}m</span></p>
                        </div>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 2: Wind Correction</h4>
                        <p className="text-sm">
                          {results.windCalculation.part61.headwind 
                            ? <><span className={styles.windValue}>{(inputs.part === 61 ? (results.windCalculation.part61.headwind || 0) : (results.windCalculation.part135.headwind || 0)).toFixed(2)} kts</span> × -5m = <span className={styles.windValue}>{(results.takeoffPerformance.windCorrectedDistance - results.takeoffPerformance.takeoffDistance50ft).toFixed(2)}m</span></>
                            : <><span className={styles.windValue}>{(inputs.part === 61 ? (results.windCalculation.part61.tailwind || 0) : (results.windCalculation.part135.tailwind || 0)).toFixed(2)} kts</span> × +15m = <span className={styles.windValue}>{(results.takeoffPerformance.windCorrectedDistance - results.takeoffPerformance.takeoffDistance50ft).toFixed(2)}m</span></>
                          } + <span className={styles.windValue}>{results.takeoffPerformance.takeoffDistance50ft.toFixed(2)}m</span> = <span className={styles.importantValue}>{results.takeoffPerformance.windCorrectedDistance.toFixed(2)}m (C)</span>
                        </p>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 3: Surface Correction</h4>
                        {inputs.departure.surface === 'B' ? (
                          <p className="text-sm">
                            Ground Roll <span className={styles.windValue}>{results.takeoffPerformance.groundRoll.toFixed(2)}m</span> × -10% = 
                            <span className={styles.windValue}>{(results.takeoffPerformance.groundRoll * -0.1).toFixed(2)}m</span> + <span className={styles.windValue}>{results.takeoffPerformance.windCorrectedDistance.toFixed(2)}m</span> = 
                            <span className={styles.importantValue}>{results.takeoffPerformance.surfaceCorrectedDistance.toFixed(2)}m (D)</span>
                          </p>
                        ) : (
                          <p className="text-sm">No correction required for grass surface</p>
                        )}
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 4: Slope Correction</h4>
                        <p className="text-sm">
                          Ground Roll <span className={styles.windValue}>{results.takeoffPerformance.groundRoll.toFixed(2)}m</span> × (<span className={styles.windValue}>{Number(inputs.slope.value).toFixed(2)}</span> × {inputs.slope.direction === 'U' ? '+' : '-'}7%) = 
                          <span className={styles.windValue}>{(results.takeoffPerformance.slopeCorrectedDistance - results.takeoffPerformance.surfaceCorrectedDistance).toFixed(2)}m</span> + 
                          <span className={styles.windValue}>{results.takeoffPerformance.surfaceCorrectedDistance.toFixed(2)}m</span> = <span className={styles.importantValue}>{results.takeoffPerformance.slopeCorrectedDistance.toFixed(2)}m</span>
                        </p>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 5: Final Safety Factor</h4>
                        <p className="text-sm">
                          <span className={styles.windValue}>{results.takeoffPerformance.slopeCorrectedDistance.toFixed(2)}m</span> × {inputs.part === 135 ? '1.10' : '1.10'} = 
                          <span className={styles.importantValue}>{results.takeoffPerformance.finalTakeoffDistance.toFixed(2)}m TODR</span>
                        </p>
                      </div>

                      <Separator />

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>TODA Check</h4>
                        <p className="text-sm">
                          {Number(inputs.departure.toda) > 0 
                            ? <><span className={styles.importantValue}>{formatCalculation(inputs.departure.toda)}m</span> {inputs.part === 135 
                                ? <>× 0.85 = <span className={styles.importantValue}>{formatCalculation(Number(inputs.departure.toda) * 0.85)}m</span></> 
                                : ''}</>
                            : 'N/A'} 
                          <span className="font-medium mx-2">{results?.takeoffPerformance?.isFeasible ? ' ≥ ' : ' < '}</span> 
                          <span className={styles.importantValue}>
                          {results?.takeoffPerformance 
                            ? formatCalculation(results.takeoffPerformance.finalTakeoffDistance) 
                            : 'N/A'}m Required
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="landing">
            <div className={styles.inputSection}>
              <PerformanceInputSection 
                title="Aircraft Parameters"
                description={
                  <div className={styles.badgeContainer}>
                    <Badge variant={inputs.part === 61 ? 'default' : 'secondary'}>
                      Part {inputs.part}
                    </Badge>
                    <Badge variant="outline">
                      {inputs.departure.surface === 'B' ? 'Paved' : 'Grass'} Surface
                    </Badge>
                  </div>
                }
              >
                <FormField
                  label="Airport (ICAO)"
                  id="airport"
                  value={inputs.departure.airport}
                  onChange={(value) => handleInputChange('departure.airport', String(value).toUpperCase())}
                  placeholder="Enter ICAO code"
                  error={errors.airport}
                  tooltip="Enter the 4-letter ICAO code for the arrival airport"
                />
                <FormField
                  label="Elevation"
                  id="elevation"
                  type="number"
                  value={inputs.departure.elevation}
                  onChange={(value) => handleInputChange('departure.elevation', value)}
                  placeholder="Enter elevation"
                  error={errors.elevation}
                  min={-1000}
                  max={15000}
                  units="ft"
                  tooltip="Airport elevation in feet above mean sea level"
                />
                <div className="space-y-2.5">
                  <label className="text-sm font-medium">Surface Type</label>
                  <Select
                    value={inputs.departure.surface}
                    onValueChange={(value) => handleInputChange('departure.surface', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select surface type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B">Paved (B)</SelectItem>
                      <SelectItem value="G">Grass (G)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormField
                  label="LDA"
                  id="lda"
                  type="number"
                  value={inputs.departure.lda}
                  onChange={(value) => handleInputChange('departure.lda', value)}
                  placeholder="Enter LDA"
                  error={errors.lda}
                  min={0}
                  units="m"
                  tooltip="Landing Distance Available in meters"
                  required={true}
                />
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Slope"
                      id="slope"
                      type="number"
                      value={inputs.slope.value}
                      onChange={(value) => handleInputChange('slope.value', value)}
                      placeholder="Enter slope"
                      error={errors.slope}
                      min={-5}
                      max={5}
                      step={0.1}
                      units="%"
                      tooltip="Runway slope percentage (positive for uphill)"
                    />
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium">Slope Direction</label>
                      <Select
                        value={inputs.slope.direction}
                        onValueChange={(value) => handleInputChange('slope.direction', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="U">Uphill (U)</SelectItem>
                          <SelectItem value="D">Downhill (D)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PerformanceInputSection>
              
              <PerformanceInputSection title="Runway Parameters">
                <FormField
                  label="Runway"
                  id="runway"
                  value={inputs.departure.runway}
                  onChange={(value) => handleInputChange('departure.runway', value)}
                  placeholder="Enter runway (e.g., 18)"
                  error={errors.runway}
                  tooltip="Runway designator (e.g., 18, 18L)"
                />
                <FormField
                  label="Runway Heading"
                  id="runwayHeading"
                  type="number"
                  value={inputs.wind.runwayHeading}
                  onChange={(value) => handleInputChange('wind.runwayHeading', value)}
                  placeholder="Enter heading"
                  error={errors.runwayHeading}
                  min={0}
                  max={360}
                  units="°"
                  tooltip="True runway heading in degrees"
                />
              </PerformanceInputSection>

              <PerformanceInputSection title="Environmental Conditions">
                <FormField
                  label="QNH"
                  id="qnh"
                  type="number"
                  value={inputs.qnh}
                  onChange={(value) => handleInputChange('qnh', value)}
                  placeholder="Enter QNH"
                  error={errors.qnh}
                  min={900}
                  max={1100}
                  units="hPa"
                  tooltip="Current atmospheric pressure adjusted to sea level"
                />
                <FormField
                  label="Temperature"
                  id="temperature"
                  type="number"
                  value={inputs.temperature}
                  onChange={(value) => handleInputChange('temperature', value)}
                  placeholder="Enter temperature"
                  error={errors.temperature}
                  min={-30}
                  max={50}
                  units="°C"
                  tooltip="Outside air temperature"
                />
                <FormField
                  label="Wind Direction"
                  id="windDirection"
                  type="number"
                  value={inputs.wind.direction}
                  onChange={(value) => handleInputChange('wind.direction', value)}
                  placeholder="Direction"
                  error={errors.windDirection}
                  min={0}
                  max={360}
                  units="°"
                  tooltip="Wind direction in degrees true"
                />
                <FormField
                  label="Wind Speed"
                  id="windSpeed"
                  type="number"
                  value={inputs.wind.speed}
                  onChange={(value) => handleInputChange('wind.speed', value)}
                  placeholder="Speed"
                  error={errors.windSpeed}
                  min={0}
                  max={99}
                  units="kts"
                  tooltip="Wind speed in knots"
                />
              </PerformanceInputSection>

              {results?.landingPerformance && (
                <Alert 
                  variant={results.landingPerformance.isFeasible ? 'default' : 'destructive'}
                  className={styles.resultAlert}
                >
                  <div className="flex items-center gap-2">
                    {results.landingPerformance.isFeasible ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                    <AlertTitle>
                      {results.landingPerformance.isFeasible 
                        ? 'Landing Operation is Feasible' 
                        : 'Landing Operation is Not Feasible'
                      }
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    Required distance: <span className={styles.importantValue}>{results.landingPerformance.finalLandingDistance.toFixed(2)}m</span>
                    {' '}{results.landingPerformance.isFeasible ? '< ' : '> '}
                    Available LDA: <span className={styles.importantValue}>{results.landingPerformance.lda.toFixed(2)}m</span>
                  </AlertDescription>
                </Alert>
              )}

              {results?.landingPerformance && (
                <Card className={styles.calculationCard}>
                  <CardHeader>
                    <CardTitle>Landing Performance Calculations</CardTitle>
                    <CardDescription>Step-by-step calculation breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className={styles.calculationSection}>
                      <div className="mb-6">
                        <h4 className={styles.calculationHeading}>Pressure Altitude</h4>
                        <p className={styles.calculationText}>
                          (1013 - {formatCalculation(inputs.qnh)}) × 30 = {formatCalculation((1013 - Number(inputs.qnh)) * 30)} ft 
                          + {formatCalculation(inputs.departure.elevation)} ft 
                          = <span className={styles.importantValue}>{results?.pressureAltitude ? formatCalculation(results.pressureAltitude.result) : 'N/A'} ft</span>
                        </p>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Wind Components</h4>
                        <div className={styles.windComponents}>
                          <div>
                            <p className="text-sm font-medium">Part 61:</p>
                            <p className="text-sm">HW: <span className={styles.windValue}>{results.windCalculation.part61.headwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">TW: <span className={styles.windValue}>{results.windCalculation.part61.tailwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">XW: <span className={styles.windValue}>{results.windCalculation.part61.crosswind.toFixed(2)} kts</span></p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Part 135 (-50% HW, +150% TW):</p>
                            <p className="text-sm">HW: <span className={styles.windValue}>{results.windCalculation.part135.headwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">TW: <span className={styles.windValue}>{results.windCalculation.part135.tailwind?.toFixed(2) || '0.00'} kts</span></p>
                            <p className="text-sm">XW: <span className={styles.windValue}>{results.windCalculation.part135.crosswind.toFixed(2)} kts</span></p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 1: Base Distances</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <p className="text-sm">Ground Roll (A): <span className={styles.windValue}>{results.landingPerformance.groundRoll.toFixed(2)}m</span></p>
                          <p className="text-sm">50ft AGL Distance (B): <span className={styles.windValue}>{results.landingPerformance.landingDistance50ft.toFixed(2)}m</span></p>
                        </div>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 2: Wind Correction</h4>
                        <p className="text-sm">
                          {results.windCalculation.part61.headwind 
                            ? <><span className={styles.windValue}>{(inputs.part === 61 ? (results.windCalculation.part61.headwind || 0) : (results.windCalculation.part135.headwind || 0)).toFixed(2)} kts</span> × -4m = <span className={styles.windValue}>{(results.landingPerformance.windCorrectedDistance - results.landingPerformance.landingDistance50ft).toFixed(2)}m</span></>
                            : <><span className={styles.windValue}>{(inputs.part === 61 ? (results.windCalculation.part61.tailwind || 0) : (results.windCalculation.part135.tailwind || 0)).toFixed(2)} kts</span> × +13m = <span className={styles.windValue}>{(results.landingPerformance.windCorrectedDistance - results.landingPerformance.landingDistance50ft).toFixed(2)}m</span></>
                          } + <span className={styles.windValue}>{results.landingPerformance.landingDistance50ft.toFixed(2)}m</span> = <span className={styles.importantValue}>{results.landingPerformance.windCorrectedDistance.toFixed(2)}m (C)</span>
                        </p>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 3: Surface Correction</h4>
                        {inputs.departure.surface === 'B' ? (
                          <p className="text-sm">
                            Ground Roll <span className={styles.windValue}>{results.landingPerformance.groundRoll.toFixed(2)}m</span> × -10% = 
                            <span className={styles.windValue}>{(results.landingPerformance.groundRoll * -0.1).toFixed(2)}m</span> + <span className={styles.windValue}>{results.landingPerformance.windCorrectedDistance.toFixed(2)}m</span> = 
                            <span className={styles.importantValue}>{results.landingPerformance.surfaceCorrectedDistance.toFixed(2)}m (D)</span>
                          </p>
                        ) : (
                          <p className="text-sm">No correction required for grass surface</p>
                        )}
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 4: Slope Correction</h4>
                        <p className="text-sm">
                          Ground Roll <span className={styles.windValue}>{results.landingPerformance.groundRoll.toFixed(2)}m</span> × (<span className={styles.windValue}>{Number(inputs.slope.value).toFixed(2)}</span> × {inputs.slope.direction === 'U' ? '-' : '+'}3%) = 
                          <span className={styles.windValue}>{(results.landingPerformance.slopeCorrectedDistance - results.landingPerformance.surfaceCorrectedDistance).toFixed(2)}m</span> + 
                          <span className={styles.windValue}>{results.landingPerformance.surfaceCorrectedDistance.toFixed(2)}m</span> = <span className={styles.importantValue}>{results.landingPerformance.slopeCorrectedDistance.toFixed(2)}m</span>
                        </p>
                      </div>

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>Step 5: Final Safety Factor</h4>
                        <p className="text-sm">
                          <span className={styles.windValue}>{results.landingPerformance.slopeCorrectedDistance.toFixed(2)}m</span> × 1.67 = 
                          <span className={styles.importantValue}>{results.landingPerformance.finalLandingDistance.toFixed(2)}m LDR</span>
                        </p>
                      </div>

                      <Separator />

                      <div className={styles.calculationStep}>
                        <h4 className={styles.calculationHeading}>LDA Check</h4>
                        <p className="text-sm">
                          {Number(inputs.departure.lda) > 0
                            ? <><span className={styles.importantValue}>{formatCalculation(inputs.departure.lda)}m</span> {inputs.part === 135 
                                ? <>× 0.85 = <span className={styles.importantValue}>{formatCalculation(Number(inputs.departure.lda) * 0.85)}m</span></> 
                                : ''}</>
                            : 'N/A'} 
                          <span className="font-medium mx-2">{results?.landingPerformance?.isFeasible ? ' ≥ ' : ' < '}</span> 
                          <span className={styles.importantValue}>
                          {results?.landingPerformance 
                            ? formatCalculation(results.landingPerformance.finalLandingDistance) 
                            : 'N/A'}m Required
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className={styles.buttonContainer}>
          <Button
            onClick={handleCalculate}
            disabled={isCalculating || Boolean(error)}
            className={styles.calculateButton}
            variant="default"
            size="lg"
          >
            {isCalculating ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                <span>Calculating...</span>
              </>
            ) : (
              Object.keys(errors).length > 0 ? 'Fix Errors to Continue' : 'Calculate Performance'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className={styles.errorAlert}>
            <AlertTitle>Calculation Error</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error.message || 'An unexpected error occurred'}</p>
              {lastAttemptedOperation && (
                <Button
                  onClick={retryCalculation}
                  variant="outline"
                >
                  Retry {lastAttemptedOperation.charAt(0).toUpperCase() + lastAttemptedOperation.slice(1)} Calculation
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className={styles.errorAlert}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className={styles.errorList}>
                {Object.values(errors).map((message, index) => (
                  <li key={index} className={styles.errorListItem}>{String(message)}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </PerformanceLayout>
    </ErrorBoundary>
  );
}


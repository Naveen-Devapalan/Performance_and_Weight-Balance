import { useState } from 'react';
import { PerformanceInputs, calculatePerformance } from './performance';

// Define proper types for the results
interface PerformanceResults {
  pressureAltitude: {
    result: number;
    calculation: string;
  };
  windCalculation: {
    part61: WindComponents;
    part135: WindComponents;
  };
  takeoffPerformance: TakeoffResults | null;
  landingPerformance: LandingResults | null;
}

interface WindComponents {
  headwind: number | null;
  tailwind: number | null;
  crosswind: number;
}

interface TakeoffResults {
  groundRoll: number;
  takeoffDistance50ft: number;
  windCorrectedDistance: number;
  surfaceCorrectedDistance: number;
  slopeCorrectedDistance: number;
  finalTakeoffDistance: number;
  toda: number;
  isFeasible: boolean;
}

interface LandingResults {
  groundRoll: number;
  landingDistance50ft: number;
  windCorrectedDistance: number;
  surfaceCorrectedDistance: number;
  slopeCorrectedDistance: number;
  finalLandingDistance: number;
  lda: number;
  isFeasible: boolean;
}

interface PerformanceError {
  message: string;
  code?: string;
  details?: string;
}

interface UsePerformanceReturn {
  isCalculating: boolean;
  results: PerformanceResults | null;
  error: PerformanceError | null;
  lastAttemptedOperation: 'takeoff' | 'landing' | null;
  calculatePerformance: (inputs: PerformanceInputs) => Promise<PerformanceResults>;
  retryCalculation: () => Promise<PerformanceResults | void>;
}

export function usePerformance(): UsePerformanceReturn {
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<PerformanceResults | null>(null);
  const [error, setError] = useState<PerformanceError | null>(null);
  const [lastInputs, setLastInputs] = useState<PerformanceInputs | null>(null);
  const [lastAttemptedOperation, setLastAttemptedOperation] = useState<'takeoff' | 'landing' | null>(null);

  const performCalculation = async (inputs: PerformanceInputs): Promise<PerformanceResults> => {
    try {
      setIsCalculating(true);
      setError(null);

      // Check for required numeric fields
      const requiredNumericFields = [
        { path: 'departure.elevation', label: 'Elevation' },
        { path: 'qnh', label: 'QNH' },
        { path: 'temperature', label: 'Temperature' },
        { path: 'wind.direction', label: 'Wind Direction' },
        { path: 'wind.speed', label: 'Wind Speed' },
        { path: 'wind.runwayHeading', label: 'Runway Heading' }
      ];

      const missingFields = requiredNumericFields.filter(field => {
        const value = field.path.split('.').reduce((obj: any, key) => obj?.[key], inputs);
        return value === '' || value === null || value === undefined || isNaN(Number(value));
      });

      if (missingFields.length > 0) {
        throw new Error(`Please enter valid numeric values for: ${missingFields.map(f => f.label).join(', ')}`);
      }

      setLastAttemptedOperation(inputs.departure.runway.includes('-landing') ? 'landing' : 'takeoff');
      setLastInputs(inputs);

      const calculationResults = await calculatePerformance(inputs);
      setResults(calculationResults);
      return calculationResults;
    } catch (err) {
      const performanceError: PerformanceError = {
        message: err instanceof Error ? err.message : 'An error occurred during calculation',
        code: err instanceof Error ? err.name : 'UNKNOWN_ERROR',
        details: err instanceof Error ? err.stack : undefined
      };
      setError(performanceError);
      throw performanceError;
    } finally {
      setIsCalculating(false);
    }
  };

  const retryCalculation = async (): Promise<PerformanceResults | void> => {
    if (!lastInputs) {
      setError({
        message: 'No previous calculation to retry',
        code: 'NO_PREVIOUS_CALCULATION'
      });
      return;
    }
    return performCalculation(lastInputs);
  };

  return {
    isCalculating,
    results,
    error,
    lastAttemptedOperation,
    calculatePerformance: performCalculation,
    retryCalculation
  };
}
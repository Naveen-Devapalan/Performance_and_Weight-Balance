// Performance Types and Interfaces
export interface DepartureInfo {
  airport: string;
  elevation: string | number;
  runway: string;
  surface: 'B' | 'G';  // B for paved (Bitumen), G for grass
  toda: string | number;  // Take-off Distance Available from AIP
  lda: string | number;   // Landing Distance Available from AIP
}

export interface SlopeInfo {
  value: string | number;
  direction: 'U' | 'D';  // U for upslope, D for downslope
}

export interface WindInfo {
  direction: string | number;  // 0-360 degrees
  speed: string | number;     // In knots
  runwayHeading: string | number;  // 0-360 degrees
}

export interface PerformanceInputs {
  departure: DepartureInfo;
  slope: SlopeInfo;
  qnh: string | number;
  temperature: string | number;
  wind: WindInfo;
  part: 61 | 135;
}

interface WindComponents {
  headwind: number | null;
  tailwind: number | null;
  crosswind: number;
}

interface WindCalculation {
  part61: WindComponents;
  part135: WindComponents;
}

interface PressureAltitudeResult {
  result: number;
  calculation: string;
}

interface TakeoffPerformance {
  groundRoll: number;
  takeoffDistance50ft: number;
  windCorrectedDistance: number;
  surfaceCorrectedDistance: number;
  slopeCorrectedDistance: number;
  finalTakeoffDistance: number;
  toda: number;
  isFeasible: boolean;
}

interface LandingPerformance {
  groundRoll: number;
  landingDistance50ft: number;
  windCorrectedDistance: number;
  surfaceCorrectedDistance: number;
  slopeCorrectedDistance: number;
  finalLandingDistance: number;
  lda: number;
  isFeasible: boolean;
}

export interface PerformanceOutput {
  pressureAltitude: PressureAltitudeResult;
  windCalculation: WindCalculation;
  takeoffPerformance: TakeoffPerformance | null;
  landingPerformance: LandingPerformance | null;
}

// Helper function to ensure numeric values are valid
function ensureNumber(value: string | number | undefined | null): number {
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  return typeof value === 'number' ? value : 0;
}

export function validatePerformanceInputs(inputs: PerformanceInputs): PerformanceInputs {
  return {
    departure: {
      airport: String(inputs.departure.airport || '').toUpperCase(),
      elevation: ensureNumber(inputs.departure.elevation),
      runway: String(inputs.departure.runway || ''),
      surface: inputs.departure.surface === 'G' ? 'G' : 'B',
      toda: Math.max(0, ensureNumber(inputs.departure.toda)),
      lda: Math.max(0, ensureNumber(inputs.departure.lda))
    },
    slope: {
      value: Math.max(-5, Math.min(5, ensureNumber(inputs.slope.value))),
      direction: inputs.slope.direction === 'D' ? 'D' : 'U'
    },
    qnh: Math.max(900, Math.min(1100, ensureNumber(inputs.qnh))),
    temperature: Math.max(-30, Math.min(50, ensureNumber(inputs.temperature))),
    wind: {
      direction: Math.max(0, Math.min(360, ensureNumber(inputs.wind.direction))),
      speed: Math.max(0, Math.min(99, ensureNumber(inputs.wind.speed))),
      runwayHeading: Math.max(0, Math.min(360, ensureNumber(inputs.wind.runwayHeading)))
    },
    part: inputs.part === 135 ? 135 : 61
  };
}

/**
 * Makes an API call to calculate performance
 */
export async function calculatePerformance(inputs: PerformanceInputs): Promise<PerformanceOutput> {
  try {
    // Get base path from environment or use default (for GitHub Pages compatibility)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    
    const response = await fetch(`${basePath}/api/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatePerformanceInputs(inputs)),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to calculate performance');
    }
    const data = await response.json();
    return data as PerformanceOutput;
  } catch (error) {
    console.error('Error calculating performance:', error);
    throw error;
  }
}

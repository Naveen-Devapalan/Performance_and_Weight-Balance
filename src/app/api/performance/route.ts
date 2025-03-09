import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { PerformanceInputs } from '@/utils/performance';

// Database types
interface PressureAltitudeRow {
  pressure_altitude: number;
}

interface PerformanceRow extends PressureAltitudeRow {
  condition: string;
  temp_neg_25: number;
  temp_0: number;
  temp_25: number;
  temp_50: number;
  isa: number;
}

// Helper function to calculate pressure altitude
function calculatePressureAltitude(qnh: number, elevation: number) {
  const pressureAltitude = (1013 - qnh) * 30 + elevation;
  return {
    result: pressureAltitude,
    calculation: `(1013 - ${qnh}) x 30 = ${(1013 - qnh) * 30} FT + ${elevation} FT (ELEVATION) = ${pressureAltitude} FT (PRESSURE ALTITUDE)`
  };
}

// Helper function to calculate wind components
function calculateWindComponents(inputs: PerformanceInputs) {
  const direction = Number(inputs.wind.direction);
  const speed = Number(inputs.wind.speed);
  const runwayHeading = Number(inputs.wind.runwayHeading);
  
  const angle = Math.abs(direction - runwayHeading);
  const radians = (angle * Math.PI) / 180;
  
  const headwind = speed * Math.cos(radians);
  const crosswind = speed * Math.sin(radians);

  return {
    part61: {
      headwind: headwind > 0 ? headwind : null,
      tailwind: headwind < 0 ? -headwind : null,
      crosswind: Math.abs(crosswind)
    },
    part135: {
      headwind: headwind > 0 ? headwind * 0.5 : null,  // 50% of headwind
      tailwind: headwind < 0 ? -headwind * 1.5 : null, // 150% of tailwind
      crosswind: Math.abs(crosswind)
    }
  };
}

// Helper function for linear interpolation
function interpolate(x: number, x1: number, x2: number, y1: number, y2: number): number {
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

// Helper function to get temperature value based on column
function getTemperatureValue(temp: number, row: PerformanceRow): number {
  if (temp <= -25) return row.temp_neg_25;
  if (temp <= 0) return interpolate(temp, -25, 0, row.temp_neg_25, row.temp_0);
  if (temp <= 25) return interpolate(temp, 0, 25, row.temp_0, row.temp_25);
  if (temp <= 50) return interpolate(temp, 25, 50, row.temp_25, row.temp_50);
  return row.temp_50;
}

// Helper function to get performance data with interpolation
function getInterpolatedPerformance(db: DatabaseType, pressureAltitude: number, temperature: number, isLanding: boolean) {
  const tableName = isLanding ? 'landing_distance' : 'takeoff_distance';
  
  // Find the closest pressure altitudes and their performance data
  const rows = db.prepare(`
    WITH PressureAltitudes AS (
      SELECT DISTINCT pressure_altitude
      FROM ${tableName}
      WHERE pressure_altitude >= ? OR pressure_altitude <= ?
      ORDER BY ABS(pressure_altitude - ?)
      LIMIT 2
    )
    SELECT t.*
    FROM ${tableName} t
    INNER JOIN PressureAltitudes p ON t.pressure_altitude = p.pressure_altitude
    ORDER BY t.pressure_altitude, t.condition
  `).all(pressureAltitude, pressureAltitude, pressureAltitude) as PerformanceRow[];

  if (rows.length === 0) {
    throw new Error('No performance data available for the given conditions');
  }

  // Group data by pressure altitude and condition
  const rowsByAltitude = rows.reduce((acc, row) => {
    const alt = row.pressure_altitude;
    if (!acc[alt]) acc[alt] = {};
    acc[alt][row.condition] = row;
    return acc;
  }, {} as Record<number, Record<string, PerformanceRow>>);

  const altitudes = Object.keys(rowsByAltitude).map(Number);
  const alt1 = altitudes[0];
  const alt2 = altitudes[1] ?? alt1;

  // Get ground roll values for both altitudes
  const groundRoll1 = getTemperatureValue(temperature, rowsByAltitude[alt1]['Ground Roll']);
  const groundRoll2 = alt1 === alt2 ? groundRoll1 : getTemperatureValue(temperature, rowsByAltitude[alt2]['Ground Roll']);

  // Get 50ft distance values for both altitudes
  const distance50ft1 = getTemperatureValue(temperature, rowsByAltitude[alt1]['At 50 ft AGL']);
  const distance50ft2 = alt1 === alt2 ? distance50ft1 : getTemperatureValue(temperature, rowsByAltitude[alt2]['At 50 ft AGL']);

  // Interpolate between altitudes if needed
  const groundRoll = alt1 === alt2 
    ? groundRoll1 
    : interpolate(pressureAltitude, alt1, alt2, groundRoll1, groundRoll2);

  const distance50ft = alt1 === alt2 
    ? distance50ft1 
    : interpolate(pressureAltitude, alt1, alt2, distance50ft1, distance50ft2);

  return {
    groundRoll,
    distance50ft
  };
}

interface BaseData {
  groundRoll: number;
  distance50ft: number;
}

interface WindCalculation {
  part61: {
    headwind: number | null;
    tailwind: number | null;
    crosswind: number;
  };
  part135: {
    headwind: number | null;
    tailwind: number | null;
    crosswind: number;
  };
}

function calculateTakeoffDistances(baseData: BaseData, inputs: PerformanceInputs, windCalc: WindCalculation) {
  const part = inputs.part;
  const windComponents = part === 135 ? windCalc.part135 : windCalc.part61;
  
  // Base distances from database
  const groundRoll = baseData.groundRoll;
  const takeoffDistance50ft = baseData.distance50ft;

  // Wind correction (-5m per kt headwind, +15m per kt tailwind)
  const windCorrection = windComponents.headwind 
    ? -5 * windComponents.headwind 
    : windComponents.tailwind 
      ? 15 * windComponents.tailwind 
      : 0;
  const windCorrectedDistance = takeoffDistance50ft + windCorrection;

  // Surface correction (-10% for paved, applies to ground roll only)
  const surfaceCorrection = inputs.departure.surface === 'B' ? -0.1 * groundRoll : 0;
  const surfaceCorrectedDistance = windCorrectedDistance + surfaceCorrection;

  // Slope correction (±7% per 1% slope, applies to ground roll only)
  const slopeCorrection = Number(inputs.slope.value) * 0.07 * (inputs.slope.direction === 'U' ? 1 : -1) * groundRoll;
  const slopeCorrectedDistance = surfaceCorrectedDistance + slopeCorrection;

  // Final safety factor
  const safetyFactor = part === 135 ? 1.10 : 1.10;
  const finalTakeoffDistance = slopeCorrectedDistance * safetyFactor;

  // TODA feasibility check
  const toda = part === 135 
    ? Number(inputs.departure.toda) * 0.85 
    : Number(inputs.departure.toda);

  return {
    groundRoll,
    takeoffDistance50ft,
    windCorrectedDistance,
    surfaceCorrectedDistance,
    slopeCorrectedDistance,
    finalTakeoffDistance,
    toda,
    isFeasible: finalTakeoffDistance <= toda
  };
}

function calculateLandingDistances(baseData: BaseData, inputs: PerformanceInputs, windCalc: WindCalculation) {
  const part = inputs.part;
  const windComponents = part === 135 ? windCalc.part135 : windCalc.part61;
  
  // Base distances from database
  const groundRoll = baseData.groundRoll;
  const landingDistance50ft = baseData.distance50ft;

  // Wind correction (-4m per kt headwind, +13m per kt tailwind)
  const windCorrection = windComponents.headwind 
    ? -4 * windComponents.headwind 
    : windComponents.tailwind 
      ? 13 * windComponents.tailwind 
      : 0;
  const windCorrectedDistance = landingDistance50ft + windCorrection;

  // Surface correction (-10% for paved, applies to ground roll only)
  const surfaceCorrection = inputs.departure.surface === 'B' ? -0.1 * groundRoll : 0;
  const surfaceCorrectedDistance = windCorrectedDistance + surfaceCorrection;

  // Slope correction (±3% per 1% slope, applies to ground roll only)
  const slopeCorrection = Number(inputs.slope.value) * 0.03 * (inputs.slope.direction === 'U' ? -1 : 1) * groundRoll;
  const slopeCorrectedDistance = surfaceCorrectedDistance + slopeCorrection;

  // Final safety factor (1.67 for landing)
  const finalLandingDistance = slopeCorrectedDistance * 1.67;

  // LDA feasibility check
  const lda = part === 135 
    ? Number(inputs.departure.lda) * 0.85 
    : Number(inputs.departure.lda);

  return {
    groundRoll,
    landingDistance50ft,
    windCorrectedDistance,
    surfaceCorrectedDistance,
    slopeCorrectedDistance,
    finalLandingDistance,
    lda,
    isFeasible: finalLandingDistance <= lda
  };
}

export async function POST(request: Request) {
  let db: DatabaseType | null = null;
  try {
    const inputs: PerformanceInputs = await request.json();
    
    // Open database with readonly mode since we only need to read from it
    db = new Database('src/data/performance_data.db', { readonly: true });

    // Calculate pressure altitude
    const pressureAltitude = calculatePressureAltitude(
      Number(inputs.qnh), 
      Number(inputs.departure.elevation)
    );

    // Calculate wind components
    const windCalculation = calculateWindComponents(inputs);

    // Get interpolated performance data
    const isLanding = inputs.departure.runway.includes('-landing');
    const baseDistances = getInterpolatedPerformance(
      db,
      pressureAltitude.result,
      Number(inputs.temperature),
      isLanding
    );

    // Calculate final distances with all corrections
    const performanceResults = isLanding 
      ? calculateLandingDistances(baseDistances, inputs, windCalculation)
      : calculateTakeoffDistances(baseDistances, inputs, windCalculation);

    return NextResponse.json({
      pressureAltitude,
      windCalculation,
      takeoffPerformance: !isLanding ? performanceResults : null,
      landingPerformance: isLanding ? performanceResults : null
    });
  } catch (error) {
    console.error('Error in performance calculation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error calculating performance' },
      { status: 500 }
    );
  } finally {
    if (db) {
      db.close();
    }
  }
}












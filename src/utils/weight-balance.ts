// Weight & Balance Utility Functions
import {
  WeightBalanceError,
  WeightLimitError,
  CGLimitError,
  FuelCapacityError,
  CalculationError
} from './errors';

export interface WeightBalanceInputs {
  emptyWeight: number | string;
  emptyArm?: number | string;
  emptyMoment?: number | string;
  pilotWeight: number | string;
  passengerWeight: number | string;
  fuelMass: number | string;
  baggageWeight: number | string;
  flightTime: {
    trip: number | string;
    contingency: number | string;
    alternate: number | string;
    other: number | string;
    reserve: number | string;
    taxi: number | string;
  };
  // Added scenario property for dropdown selection
  scenario?: ScenarioType;
}

export type ScenarioType = 'standard' | 'maxFuel' | 'minFuel' | 'fixedBaggage';

export interface WeightBalanceOutput {
  minimumFuelRequired: {
    time: number;
    litres: number;
    weight: number;
  };
  actualFuelState: {
    actualDip: {
      litres: number;
      weight: number;
    };
    taxi: {
      litres: number;
      weight: number;
    };
    actualFlightFuel: {
      litres: number;
      weight: number;
    };
    burnOff: {
      litres: number;
      weight: number;
    };
  };
  weightAndBalance: {
    items: Array<{
      name: string;
      weight: number;
      arm: number;
      moment: number;
      max?: number;
    }>;
    takeoffWeight: number;
    landingWeight: number;
    centerOfGravity: number;
    isWithinLimits: boolean;
  };
}

export const CONVERSION_FACTORS = {
  LITRES_TO_KG: 0.72,
  FLIGHT_TIME_TO_FUEL_RATE: 18, // L/hr
};

export const DEFAULT_ARMS = {
  emptyWeight: 1.86,
  pilotPassenger: 1.800,
  fuel: 2.209,
  baggage: 2.417,
};

export const CG_LIMITS = {
  FORWARD: 1.841,
  AFT: 1.978,
  MAX_TAKEOFF_WEIGHT: 650, // kg
  MAX_BAGGAGE_WEIGHT: 20,  // kg
};

// As per TDD section 2.4
export const TAXI_FUEL_LITRES = 3; // Constant value for taxi fuel in litres
export const TAXI_FUEL_WEIGHT = Number((TAXI_FUEL_LITRES * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)); // Constant taxi fuel weight (kg)

function toNumber(value: string | number | undefined): number {
  if (typeof value === 'string') {
    const num = Number(value);
    if (isNaN(num)) {
      throw new CalculationError(`Invalid number value: ${value}`);
    }
    return num;
  }
  if (typeof value === 'undefined') {
    throw new CalculationError('Required numeric value is undefined');
  }
  return value;
}

/**
 * Calculate the minimum fuel required (in litres) based on flight time.
 * This value represents the fuel dip, i.e. the total fuel needed including taxi fuel.
 */
export function calculateMinimumFuel(inputs: WeightBalanceInputs): number {
  try {
    const tripFuel = toNumber(inputs.flightTime.trip) * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
    const contingencyFuel = toNumber(inputs.flightTime.contingency) * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
    const alternateFuel = toNumber(inputs.flightTime.alternate) * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
    const otherFuel = toNumber(inputs.flightTime.other) * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
    const reserveFuel = toNumber(inputs.flightTime.reserve) * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
    const taxiFuel = toNumber(inputs.flightTime.taxi);

    const totalFuel = tripFuel + contingencyFuel + alternateFuel + otherFuel + reserveFuel + taxiFuel;
    
    if (totalFuel > 120) { // 120L is max fuel capacity
      throw new FuelCapacityError(
        `Required fuel (${totalFuel.toFixed(1)}L) exceeds maximum fuel capacity of 120L`
      );
    }

    return Number(totalFuel.toFixed(2));
  } catch (error) {
    if (error instanceof FuelCapacityError) {
      throw error;
    }
    throw new CalculationError(
      `Failed to calculate minimum fuel: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Calculates the overall weight and balance.
 *
 * IMPORTANT: This function now distinguishes between:
 *  - The actual dip (minimum fuel required, including taxi fuel)
 *  - The actual flight fuel (fuel available for flight, i.e. actual dip minus taxi fuel)
 *
 * For the standard scenario, if inputs.fuelMass is zero, we assume the actual flight fuel = (minimum fuel weight - taxi fuel weight).
 * For other scenarios, applyScenario should have computed fuelMass to be the actual flight fuel.
 */
export function calculateWeightAndBalance(inputs: WeightBalanceInputs): WeightBalanceOutput {
  try {
    const emptyWeight = toNumber(inputs.emptyWeight);
    const emptyArm = toNumber(inputs.emptyArm) || DEFAULT_ARMS.emptyWeight;
    const emptyMoment = inputs.emptyMoment ? toNumber(inputs.emptyMoment) : undefined;
    const pilotWeight = toNumber(inputs.pilotWeight);
    const passengerWeight = toNumber(inputs.passengerWeight);
    const fuelMass = toNumber(inputs.fuelMass);
    const baggageWeight = toNumber(inputs.baggageWeight);

    // Validate baggage weight
    if (baggageWeight > CG_LIMITS.MAX_BAGGAGE_WEIGHT) {
      throw new WeightLimitError(
        `Baggage weight (${baggageWeight.toFixed(1)} kg) exceeds maximum limit of ${CG_LIMITS.MAX_BAGGAGE_WEIGHT} kg`
      );
    }

    const flightTime = {
      trip: toNumber(inputs.flightTime.trip),
      contingency: toNumber(inputs.flightTime.contingency),
      alternate: toNumber(inputs.flightTime.alternate),
      other: toNumber(inputs.flightTime.other),
      reserve: toNumber(inputs.flightTime.reserve),
      taxi: toNumber(inputs.flightTime.taxi)
    };

    // Compute minimum fuel required (actual dip) from flightTime.
    const minimumFuelLitres = calculateMinimumFuel(inputs); // This includes taxi fuel.
    const minimumFuelWeight = Number((minimumFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));

    // Taxi fuel (from flightTime input)
    const taxiFuelLitres = flightTime.taxi;
    const taxiFuelWeight = Number((taxiFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));

    // Determine the actual flight fuel:
    // If fuelMass is provided (non-zero) by a scenario (e.g. minFuel or maxFuel),
    // use it; otherwise (standard scenario) compute it as (minimum fuel - taxi fuel).
    const actualFlightFuelWeight = fuelMass > 0 ? fuelMass : Number((minimumFuelWeight - taxiFuelWeight).toFixed(2));
    const actualFlightFuelLitres = Number((actualFlightFuelWeight / CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));

    // The actual dip is always the minimum fuel (includes taxi fuel).

    // Burn off weight is computed based on trip fuel only.
    const burnOffWeight = Number((flightTime.trip * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
    const burnOffLitres = Number((burnOffWeight / CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));

    // Calculate empty moment if not provided.
    const calculatedEmptyMoment = emptyMoment || Number((emptyWeight * emptyArm).toFixed(2));

    // Weight and Balance items.
    const weightBalanceItems = [
      { 
        name: 'Empty Weight', 
        weight: emptyWeight, 
        arm: emptyArm, 
        moment: calculatedEmptyMoment
      },
      { 
        name: 'Pilot & Passenger', 
        weight: pilotWeight + passengerWeight, 
        arm: DEFAULT_ARMS.pilotPassenger, 
        moment: Number(((pilotWeight + passengerWeight) * DEFAULT_ARMS.pilotPassenger).toFixed(2)) 
      },
      { 
        name: 'Fuel Mass', 
        weight: actualFlightFuelWeight, 
        arm: DEFAULT_ARMS.fuel, 
        moment: Number((actualFlightFuelWeight * DEFAULT_ARMS.fuel).toFixed(2))
      },
      { 
        name: 'Baggage', 
        weight: baggageWeight, 
        arm: DEFAULT_ARMS.baggage, 
        moment: Number((baggageWeight * DEFAULT_ARMS.baggage).toFixed(2)),
        max: CG_LIMITS.MAX_BAGGAGE_WEIGHT
      }
    ];

    const takeoffWeight = Number((
      emptyWeight + 
      pilotWeight + 
      passengerWeight + 
      actualFlightFuelWeight + 
      baggageWeight
    ).toFixed(2));

    // Validate takeoff weight
    if (takeoffWeight > CG_LIMITS.MAX_TAKEOFF_WEIGHT) {
      throw new WeightLimitError(
        `Takeoff weight (${takeoffWeight.toFixed(1)} kg) exceeds maximum limit of ${CG_LIMITS.MAX_TAKEOFF_WEIGHT} kg`
      );
    }

    const landingWeight = Number((takeoffWeight - burnOffWeight).toFixed(2));
    const totalMoment = weightBalanceItems.reduce((sum, item) => sum + item.moment, 0);
    const centerOfGravity = Number((totalMoment / takeoffWeight).toFixed(3));

    // Validate CG
    if (!validateCGLimits(centerOfGravity)) {
      throw new CGLimitError(
        `Center of gravity (${centerOfGravity.toFixed(3)} m) is outside allowed limits (${CG_LIMITS.FORWARD}-${CG_LIMITS.AFT} m)`
      );
    }

    return {
      minimumFuelRequired: {
        time: flightTime.trip + flightTime.contingency + flightTime.alternate + flightTime.other + flightTime.reserve,
        litres: minimumFuelLitres,
        weight: minimumFuelWeight
      },
      actualFuelState: {
        actualDip: {
          litres: minimumFuelLitres,
          weight: minimumFuelWeight
        },
        taxi: {
          litres: taxiFuelLitres,
          weight: taxiFuelWeight
        },
        actualFlightFuel: {
          litres: actualFlightFuelLitres,
          weight: actualFlightFuelWeight
        },
        burnOff: {
          litres: burnOffLitres,
          weight: burnOffWeight
        }
      },
      weightAndBalance: {
        items: [
          ...weightBalanceItems,
          { 
            name: 'Take Off Weight', 
            weight: takeoffWeight, 
            arm: centerOfGravity, 
            moment: totalMoment,
            max: CG_LIMITS.MAX_TAKEOFF_WEIGHT
          },
          { 
            name: 'Burn Off', 
            weight: burnOffWeight, 
            arm: DEFAULT_ARMS.fuel, 
            moment: -Number((burnOffWeight * DEFAULT_ARMS.fuel).toFixed(2)) 
          },
          { 
            name: 'Landing Weight', 
            weight: landingWeight, 
            arm: Number(((totalMoment - (burnOffWeight * DEFAULT_ARMS.fuel)) / landingWeight).toFixed(3)), 
            moment: totalMoment - (burnOffWeight * DEFAULT_ARMS.fuel),
            max: CG_LIMITS.MAX_TAKEOFF_WEIGHT
          }
        ],
        takeoffWeight,
        landingWeight,
        centerOfGravity,
        isWithinLimits: validateCGLimits(centerOfGravity) && takeoffWeight <= CG_LIMITS.MAX_TAKEOFF_WEIGHT
      }
    };
  } catch (error) {
    if (error instanceof WeightBalanceError) {
      throw error;
    }
    throw new CalculationError(
      `Failed to calculate weight and balance: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function validateCGLimits(cg: number): boolean {
  return cg >= CG_LIMITS.FORWARD && cg <= CG_LIMITS.AFT;
}

export function convertUSGallonToLitres(gallons: number): number {
  return Number((gallons * 3.78).toFixed(2));
}

export function convertUSGallonToKG(gallons: number): number {
  return Number((gallons * 2.72).toFixed(2));
}

export function convertLitresToKG(litres: number): number {
  return Number((litres * 0.72).toFixed(2));
}

export function convertImperialGallonToKG(gallons: number): number {
  return Number((gallons * 3.27).toFixed(2));
}

/**
 * Apply scenario toggles as per TDD section 2.3.
 *
 * For the 'minFuel' scenario, we compute:
 *   - The minimum fuel required (dip)
 *   - The actual flight fuel as (dip - taxi fuel weight)
 *   - Adjust baggage weight accordingly.
 *
 * For other scenarios, similar logic can be applied.
 */
export function applyScenario(
  inputs: WeightBalanceInputs, 
  scenario: ScenarioType
): WeightBalanceInputs {
  const updatedInputs = { ...inputs };
  
  switch (scenario) {
    case 'minFuel': {
      const minFuelLitres = calculateMinimumFuel(updatedInputs);
      const minFuelWeight = Number((minFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
      const actualFlightFuel = Number((minFuelWeight - TAXI_FUEL_WEIGHT).toFixed(2));

      const baseWeight = Number((
        toNumber(updatedInputs.emptyWeight) +
        toNumber(updatedInputs.pilotWeight) +
        toNumber(updatedInputs.passengerWeight) +
        actualFlightFuel
      ).toFixed(2));

      const remainingWeight = Number((CG_LIMITS.MAX_TAKEOFF_WEIGHT - baseWeight).toFixed(2));
      
      const maxBaggage = Math.min(
        CG_LIMITS.MAX_BAGGAGE_WEIGHT,
        Math.max(0, remainingWeight)
      );

      const totalWeight = Number((baseWeight + maxBaggage).toFixed(2));
      const adjustedBaggage = totalWeight > CG_LIMITS.MAX_TAKEOFF_WEIGHT 
        ? Number((maxBaggage - (totalWeight - CG_LIMITS.MAX_TAKEOFF_WEIGHT)).toFixed(2))
        : maxBaggage;

      return {
        ...updatedInputs,
        scenario: scenario,
        baggageWeight: adjustedBaggage,
        fuelMass: actualFlightFuel
      };
    }
    
    case 'maxFuel':
      // Similar logic for maxFuel can be added here.
      return updatedInputs;
    
    case 'fixedBaggage':
      // Similar logic for fixedBaggage can be added here.
      return updatedInputs;
    
    default:
      // For the 'standard' scenario, we leave baggageWeight and fuelMass unchanged.
      return {
        ...updatedInputs,
        scenario: scenario,
        baggageWeight: 3,
        fuelMass: 0
      };
  }
}

/**
 * Calculates the weight and balance by making an API call.
 */
export async function calculateWeightBalanceAPI(inputs: WeightBalanceInputs): Promise<WeightBalanceOutput> {
  try {
    // Get base path from environment or use default (for GitHub Pages compatibility)
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    
    const response = await fetch(`${basePath}/api/weight-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to calculate weight and balance');
    }
    
    const data = await response.json();
    return data as WeightBalanceOutput;
  } catch (error) {
    console.error('Error calculating weight and balance:', error);
    throw error;
  }
}

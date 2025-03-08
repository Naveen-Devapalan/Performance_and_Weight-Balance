// Weight & Balance Utility Functions
export interface WeightBalanceInputs {
  emptyWeight: number;
  emptyArm?: number;
  emptyMoment?: number;
  pilotWeight: number;
  passengerWeight: number;
  fuelMass: number;
  baggageWeight: number;
  flightTime: {
    trip: number;
    contingency: number;
    alternate: number;
    other: number;
    reserve: number;
    taxi: number;
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
export const TAXI_FUEL_WEIGHT = Number((TAXI_FUEL_LITRES * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)); // Constant value for taxi fuel in kg

export function calculateMinimumFuel(inputs: WeightBalanceInputs): number {
  const { flightTime } = inputs;
  
  // Per TDD 2.4: Trip + 10% Contingency + Alternate + Other + Reserve + Taxi
  const tripFuel = flightTime.trip * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  
  // Contingency is 10% of trip fuel
  const contingencyFuel = tripFuel * 0.1;
  
  const alternateFuel = flightTime.alternate * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  const otherFuel = flightTime.other * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  const reserveFuel = flightTime.reserve * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  // Use the taxi fuel value provided by the user (default is 3L)
  const taxiFuel = flightTime.taxi;
  
  return Number((tripFuel + contingencyFuel + alternateFuel + otherFuel + reserveFuel + taxiFuel).toFixed(2));
}

export function calculateWeightAndBalance(inputs: WeightBalanceInputs): WeightBalanceOutput {
  // Removed the dedicated maxFuel branch.
  // For maxFuel, the fuelMass is computed in handleCalculate and passed via inputs.
  const { 
    emptyWeight, 
    emptyArm = DEFAULT_ARMS.emptyWeight,
    emptyMoment,
    pilotWeight, 
    passengerWeight, 
    fuelMass, 
    baggageWeight,
    flightTime 
  } = inputs;

  // Fuel calculations
  const minimumFuelLitres = calculateMinimumFuel(inputs);
  const minimumFuelWeight = Number((minimumFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
  const burnOffWeight = Number((flightTime.trip * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));

  // Calculate empty moment if not provided
  const calculatedEmptyMoment = emptyMoment || Number((emptyWeight * emptyArm).toFixed(2));

  // Weight and Balance Calculations for all scenarios
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
      weight: fuelMass, 
      arm: DEFAULT_ARMS.fuel, 
      moment: Number((fuelMass * DEFAULT_ARMS.fuel).toFixed(2)),
      max: undefined 
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
    fuelMass + 
    baggageWeight
  ).toFixed(2));

  const landingWeight = Number((takeoffWeight - burnOffWeight).toFixed(2));

  const totalMoment = weightBalanceItems.reduce((sum, item) => sum + item.moment, 0);
  const centerOfGravity = Number((totalMoment / takeoffWeight).toFixed(3));
  const isWithinLimits = validateCGLimits(centerOfGravity) && takeoffWeight <= CG_LIMITS.MAX_TAKEOFF_WEIGHT;

  return {
    minimumFuelRequired: {
      time: flightTime.trip + flightTime.contingency + flightTime.alternate + flightTime.other + flightTime.reserve,
      litres: Number((fuelMass / CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)),  // Convert from actual flight fuel
      weight: fuelMass  // Use actual flight fuel weight
    },
    actualFuelState: {
      actualDip: {
        litres: Number((fuelMass / CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)),
        weight: fuelMass
      },
      taxi: {
        litres: flightTime.taxi,
        weight: Number((flightTime.taxi * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2))
      },
      actualFlightFuel: {
        litres: Number((fuelMass / CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2)),
        weight: fuelMass
      },
      burnOff: {
        litres: burnOffWeight / CONVERSION_FACTORS.LITRES_TO_KG,
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
      isWithinLimits
    }
  };
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
 * Apply scenario toggles as per TDD section 2.3
 * Now simplified to always return the unchanged inputs.
 */
export function applyScenario(
  inputs: WeightBalanceInputs, 
  scenario: ScenarioType
): WeightBalanceInputs {
  const updatedInputs = {...inputs};
  
  switch (scenario) {
    case 'minFuel':
      // Calculate minimum fuel requirements
      const minFuelLitres = calculateMinimumFuel(updatedInputs);
      const minFuelWeight = Number((minFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
      const actualFlightFuel = Number((minFuelWeight - TAXI_FUEL_WEIGHT).toFixed(2));

      // Calculate weights without baggage
      const baseWeight = Number((
        updatedInputs.emptyWeight +
        updatedInputs.pilotWeight +
        updatedInputs.passengerWeight +
        actualFlightFuel
      ).toFixed(2));

      // Calculate remaining weight for baggage with precision handling
      const remainingWeight = Number((CG_LIMITS.MAX_TAKEOFF_WEIGHT - baseWeight).toFixed(2));
      
      // Calculate max allowable baggage
      const maxBaggage = Math.min(
        CG_LIMITS.MAX_BAGGAGE_WEIGHT,
        Math.max(0, remainingWeight)
      );

      // Final check to ensure we don't exceed MAX_TAKEOFF_WEIGHT
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
    
    case 'maxFuel':
      // Similar logic for maxFuel...
      return updatedInputs;
    
    case 'fixedBaggage':
      // Similar logic for fixedBaggage...
      return updatedInputs;
    
    default:
      // For 'standard' scenario
      return {
        ...updatedInputs,
        scenario: scenario,
        baggageWeight: 3,
        fuelMass: 0
      };
  }
}

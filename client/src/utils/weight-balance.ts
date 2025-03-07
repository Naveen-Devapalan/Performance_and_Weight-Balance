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
}

export type ScenarioType = 'standard' | 'maxFuel' | 'minFuel' | 'fixedBaggage' | 'performanceLimited';

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
  
  // Contingency should be 10% of trip fuel, not just use the contingency time directly
  // This aligns with the TDD which specifies contingency as 10% of trip fuel
  const contingencyFuel = tripFuel * 0.1;
  
  const alternateFuel = flightTime.alternate * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  const otherFuel = flightTime.other * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  const reserveFuel = flightTime.reserve * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
  const taxiFuel = TAXI_FUEL_LITRES;  // Use constant value as per TDD section 2.4

  return Number((tripFuel + contingencyFuel + alternateFuel + otherFuel + reserveFuel + taxiFuel).toFixed(2));
}

export function calculateWeightAndBalance(inputs: WeightBalanceInputs): WeightBalanceOutput {
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

  // Weight and Balance Calculations
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
      litres: minimumFuelLitres,
      weight: minimumFuelWeight
    },
    actualFuelState: {
      actualDip: {
        litres: minimumFuelLitres,
        weight: minimumFuelWeight
      },
      taxi: {
        litres: TAXI_FUEL_LITRES,
        weight: TAXI_FUEL_WEIGHT
      },
      actualFlightFuel: {
        litres: minimumFuelLitres - TAXI_FUEL_LITRES,
        weight: Number(((minimumFuelLitres - TAXI_FUEL_LITRES) * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2))
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
 */
export function applyScenario(
  inputs: WeightBalanceInputs, 
  scenario: ScenarioType
): WeightBalanceInputs {
  const updatedInputs = {...inputs};
  
  switch (scenario) {
    case 'maxFuel':
      // Calculate maximum possible fuel without exceeding TOW
      const maxPayloadWeight = inputs.pilotWeight + inputs.passengerWeight;
      const maxAvailableWeight = CG_LIMITS.MAX_TAKEOFF_WEIGHT - inputs.emptyWeight - maxPayloadWeight;
      
      // Set baggage to 0 or minimal and maximize fuel
      updatedInputs.baggageWeight = 0;
      updatedInputs.fuelMass = Math.min(maxAvailableWeight, 120); // Assume max tank capacity is 120kg
      break;
      
    case 'minFuel':
      // Calculate minimal flight fuel (trip + mandatory reserves)
      const minFuelLitres = 
        (inputs.flightTime.trip + inputs.flightTime.reserve) * 
        CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
      const minFuelWeight = Number((minFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
      
      // Maximum available weight for baggage
      const maxBaggageWeight = Math.min(
        CG_LIMITS.MAX_BAGGAGE_WEIGHT,
        CG_LIMITS.MAX_TAKEOFF_WEIGHT - inputs.emptyWeight - inputs.pilotWeight - inputs.passengerWeight - minFuelWeight
      );
      
      updatedInputs.fuelMass = minFuelWeight;
      updatedInputs.baggageWeight = maxBaggageWeight;
      break;
      
    case 'fixedBaggage':
      // Keep baggage fixed, adjust fuel to not exceed TOW
      const maxFuelWithFixedBaggage = 
        CG_LIMITS.MAX_TAKEOFF_WEIGHT - 
        inputs.emptyWeight - 
        inputs.pilotWeight - 
        inputs.passengerWeight - 
        inputs.baggageWeight;
      
      updatedInputs.fuelMass = Math.max(0, maxFuelWithFixedBaggage);
      break;
      
    case 'performanceLimited':
      // Per TDD section 2.3.4: Performance-Limited scenario
      // Reduce TOW to 95% of maximum for performance considerations
      const reducedMaxTOW = CG_LIMITS.MAX_TAKEOFF_WEIGHT * 0.95;
      const currentTOW = 
        inputs.emptyWeight + 
        inputs.pilotWeight + 
        inputs.passengerWeight + 
        inputs.baggageWeight + 
        inputs.fuelMass;
      
      if (currentTOW > reducedMaxTOW) {
        // Reduce fuel to meet the performance-limited TOW
        const excessWeight = currentTOW - reducedMaxTOW;
        // Make sure we can't have negative fuel
        updatedInputs.fuelMass = Math.max(0, inputs.fuelMass - excessWeight);
        
        // If even with zero fuel we're still over the limit, reduce baggage next
        const updatedTOW = 
          inputs.emptyWeight + 
          inputs.pilotWeight + 
          inputs.passengerWeight + 
          updatedInputs.baggageWeight + 
          updatedInputs.fuelMass;
          
        if (updatedTOW > reducedMaxTOW && updatedInputs.fuelMass === 0) {
          const remainingExcess = updatedTOW - reducedMaxTOW;
          updatedInputs.baggageWeight = Math.max(0, inputs.baggageWeight - remainingExcess);
        }
      }
      break;
      
    default:
      // No changes for standard scenario
      break;
  }
  
  return updatedInputs;
}

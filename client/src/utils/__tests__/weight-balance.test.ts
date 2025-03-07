import {
  calculateMinimumFuel,
  calculateWeightAndBalance,
  validateCGLimits,
  applyScenario,
  TAXI_FUEL_LITRES,
  CONVERSION_FACTORS,
  CG_LIMITS,
  convertUSGallonToLitres,
  convertUSGallonToKG,
  convertLitresToKG,
  convertImperialGallonToKG
} from '../weight-balance';

describe('Weight & Balance Calculations', () => {
  // Standard test case based on TDD example
  const standardInputs = {
    emptyWeight: 432.21,
    emptyArm: 1.86,
    pilotWeight: 75,
    passengerWeight: 80,
    fuelMass: 59.79,
    baggageWeight: 3,
    flightTime: {
      trip: 2.0,
      contingency: 0.42, // Note: In our implementation, we calculate contingency as 10% of trip fuel
      alternate: 0,
      other: 0.2,
      reserve: 0.5,
      taxi: 0.2
    }
  };

  describe('calculateMinimumFuel', () => {
    it('should calculate minimum fuel requirement correctly', () => {
      const result = calculateMinimumFuel(standardInputs);
      
      // As per TDD 2.4: Trip + 10% of Trip + Alternate + Other + Reserve + Taxi
      const tripFuel = 2.0 * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE; // 36.0 L
      const contingencyFuel = tripFuel * 0.1; // 3.6 L (10% of trip fuel)
      const alternateFuel = 0 * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE; // 0 L
      const otherFuel = 0.2 * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE; // 3.6 L
      const reserveFuel = 0.5 * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE; // 9.0 L
      const taxiFuel = TAXI_FUEL_LITRES; // 3.0 L (constant value)
      
      const expectedLitres = Number((tripFuel + contingencyFuel + alternateFuel + otherFuel + reserveFuel + taxiFuel).toFixed(2));
      
      // Allow small floating point difference
      expect(result).toEqual(expectedLitres);
    });
  });

  describe('calculateWeightAndBalance', () => {
    it('should calculate weight and balance values correctly', () => {
      const result = calculateWeightAndBalance(standardInputs);
      
      // Total weight calculation
      const expectedTakeoffWeight = 
        standardInputs.emptyWeight +
        standardInputs.pilotWeight +
        standardInputs.passengerWeight +
        standardInputs.fuelMass +
        standardInputs.baggageWeight;
      
      expect(result.weightAndBalance.takeoffWeight).toBeCloseTo(expectedTakeoffWeight, 1);
      
      // Burnoff calculation
      const expectedBurnOff = standardInputs.flightTime.trip * CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE * CONVERSION_FACTORS.LITRES_TO_KG;
      expect(result.weightAndBalance.items.find(i => i.name === 'Burn Off')?.weight).toBeCloseTo(expectedBurnOff, 1);
      
      // Landing weight calculation
      expect(result.weightAndBalance.landingWeight).toBeCloseTo(expectedTakeoffWeight - expectedBurnOff, 1);
    });

    it('should calculate CG correctly and determine if it is within limits', () => {
      const result = calculateWeightAndBalance(standardInputs);
      
      // Ensure CG is a reasonable value
      expect(result.weightAndBalance.centerOfGravity).toBeGreaterThan(1.5);
      expect(result.weightAndBalance.centerOfGravity).toBeLessThan(2.5);
      
      // Check limit validation
      if (result.weightAndBalance.centerOfGravity >= CG_LIMITS.FORWARD && 
          result.weightAndBalance.centerOfGravity <= CG_LIMITS.AFT && 
          result.weightAndBalance.takeoffWeight <= CG_LIMITS.MAX_TAKEOFF_WEIGHT) {
        expect(result.weightAndBalance.isWithinLimits).toBe(true);
      } else {
        expect(result.weightAndBalance.isWithinLimits).toBe(false);
      }
    });
  });

  describe('validateCGLimits', () => {
    it('should validate CG within limits', () => {
      expect(validateCGLimits(1.85)).toBe(true);
      expect(validateCGLimits(1.95)).toBe(true);
    });

    it('should invalidate CG outside limits', () => {
      expect(validateCGLimits(1.80)).toBe(false);
      expect(validateCGLimits(2.0)).toBe(false);
    });
  });

  describe('applyScenario', () => {
    it('should maximize fuel and minimize baggage for maxFuel scenario', () => {
      const result = applyScenario(standardInputs, 'maxFuel');
      
      // Baggage should be minimal
      expect(result.baggageWeight).toBe(0);
      
      // Fuel should be maximized but not exceed TOW
      const maxAvailableWeight = CG_LIMITS.MAX_TAKEOFF_WEIGHT - 
        standardInputs.emptyWeight - 
        standardInputs.pilotWeight - 
        standardInputs.passengerWeight;
      
      expect(result.fuelMass).toBeLessThanOrEqual(Math.min(120, maxAvailableWeight));
    });

    it('should minimize fuel and maximize baggage for minFuel scenario', () => {
      const result = applyScenario(standardInputs, 'minFuel');
      
      // Minimal required fuel for trip + reserves
      const minFuelLitres = 
        (standardInputs.flightTime.trip + standardInputs.flightTime.reserve) * 
        CONVERSION_FACTORS.FLIGHT_TIME_TO_FUEL_RATE;
      const minFuelWeight = Number((minFuelLitres * CONVERSION_FACTORS.LITRES_TO_KG).toFixed(2));
      
      expect(result.fuelMass).toBeCloseTo(minFuelWeight, 1);
      
      // Baggage should be maximized but not exceed limits
      expect(result.baggageWeight).toBeLessThanOrEqual(CG_LIMITS.MAX_BAGGAGE_WEIGHT);
    });

    it('should keep baggage weight fixed for fixedBaggage scenario', () => {
      const originalBaggageWeight = standardInputs.baggageWeight;
      const result = applyScenario(standardInputs, 'fixedBaggage');
      
      // Baggage should remain the same
      expect(result.baggageWeight).toBe(originalBaggageWeight);
      
      // Ensure total weight doesn't exceed max TOW
      const totalWeight = 
        result.emptyWeight + 
        result.pilotWeight + 
        result.passengerWeight + 
        result.fuelMass + 
        result.baggageWeight;
        
      expect(totalWeight).toBeLessThanOrEqual(CG_LIMITS.MAX_TAKEOFF_WEIGHT);
    });

    it('should reduce TOW for performanceLimited scenario if needed', () => {
      // Create an input that's close to or at max TOW
      const heavyInput = {
        ...standardInputs,
        emptyWeight: 432.21,
        pilotWeight: 90,
        passengerWeight: 90,
        fuelMass: 100,
        baggageWeight: 20
      };
      
      // Calculate the initial total weight to verify we're over the limit
      const initialTotalWeight = 
        heavyInput.emptyWeight + 
        heavyInput.pilotWeight + 
        heavyInput.passengerWeight + 
        heavyInput.fuelMass + 
        heavyInput.baggageWeight;
      
      expect(initialTotalWeight).toBeGreaterThan(CG_LIMITS.MAX_TAKEOFF_WEIGHT * 0.95);
      
      const result = applyScenario(heavyInput, 'performanceLimited');
      
      // Calculate total weight after scenario application
      const totalWeight = 
        result.emptyWeight + 
        result.pilotWeight + 
        result.passengerWeight + 
        result.fuelMass + 
        result.baggageWeight;
      
      // For heavy inputs that exceed 95% of max TOW, ensure they're reduced
      expect(totalWeight).toBeLessThanOrEqual(CG_LIMITS.MAX_TAKEOFF_WEIGHT * 0.95);
      // Fuel should be reduced from the original value
      expect(result.fuelMass).toBeLessThan(heavyInput.fuelMass);
    });
  });

  describe('Conversion Functions', () => {
    it('should convert US gallons to litres correctly', () => {
      expect(convertUSGallonToLitres(1)).toBe(3.78);
      expect(convertUSGallonToLitres(10)).toBe(37.80);
    });

    it('should convert US gallons to KG correctly', () => {
      expect(convertUSGallonToKG(1)).toBe(2.72);
      expect(convertUSGallonToKG(10)).toBe(27.20);
    });

    it('should convert litres to KG correctly', () => {
      expect(convertLitresToKG(1)).toBe(0.72);
      expect(convertLitresToKG(10)).toBe(7.20);
    });

    it('should convert Imperial gallons to KG correctly', () => {
      expect(convertImperialGallonToKG(1)).toBe(3.27);
      expect(convertImperialGallonToKG(10)).toBe(32.70);
    });
  });
});
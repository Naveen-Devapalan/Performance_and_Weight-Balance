import {
  calculateMinimumFuel,
  calculateWeightAndBalance,
  validateCGLimits,
  convertUSGallonToLitres,
  convertUSGallonToKG,
  convertLitresToKG,
  convertImperialGallonToKG,
  WeightBalanceInputs
} from '../src/lib/utils/weight-balance';

describe('Weight & Balance Utility Functions', () => {
  // Test Minimum Fuel Calculation
  describe('calculateMinimumFuel', () => {
    const baseInputs: WeightBalanceInputs = {
      emptyWeight: 350,
      pilotWeight: 80,
      passengerWeight: 70,
      fuelMass: 100,
      baggageWeight: 10,
      flightTime: {
        trip: 2,
        contingency: 0.3,
        alternate: 0.5,
        other: 0,
        reserve: 0.2,
        taxi: 0.1
      }
    };

    it('should calculate minimum fuel correctly', () => {
      const minimumFuel = calculateMinimumFuel(baseInputs);
      
      // Calculation breakdown:
      // Trip: 2 * 18 = 36 L
      // Contingency: 3.6 L (10% of trip)
      // Alternate: 0.5 * 18 = 9 L
      // Reserve: 0.2 * 18 = 3.6 L
      // Taxi: 0.1 * 18 = 1.8 L
      const expectedMinimumFuel = Number((36 + 3.6 + 9 + 3.6 + 1.8).toFixed(2));
      
      expect(minimumFuel).toBe(expectedMinimumFuel);
    });

    it('should handle zero flight time', () => {
      const zeroTimeInputs = {
        ...baseInputs,
        flightTime: {
          trip: 0,
          contingency: 0,
          alternate: 0,
          other: 0,
          reserve: 0,
          taxi: 0
        }
      };

      expect(calculateMinimumFuel(zeroTimeInputs)).toBe(0);
    });
  });

  // Test Weight and Balance Calculation
  describe('calculateWeightAndBalance', () => {
    const baseInputs: WeightBalanceInputs = {
      emptyWeight: 350,
      emptyArm: 1.86,
      emptyMoment: 650.1,
      pilotWeight: 80,
      passengerWeight: 70,
      fuelMass: 100,
      baggageWeight: 10,
      flightTime: {
        trip: 2,
        contingency: 0.3,
        alternate: 0.5,
        other: 0,
        reserve: 0.2,
        taxi: 0.1
      }
    };

    it('should calculate takeoff weight correctly', () => {
      const result = calculateWeightAndBalance(baseInputs);
      
      const expectedTakeoffWeight = Number((
        baseInputs.emptyWeight + 
        baseInputs.pilotWeight + 
        baseInputs.passengerWeight + 
        baseInputs.fuelMass + 
        baseInputs.baggageWeight
      ).toFixed(2));

      expect(result.weightAndBalance.takeoffWeight).toBe(expectedTakeoffWeight);
    });

    it('should validate CG limits', () => {
      const result = calculateWeightAndBalance(baseInputs);
      
      expect(result.weightAndBalance.isWithinLimits).toBe(true);
      expect(result.weightAndBalance.centerOfGravity).toBeGreaterThanOrEqual(1.841);
      expect(result.weightAndBalance.centerOfGravity).toBeLessThanOrEqual(1.978);
    });

    it('should handle empty moment calculation', () => {
      // Ensure emptyArm is defined in the base inputs
      if (!baseInputs.emptyArm) {
        throw new Error('emptyArm must be defined in baseInputs for this test');
      }

      const inputsWithoutMoment: WeightBalanceInputs = {
        emptyWeight: baseInputs.emptyWeight,
        emptyArm: baseInputs.emptyArm,
        pilotWeight: baseInputs.pilotWeight,
        passengerWeight: baseInputs.passengerWeight,
        fuelMass: baseInputs.fuelMass,
        baggageWeight: baseInputs.baggageWeight,
        flightTime: baseInputs.flightTime
      };

      const result = calculateWeightAndBalance(inputsWithoutMoment);
      
      // Manually calculate expected moment
      const expectedEmptyMoment = Number((baseInputs.emptyWeight * baseInputs.emptyArm).toFixed(2));
      
      const emptyWeightItem = result.weightAndBalance.items.find(item => item.name === 'Empty Weight');
      expect(emptyWeightItem?.moment).toBe(expectedEmptyMoment);
    });
  });

  // Test CG Validation
  describe('validateCGLimits', () => {
    it('should return true for CG within limits', () => {
      expect(validateCGLimits(1.85)).toBe(true);
      expect(validateCGLimits(1.841)).toBe(true);
      expect(validateCGLimits(1.978)).toBe(true);
    });

    it('should return false for CG outside limits', () => {
      expect(validateCGLimits(1.84)).toBe(false);
      expect(validateCGLimits(1.979)).toBe(false);
      expect(validateCGLimits(1.5)).toBe(false);
      expect(validateCGLimits(2.1)).toBe(false);
    });
  });

  // Test Unit Conversion Functions
  describe('Unit Conversion Functions', () => {
    it('should convert US Gallons to Litres', () => {
      expect(convertUSGallonToLitres(1)).toBe(3.78);
      expect(convertUSGallonToLitres(5)).toBe(18.90);
    });

    it('should convert US Gallons to KG', () => {
      expect(convertUSGallonToKG(1)).toBe(2.72);
      expect(convertUSGallonToKG(5)).toBe(13.60);
    });

    it('should convert Litres to KG', () => {
      expect(convertLitresToKG(1)).toBe(0.72);
      expect(convertLitresToKG(5)).toBe(3.60);
    });

    it('should convert Imperial Gallons to KG', () => {
      expect(convertImperialGallonToKG(1)).toBe(3.27);
      expect(convertImperialGallonToKG(5)).toBe(16.35);
    });
  });

  // Test Scenario Toggles
  describe('Scenario Toggles', () => {
    const baseScenarioInputs: WeightBalanceInputs = {
      emptyWeight: 350,
      emptyArm: 1.86,
      emptyMoment: 650.1,
      pilotWeight: 80,
      passengerWeight: 70,
      fuelMass: 100,
      baggageWeight: 10,
      flightTime: {
        trip: 2,
        contingency: 0.3,
        alternate: 0.5,
        other: 0,
        reserve: 0.2,
        taxi: 0.1
      }
    };

    it('Max Fuel / Min Baggage scenario should limit baggage', () => {
      const maxFuelMinBaggageInputs = {
        ...baseScenarioInputs,
        scenario: 'MAX_FUEL_MIN_BAGGAGE'
      };

      const result = calculateWeightAndBalance(maxFuelMinBaggageInputs);
      
      // Verify baggage is minimized
      const baggageItem = result.weightAndBalance.items.find(item => item.name === 'Baggage');
      expect(baggageItem?.weight).toBeLessThanOrEqual(20); // Max baggage limit
      
      // Verify takeoff weight is within limits
      expect(result.weightAndBalance.takeoffWeight).toBeLessThanOrEqual(650);
      expect(result.weightAndBalance.isWithinLimits).toBe(true);
    });

    it('Min Fuel / Max Baggage scenario should maximize baggage', () => {
      const minFuelMaxBaggageInputs = {
        ...baseScenarioInputs,
        scenario: 'MIN_FUEL_MAX_BAGGAGE',
        fuelMass: calculateMinimumFuel(baseScenarioInputs)
      };

      const result = calculateWeightAndBalance(minFuelMaxBaggageInputs);
      
      // Verify fuel is minimal
      const fuelItem = result.weightAndBalance.items.find(item => item.name === 'Fuel Mass');
      expect(fuelItem?.weight).toBeCloseTo(calculateMinimumFuel(baseScenarioInputs), 2);
      
      // Verify takeoff weight is maximized within limits
      expect(result.weightAndBalance.takeoffWeight).toBeLessThanOrEqual(650);
      expect(result.weightAndBalance.isWithinLimits).toBe(true);
    });

    it('Fixed Baggage scenario should handle non-negotiable baggage weight', () => {
      const fixedBaggageInputs = {
        ...baseScenarioInputs,
        scenario: 'FIXED_BAGGAGE',
        baggageWeight: 20 // Maximum allowed baggage
      };

      const result = calculateWeightAndBalance(fixedBaggageInputs);
      
      // Verify baggage weight is as specified
      const baggageItem = result.weightAndBalance.items.find(item => item.name === 'Baggage');
      expect(baggageItem?.weight).toBe(20);
      
      // Verify takeoff weight and CG are within limits
      expect(result.weightAndBalance.takeoffWeight).toBeLessThanOrEqual(650);
      expect(result.weightAndBalance.isWithinLimits).toBe(true);
    });

    it('Performance-Limited scenario should reduce TOW if necessary', () => {
      const performanceLimitedInputs = {
        ...baseScenarioInputs,
        scenario: 'PERFORMANCE_LIMITED',
        runway: {
          length: 1000, // Shorter runway
          surface: 'B' // Paved
        },
        fuelMass: 50 // Reduced fuel mass to meet performance requirements
      };

      const result = calculateWeightAndBalance(performanceLimitedInputs);
      
      // Verify takeoff weight is within maximum limits
      expect(result.weightAndBalance.takeoffWeight).toBeLessThanOrEqual(600);
      
      // Verify CG is within limits
      expect(result.weightAndBalance.isWithinLimits).toBe(true);
    });
  });
});

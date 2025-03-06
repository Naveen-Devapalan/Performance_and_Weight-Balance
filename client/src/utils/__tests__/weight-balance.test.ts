import {
  calculateMinimumFuel,
  calculateWeightAndBalance,
  validateCGLimits,
  convertUSGallonToLitres,
  convertUSGallonToKG,
  convertLitresToKG,
  convertImperialGallonToKG,
  WeightBalanceInputs
} from '../weight-balance';

describe('Weight and Balance Calculations', () => {
  const sampleInput: WeightBalanceInputs = {
    emptyWeight: 400,
    emptyArm: 1.86,
    pilotWeight: 75,
    passengerWeight: 75,
    fuelMass: 50,
    baggageWeight: 15,
    flightTime: {
      trip: 1.5,
      contingency: 0.2,
      alternate: 0.5,
      other: 0,
      reserve: 0.75,
      taxi: 0.2
    }
  };

  describe('calculateMinimumFuel', () => {
    it('should calculate correct minimum fuel requirement', () => {
      const result = calculateMinimumFuel(sampleInput);
      // Trip: 1.5 * 18 = 27
      // Contingency: 27 * 0.1 = 2.7
      // Alternate: 0.5 * 18 = 9
      // Reserve: 0.75 * 18 = 13.5
      // Taxi: 0.2 * 18 = 3.6
      // Total: 55.8
      expect(result).toBe(55.8);
    });
  });

  describe('calculateWeightAndBalance', () => {
    const result = calculateWeightAndBalance(sampleInput);

    it('should calculate correct takeoff weight', () => {
      expect(result.weightAndBalance.takeoffWeight).toBe(615);
    });

    it('should calculate correct center of gravity', () => {
      // CG should be within limits (1.841 - 1.978)
      expect(result.weightAndBalance.centerOfGravity).toBeGreaterThanOrEqual(1.841);
      expect(result.weightAndBalance.centerOfGravity).toBeLessThanOrEqual(1.978);
    });

    it('should validate weight and balance limits', () => {
      expect(result.weightAndBalance.isWithinLimits).toBe(true);
    });

    it('should calculate correct minimum fuel requirements', () => {
      expect(result.minimumFuelRequired.time).toBe(2.95); // Sum of trip(1.5) + contingency(0.2) + alternate(0.5) + other(0) + reserve(0.75) - taxi not included in total time
      expect(result.minimumFuelRequired.weight).toBeGreaterThan(0);
    });
  });

  describe('validateCGLimits', () => {
    it('should return true for CG within limits', () => {
      expect(validateCGLimits(1.9)).toBe(true);
    });

    it('should return false for CG outside limits', () => {
      expect(validateCGLimits(1.8)).toBe(false);
      expect(validateCGLimits(2.0)).toBe(false);
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
import { calculateWeightAndBalance, WeightBalanceInputs, WeightBalanceOutput } from '../weight-balance';

describe('Weight and Balance Calculations', () => {
  describe('calculateWeightAndBalance', () => {
    it('should calculate CG correctly with standard inputs', () => {
      const inputs: WeightBalanceInputs = {
        emptyWeight: 1500,
        emptyArm: 39.0,
        pilotWeight: 180,
        passengerWeight: 160,
        baggageWeight: 50,
        fuelMass: 240,
        flightTime: {
          trip: 2.0,
          contingency: 0.5,
          alternate: 0.5,
          other: 0,
          reserve: 0.75,
          taxi: 0.25
        }
      };

      const result = calculateWeightAndBalance(inputs);
      expect(result.weightAndBalance.takeoffWeight).toBeGreaterThan(0);
      expect(result.weightAndBalance.centerOfGravity).toBeGreaterThan(0);
    });

    it('should handle zero weight inputs', () => {
      const inputs: WeightBalanceInputs = {
        emptyWeight: 1500,
        emptyArm: 39.0,
        pilotWeight: 0,
        passengerWeight: 0,
        baggageWeight: 0,
        fuelMass: 0,
        flightTime: {
          trip: 0,
          contingency: 0,
          alternate: 0,
          other: 0,
          reserve: 0,
          taxi: 0
        }
      };

      const result = calculateWeightAndBalance(inputs);
      expect(result.weightAndBalance.takeoffWeight).toBe(1500); // Only empty weight
      expect(result.weightAndBalance.centerOfGravity).toBe(39.0); // Empty weight arm
    });
  });
});

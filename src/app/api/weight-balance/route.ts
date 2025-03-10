import { NextResponse } from 'next/server';
import { calculateWeightAndBalance, WeightBalanceInputs } from '@/utils/weight-balance';
import { validateWeightBalanceInputs } from '@/utils/validation';
import { 
  isWeightBalanceError, 
  formatError,
  WeightBalanceError,
  ValidationError
} from '@/utils/errors';

export async function POST(request: Request) {
  try {
    const inputs: WeightBalanceInputs = await request.json();
    
    // Validate inputs
    try {
      const validationErrors = validateWeightBalanceInputs(inputs);
      if (validationErrors.length > 0) {
        throw new ValidationError(
          'Validation failed',
          validationErrors[0].field // Use the first error's field
        );
      }
    } catch (validationError) {
      const error = formatError(validationError);
      return NextResponse.json(
        { 
          error: error.message,
          details: error,
          code: error.code
        },
        { status: 400 }
      );
    }
    
    // Calculate weight and balance
    try {
      const results = calculateWeightAndBalance(inputs);
      return NextResponse.json(results);
    } catch (calcError) {
      const error = formatError(calcError);
      console.error('Weight and balance calculation error:', error);
      return NextResponse.json(
        { 
          error: error.message,
          details: error,
          code: error.code
        },
        { status: 422 }
      );
    }
  } catch (error) {
    const formattedError = formatError(error);
    console.error('Weight and balance API error:', formattedError);
    return NextResponse.json(
      { 
        error: formattedError.message,
        details: formattedError,
        code: formattedError.code
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { calculateWeightAndBalance, WeightBalanceInputs } from '@/utils/weight-balance';

export async function POST(request: Request) {
  try {
    const inputs: WeightBalanceInputs = await request.json();
    
    // Perform validation
    if (!inputs.emptyWeight || !inputs.flightTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate weight and balance
    const results = calculateWeightAndBalance(inputs);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Weight and balance calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate weight and balance' },
      { status: 500 }
    );
  }
}
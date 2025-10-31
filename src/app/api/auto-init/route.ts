import { NextResponse } from 'next/server';
import { autoInitialize } from '@/lib/auto-init';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await autoInitialize();
    return NextResponse.json({ 
      success: true, 
      message: 'GlamBooking initialized successfully' 
    });
  } catch (error: any) {
    console.error('Auto-init error:', error);
    return NextResponse.json(
      { error: error.message || 'Initialization failed' },
      { status: 500 }
    );
  }
}

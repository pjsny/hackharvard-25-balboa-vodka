import { NextRequest, NextResponse } from 'next/server';
import { clearAuthToken } from '../../../../lib/jwt-auth';

export async function POST(request: NextRequest) {
  try {
    await clearAuthToken();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

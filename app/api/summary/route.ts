import { NextRequest, NextResponse } from 'next/server';
import { getSummary, getSessionFromCookies } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = getSummary();
  return NextResponse.json(summary);
}

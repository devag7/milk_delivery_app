import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  const totalLiters = db.prepare('SELECT SUM(quantity) as total FROM customers').get() as { total: number | null };
  const totalRevenue = db.prepare('SELECT SUM(total) as total FROM customers').get() as { total: number | null };

  return NextResponse.json({
    customerCount: customerCount.count,
    totalLiters: totalLiters.total || 0,
    totalRevenue: totalRevenue.total || 0,
  });
}

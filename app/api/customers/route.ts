import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, milk, quantity, price_per_liter } = body;

  if (!name || !milk || quantity === undefined || price_per_liter === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const total = quantity * price_per_liter;
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO customers (name, milk, quantity, price_per_liter, total)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, milk, quantity, price_per_liter, total);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json(customer, { status: 201 });
}

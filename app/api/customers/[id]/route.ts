import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(params.id);

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
  db.prepare(`
    UPDATE customers
    SET name = ?, milk = ?, quantity = ?, price_per_liter = ?, total = ?
    WHERE id = ?
  `).run(name, milk, quantity, price_per_liter, total, params.id);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(params.id);
  return NextResponse.json(customer);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  db.prepare('DELETE FROM customers WHERE id = ?').run(params.id);
  return NextResponse.json({ success: true });
}

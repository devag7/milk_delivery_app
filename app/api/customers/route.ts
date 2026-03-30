import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers, createCustomer, getSessionFromCookies } from '../../../lib/db';

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies(request.headers.get('cookie') || '');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customers = getAllCustomers();
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

  const customer = createCustomer(name, milk, quantity, price_per_liter);
  return NextResponse.json(customer, { status: 201 });
}

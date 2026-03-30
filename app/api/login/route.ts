import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
    id: number;
    username: string;
    password: string;
  } | undefined;

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = await createSession({
    userId: user.id,
    username: user.username,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', `session=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  return response;
}

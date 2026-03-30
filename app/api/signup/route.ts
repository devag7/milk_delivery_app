import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);

  if (existing) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);

  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(result.lastInsertRowid);
  const session = await createSession({
    userId: (user as { id: number }).id,
    username: (user as { username: string }).username,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', `session=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  return response;
}

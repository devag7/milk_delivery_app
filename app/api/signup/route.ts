import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, createUser, createSession, hashPassword } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const existing = getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  const user = createUser(username, hashedPassword);

  const session = await createSession({
    userId: user.id,
    username: user.username,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', `session=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
  return response;
}

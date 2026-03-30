import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('milk-delivery-secret-key-2024');

export interface SessionPayload {
  userId: number;
  username: string;
  [key: string]: number | string;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(cookies: string): Promise<SessionPayload | null> {
  const match = cookies.match(/session=([^;]+)/);
  if (!match) return null;
  return verifySession(decodeURIComponent(match[1]));
}

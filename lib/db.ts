import fs from 'fs';
import path from 'path';
import { SignJWT, jwtVerify } from 'jose';

const DB_FILE = path.join(process.cwd(), 'milk_delivery_data.json');
const SECRET_KEY = new TextEncoder().encode('milk-delivery-secret-key-2024');

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  milk: string;
  quantity: number;
  price_per_liter: number;
  total: number;
  created_at: string;
}

export interface SessionPayload {
  userId: number;
  username: string;
  [key: string]: number | string;
}

interface Database {
  users: User[];
  customers: Customer[];
}

function loadDb(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Fall through to default
  }
  return { users: [], customers: [] };
}

function saveDb(data: Database): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Auth functions
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

// User functions
export function getAllUsers(): User[] {
  return loadDb().users;
}

export function getUserByUsername(username: string): User | undefined {
  const db = loadDb();
  return db.users.find(u => u.username === username);
}

export function createUser(username: string, password: string): User {
  const db = loadDb();
  const newUser: User = {
    id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
    username,
    password,
    created_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

// Customer functions
export function getAllCustomers(): Customer[] {
  return loadDb().customers;
}

export function getCustomerById(id: number): Customer | undefined {
  const db = loadDb();
  return db.customers.find(c => c.id === id);
}

export function createCustomer(name: string, milk: string, quantity: number, price_per_liter: number): Customer {
  const db = loadDb();
  const newCustomer: Customer = {
    id: db.customers.length > 0 ? Math.max(...db.customers.map(c => c.id)) + 1 : 1,
    name,
    milk,
    quantity,
    price_per_liter,
    total: quantity * price_per_liter,
    created_at: new Date().toISOString(),
  };
  db.customers.push(newCustomer);
  saveDb(db);
  return newCustomer;
}

export function updateCustomer(id: number, name: string, milk: string, quantity: number, price_per_liter: number): Customer | undefined {
  const db = loadDb();
  const index = db.customers.findIndex(c => c.id === id);
  if (index === -1) return undefined;

  db.customers[index] = {
    ...db.customers[index],
    name,
    milk,
    quantity,
    price_per_liter,
    total: quantity * price_per_liter,
  };
  saveDb(db);
  return db.customers[index];
}

export function deleteCustomer(id: number): boolean {
  const db = loadDb();
  const index = db.customers.findIndex(c => c.id === id);
  if (index === -1) return false;

  db.customers.splice(index, 1);
  saveDb(db);
  return true;
}

export function getSummary(): { customerCount: number; totalLiters: number; totalRevenue: number } {
  const db = loadDb();
  const customerCount = db.customers.length;
  const totalLiters = db.customers.reduce((sum, c) => sum + c.quantity, 0);
  const totalRevenue = db.customers.reduce((sum, c) => sum + c.total, 0);
  return { customerCount, totalLiters, totalRevenue };
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import StatsCard from '../../components/StatsCard';
import RevenueChart from '../../components/RevenueChart';

interface Customer {
  id: number;
  name: string;
  milk: string;
  quantity: number;
  price_per_liter: number;
  total: number;
}

interface Summary {
  customerCount: number;
  totalLiters: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/summary')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setSummary(data);
          setLoading(false);
        }
      });

    fetch('/api/customers')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCustomers(data);
        }
      });
  }, [router]);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Customers"
            value={summary?.customerCount || 0}
            icon="👥"
          />
          <StatsCard
            title="Total Milk (Liters)"
            value={summary?.totalLiters.toFixed(1) || '0.0'}
            icon="🥛"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${(summary?.totalRevenue || 0).toFixed(2)}`}
            icon="💰"
          />
        </div>

        <div className="mb-8">
          <RevenueChart customers={customers} />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Recent Customers</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Milk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price/Liter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.slice(0, 5).map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4 text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 text-gray-900">{customer.milk}</td>
                  <td className="px-6 py-4 text-gray-900">
                    {customer.quantity} L
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    ₹{customer.price_per_liter.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    ₹{customer.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

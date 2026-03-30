'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import RevenueChart from '@/components/RevenueChart';

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

interface MilkTypeSummary {
  milk_type: string;
  total_quantity: number;
  total_revenue: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [milkTypeSummary, setMilkTypeSummary] = useState<MilkTypeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/summary').then((res) =>
        res.status === 401 ? (router.push('/login'), null) : res.json()
      ),
      fetch('/api/customers').then((res) =>
        res.status === 401 ? (router.push('/login'), null) : res.json()
      ),
    ]).then(([summaryData, customersData]) => {
      if (summaryData) setSummary(summaryData);
      if (customersData) {
        setCustomers(customersData);

        // Calculate milk type summary
        const milkTypes: Record<string, { quantity: number; revenue: number }> =
          {};
        customersData.forEach((c: Customer) => {
          if (!milkTypes[c.milk]) {
            milkTypes[c.milk] = { quantity: 0, revenue: 0 };
          }
          milkTypes[c.milk].quantity += c.quantity;
          milkTypes[c.milk].revenue += c.total;
        });

        setMilkTypeSummary(
          Object.entries(milkTypes).map(([milk_type, data]) => ({
            milk_type,
            total_quantity: data.quantity,
            total_revenue: data.revenue,
          }))
        );
      }
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Reports</h1>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart customers={customers} />

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Summary by Milk Type</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Milk Type</th>
                  <th className="text-left py-2">Total Quantity</th>
                  <th className="text-left py-2">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {milkTypeSummary.map((item) => (
                  <tr key={item.milk_type} className="border-b">
                    <td className="py-3">{item.milk_type}</td>
                    <td className="py-3">{item.total_quantity.toFixed(1)} L</td>
                    <td className="py-3">
                      ₹{item.total_revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Customers Details</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Milk</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price/Liter</th>
                <th className="px-4 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3">{customer.milk}</td>
                  <td className="px-4 py-3">{customer.quantity} L</td>
                  <td className="px-4 py-3">
                    ₹{customer.price_per_liter.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">₹{customer.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

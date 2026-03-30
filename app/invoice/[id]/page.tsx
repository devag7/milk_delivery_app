'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';

interface Customer {
  id: number;
  name: string;
  milk: string;
  quantity: number;
  price_per_liter: number;
  total: number;
  created_at: string;
}

export default function InvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        if (res.status === 404) {
          router.push('/billing');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCustomer(data);
          setLoading(false);
        }
      });
  }, [params.id, router]);

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  }

  function handlePrint() {
    window.print();
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

  if (!customer) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Invoice</h1>
          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 print:hidden"
          >
            Print Invoice
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Milk Delivery App
            </h2>
            <p className="text-gray-600">Invoice</p>
          </div>

          <div className="border-t border-b py-6 mb-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Customer Name:</span>
              <span className="font-semibold">{customer.name}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Milk Type:</span>
              <span className="font-semibold">{customer.milk}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold">{customer.quantity} Liters</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Price per Liter:</span>
              <span className="font-semibold">
                ₹{customer.price_per_liter.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total Amount:</span>
            <span className="text-blue-600">₹{customer.total.toFixed(2)}</span>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
            <p>Thank you for your business!</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

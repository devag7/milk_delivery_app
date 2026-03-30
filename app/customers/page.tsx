'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import CustomerForm from '../../components/CustomerForm';

interface Customer {
  id: number;
  name: string;
  milk: string;
  quantity: number;
  price_per_liter: number;
  total: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const res = await fetch('/api/customers');
    if (res.status === 401) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }

  async function handleAddCustomer(customer: {
    name: string;
    milk: string;
    quantity: number;
    price_per_liter: number;
  }) {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });

    if (res.ok) {
      loadCustomers();
    }
  }

  async function handleUpdateCustomer(customer: {
    name: string;
    milk: string;
    quantity: number;
    price_per_liter: number;
  }) {
    if (!editingCustomer) return;

    const res = await fetch(`/api/customers/${editingCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });

    if (res.ok) {
      loadCustomers();
      setEditingCustomer(null);
    }
  }

  async function handleDeleteCustomer(id: number) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadCustomers();
    }
  }

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Add Customer
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
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
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setShowForm(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}

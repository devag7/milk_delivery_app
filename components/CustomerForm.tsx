'use client';

import { useState, useEffect } from 'react';

interface Customer {
  id?: number;
  name: string;
  milk: string;
  quantity: number;
  price_per_liter: number;
}

interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (customer: Omit<Customer, 'id'>) => Promise<void>;
  onClose: () => void;
}

export default function CustomerForm({ customer, onSubmit, onClose }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [milk, setMilk] = useState('Cow');
  const [quantity, setQuantity] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setMilk(customer.milk);
      setQuantity(customer.quantity.toString());
      setPricePerLiter(customer.price_per_liter.toString());
    }
  }, [customer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await onSubmit({
      name,
      milk,
      quantity: parseFloat(quantity),
      price_per_liter: parseFloat(pricePerLiter),
    });

    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {customer ? 'Edit Customer' : 'Add Customer'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Milk Type</label>
            <select
              value={milk}
              onChange={(e) => setMilk(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cow">Cow</option>
              <option value="Buffalo">Buffalo</option>
              <option value="Goat">Goat</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Quantity (Liters)</label>
            <input
              type="number"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Price per Liter</label>
            <input
              type="number"
              step="0.01"
              value={pricePerLiter}
              onChange={(e) => setPricePerLiter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : customer ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

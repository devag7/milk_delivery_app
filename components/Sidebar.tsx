'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/customers', label: 'Customers' },
    { href: '/billing', label: 'Billing' },
    { href: '/reports', label: 'Reports' },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen text-white">
      <div className="p-4">
        <h1 className="text-xl font-bold">Milk Delivery</h1>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 ${
              pathname === item.href
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

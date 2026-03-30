import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Milk Delivery App',
  description: 'Manage your milk delivery customers and billing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Customer {
  id: number;
  name: string;
  total: number;
}

interface RevenueChartProps {
  customers: Customer[];
}

export default function RevenueChart({ customers }: RevenueChartProps) {
  const data = {
    labels: customers.map((c) => c.name),
    datasets: [
      {
        label: 'Revenue',
        data: customers.map((c) => c.total),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue by Customer',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Bar data={data} options={options} />
    </div>
  );
}

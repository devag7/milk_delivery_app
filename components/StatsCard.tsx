interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}

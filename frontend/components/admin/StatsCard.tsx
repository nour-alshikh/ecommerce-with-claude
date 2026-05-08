interface StatsCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ label, value, sub, trend }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {sub && (
        <p className={`mt-1 text-sm ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
        }`}>
          {sub}
        </p>
      )}
    </div>
  )
}

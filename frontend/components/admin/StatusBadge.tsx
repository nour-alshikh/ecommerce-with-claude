const ORDER_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-gray-100 text-gray-600',
  refunded:   'bg-red-100 text-red-700',
  active:     'bg-green-100 text-green-700',
  inactive:   'bg-red-100 text-red-600',
  draft:      'bg-gray-100 text-gray-600',
  pending_review: 'bg-yellow-100 text-yellow-800',
  approved:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-600',
  banned:     'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = ORDER_COLORS[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  )
}

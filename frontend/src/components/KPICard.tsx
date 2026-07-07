import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  icon?: string
}

export function KPICard({ label, value, delta, deltaPositive, icon }: KPICardProps) {
  return (
    <Card className="border-violet-100">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            {delta && (
              <p className={`text-sm mt-1 font-medium ${deltaPositive ? 'text-green-600' : 'text-red-500'}`}>
                {deltaPositive ? '▲' : '▼'} {delta}
              </p>
            )}
          </div>
          {icon && <span className="text-3xl">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

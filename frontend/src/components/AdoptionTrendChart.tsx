import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
}

export function AdoptionTrendChart({ tasks }: Props) {
  const afterTasks = tasks.filter(t => !t.is_before_ai)

  const weekMap: Record<string, number[]> = {}
  afterTasks.forEach(t => {
    const d = new Date(t.date)
    const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('default', { month: 'short' })}`
    if (!weekMap[week]) weekMap[week] = []
    weekMap[week].push(t.copilot_usage_pct)
  })

  const data = Object.entries(weekMap).map(([week, vals]) => ({
    week,
    avg_copilot: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`${v}%`, 'Avg Copilot Usage']} />
        <Line
          type="monotone"
          dataKey="avg_copilot"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ fill: '#7c3aed' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

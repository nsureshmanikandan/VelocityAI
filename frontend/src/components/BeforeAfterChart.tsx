import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface Props {
  beforeValue: number
  afterValue: number
  label: string
  unit?: string
}

export function BeforeAfterChart({ beforeValue, afterValue, label, unit = '' }: Props) {
  const data = [
    { period: 'Before AI', value: beforeValue },
    { period: 'After AI', value: afterValue },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} unit={unit} />
        <Tooltip formatter={(v) => [`${v}${unit}`, label]} />
        <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

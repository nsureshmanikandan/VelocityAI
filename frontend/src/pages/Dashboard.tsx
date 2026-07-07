import { useEffect, useState } from 'react'
import { getSummaryMetrics } from '../api/metrics'
import { getTasks } from '../api/tasks'
import type { SummaryMetrics, Task } from '../types'
import { KPICard } from '../components/KPICard'
import { BeforeAfterChart } from '../components/BeforeAfterChart'
import { AdoptionTrendChart } from '../components/AdoptionTrendChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function Dashboard() {
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    getSummaryMetrics()
      .then(setMetrics)
      .catch(e => toast.error('Error loading metrics', { description: e.message }))
    getTasks()
      .then(setTasks)
      .catch(e => toast.error('Error loading tasks', { description: e.message }))
  }, [])

  if (!metrics) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>

  const timeDelta = metrics.before_ai.avg_time_hours > 0
    ? `${Math.round((1 - metrics.after_ai.avg_time_hours / metrics.before_ai.avg_time_hours) * 100)}% faster`
    : ''

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Avg Task Time (After AI)"
          value={`${metrics.after_ai.avg_time_hours}h`}
          delta={timeDelta}
          deltaPositive
          icon="⏱️"
        />
        <KPICard
          label="Avg Copilot Usage"
          value={`${metrics.after_ai.avg_copilot_pct}%`}
          delta={`was ${metrics.before_ai.avg_copilot_pct}%`}
          deltaPositive
          icon="🤖"
        />
        <KPICard
          label="Avg Confidence (After)"
          value={`${metrics.after_ai.avg_confidence}/5`}
          delta="improved"
          deltaPositive
          icon="💪"
        />
        <KPICard
          label="Total Tasks Logged"
          value={String(metrics.before_ai.task_count + metrics.after_ai.task_count)}
          icon="📋"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Avg Task Time: Before vs After AI</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart
              beforeValue={metrics.before_ai.avg_time_hours}
              afterValue={metrics.after_ai.avg_time_hours}
              label="Avg Hours"
              unit="h"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Copilot Adoption Trend</CardTitle></CardHeader>
          <CardContent>
            <AdoptionTrendChart tasks={tasks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Avg Confidence: Before vs After AI</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart
              beforeValue={metrics.before_ai.avg_confidence}
              afterValue={metrics.after_ai.avg_confidence}
              label="Confidence"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Copilot Usage %: Before vs After AI</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart
              beforeValue={metrics.before_ai.avg_copilot_pct}
              afterValue={metrics.after_ai.avg_copilot_pct}
              label="Copilot %"
              unit="%"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

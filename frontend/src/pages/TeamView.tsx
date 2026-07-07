import { useEffect, useState } from 'react'
import { getTeamMetrics } from '../api/metrics'
import { getTasks } from '../api/tasks'
import type { TeamMemberMetrics, Task } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BeforeAfterChart } from '../components/BeforeAfterChart'
import { toast } from 'sonner'

export function TeamView() {
  const [team, setTeam] = useState<TeamMemberMetrics[]>([])
  const [selected, setSelected] = useState<TeamMemberMetrics | null>(null)
  const [devTasks, setDevTasks] = useState<Task[]>([])

  useEffect(() => {
    getTeamMetrics()
      .then(setTeam)
      .catch(e => toast.error('Error loading team', { description: e.message }))
  }, [])

  async function handleSelect(member: TeamMemberMetrics) {
    setSelected(member)
    const tasks = await getTasks(member.developer_id)
    setDevTasks(tasks)
  }

  const beforeTasks = devTasks.filter(t => t.is_before_ai)
  const afterTasks = devTasks.filter(t => !t.is_before_ai)
  const beforeAvg = beforeTasks.length
    ? parseFloat((beforeTasks.reduce((s, t) => s + t.time_taken_hours, 0) / beforeTasks.length).toFixed(2))
    : 0
  const afterAvg = afterTasks.length
    ? parseFloat((afterTasks.reduce((s, t) => s + t.time_taken_hours, 0) / afterTasks.length).toFixed(2))
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team View</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Developer Metrics</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-left">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Tasks</th>
                    <th className="pb-2 pr-4">Avg Hours</th>
                    <th className="pb-2 pr-4">Copilot %</th>
                    <th className="pb-2 pr-4">Confidence</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {team.filter(m => m.role === 'developer').map(m => (
                    <tr
                      key={m.developer_id}
                      className={`border-b cursor-pointer hover:bg-violet-50 ${selected?.developer_id === m.developer_id ? 'bg-violet-50' : ''}`}
                      onClick={() => handleSelect(m)}
                    >
                      <td className="py-2 pr-4 font-medium">{m.name}</td>
                      <td className="py-2 pr-4">{m.tasks_logged}</td>
                      <td className="py-2 pr-4">{m.avg_time_hours}h</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                            <div
                              className="bg-violet-600 h-2 rounded-full"
                              style={{ width: `${m.avg_copilot_pct}%` }}
                            />
                          </div>
                          <span>{m.avg_copilot_pct}%</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4">{m.avg_confidence}/5</td>
                      <td className="py-2">
                        <Badge variant="outline" className="text-xs text-violet-600">View →</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{selected.name} — Drill-in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <BeforeAfterChart
                beforeValue={beforeAvg}
                afterValue={afterAvg}
                label="Avg Hours"
                unit="h"
              />
              <div className="text-xs text-gray-500 space-y-1">
                <p>Total tasks: <strong>{devTasks.length}</strong></p>
                <p>Before AI: <strong>{beforeTasks.length}</strong></p>
                <p>After AI: <strong>{afterTasks.length}</strong></p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

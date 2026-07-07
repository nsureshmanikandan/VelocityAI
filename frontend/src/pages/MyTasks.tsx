import { useEffect, useState, useCallback } from 'react'
import { getTasks, deleteTask } from '../api/tasks'
import { useUserStore } from '../store/userStore'
import type { Task } from '../types'
import { TaskForm } from '../components/TaskForm'
import { BeforeAfterChart } from '../components/BeforeAfterChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function MyTasks() {
  const currentUser = useUserStore(s => s.currentUser)
  const [tasks, setTasks] = useState<Task[]>([])

  const load = useCallback(() => {
    if (currentUser) getTasks(currentUser.id).then(setTasks)
  }, [currentUser])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: number) {
    try {
      await deleteTask(id)
      load()
      toast.success('Task deleted')
    } catch (e: any) {
      toast.error('Error', { description: e.message })
    }
  }

  const beforeTasks = tasks.filter(t => t.is_before_ai)
  const afterTasks = tasks.filter(t => !t.is_before_ai)
  const avgBefore = beforeTasks.length
    ? parseFloat((beforeTasks.reduce((s, t) => s + t.time_taken_hours, 0) / beforeTasks.length).toFixed(2))
    : 0
  const avgAfter = afterTasks.length
    ? parseFloat((afterTasks.reduce((s, t) => s + t.time_taken_hours, 0) / afterTasks.length).toFixed(2))
    : 0

  const statusVariant = (s: string): 'default' | 'secondary' | 'destructive' =>
    s === 'completed' ? 'default' : s === 'in_progress' ? 'secondary' : 'destructive'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Log a New Task</CardTitle></CardHeader>
            <CardContent>
              {currentUser && <TaskForm developerId={currentUser.id} onCreated={load} />}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">My Before vs After</CardTitle></CardHeader>
          <CardContent>
            <BeforeAfterChart beforeValue={avgBefore} afterValue={avgAfter} label="Avg Hours" unit="h" />
            <p className="text-xs text-gray-400 text-center mt-2">
              {beforeTasks.length} before / {afterTasks.length} after tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Task History ({tasks.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2 pr-4">Task</th>
                  <th className="pb-2 pr-4">Category</th>
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Hours</th>
                  <th className="pb-2 pr-4">Copilot %</th>
                  <th className="pb-2 pr-4">Confidence</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Period</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium max-w-xs truncate">{t.name}</td>
                    <td className="py-2 pr-4 capitalize">{t.category}</td>
                    <td className="py-2 pr-4">{t.date}</td>
                    <td className="py-2 pr-4">{t.time_taken_hours}h</td>
                    <td className="py-2 pr-4">{t.copilot_usage_pct}%</td>
                    <td className="py-2 pr-4">{t.confidence_score}/5</td>
                    <td className="py-2 pr-4">
                      <Badge variant={statusVariant(t.completion_status)} className="capitalize text-xs">
                        {t.completion_status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={t.is_before_ai ? 'outline' : 'default'} className="text-xs">
                        {t.is_before_ai ? 'Before AI' : 'After AI'}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(t.id)}
                        className="text-red-400 hover:text-red-600 h-6 px-2"
                      >✕</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && (
              <p className="text-center text-gray-400 py-8">
                No tasks logged yet. Use the form above to add your first task.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

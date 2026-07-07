import { useState } from 'react'
import { toast } from 'sonner'
import { createTask } from '../api/tasks'
import type { TaskCreate } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

interface Props {
  developerId: number
  onCreated: () => void
}

export function TaskForm({ developerId, onCreated }: Props) {
  const [form, setForm] = useState<Omit<TaskCreate, 'developer_id'>>({
    name: '',
    category: 'coding',
    date: new Date().toISOString().split('T')[0],
    time_taken_hours: 1,
    copilot_usage_pct: 0,
    confidence_score: 3,
    completion_status: 'completed',
    is_before_ai: false,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createTask({ ...form, developer_id: developerId })
      toast.success('Task logged!', { description: form.name })
      setForm(f => ({ ...f, name: '', notes: '' }))
      onCreated()
    } catch (err: any) {
      toast.error('Error', { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Task Name</Label>
        <Input
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Build React data table component"
        />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['coding', 'debugging', 'styling', 'architecture'].map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Date</Label>
        <Input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />
      </div>
      <div>
        <Label>Time Taken (hours)</Label>
        <Input
          type="number"
          min={0.1}
          step={0.5}
          value={form.time_taken_hours}
          onChange={e => setForm(f => ({ ...f, time_taken_hours: parseFloat(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Copilot Usage %</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={form.copilot_usage_pct}
          onChange={e => setForm(f => ({ ...f, copilot_usage_pct: parseInt(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Confidence Score (1–5)</Label>
        <Input
          type="number"
          min={1}
          max={5}
          value={form.confidence_score}
          onChange={e => setForm(f => ({ ...f, confidence_score: parseInt(e.target.value) }))}
        />
      </div>
      <div>
        <Label>Status</Label>
        <Select value={form.completion_status} onValueChange={v => setForm(f => ({ ...f, completion_status: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['completed', 'in_progress', 'blocked'].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Period</Label>
        <Select
          value={form.is_before_ai ? 'before' : 'after'}
          onValueChange={v => setForm(f => ({ ...f, is_before_ai: v === 'before' }))}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="before">Before AI (PowerApps era)</SelectItem>
            <SelectItem value="after">After AI (Copilot assisted)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="col-span-2">
        <Button type="submit" disabled={submitting} className="bg-violet-600 hover:bg-violet-700 w-full">
          {submitting ? 'Saving...' : 'Log Task'}
        </Button>
      </div>
    </form>
  )
}

export interface Developer {
  id: number
  name: string
  role: 'developer' | 'manager'
  team: string
  created_at: string
}

export interface Task {
  id: number
  developer_id: number
  name: string
  category: 'coding' | 'debugging' | 'styling' | 'architecture'
  date: string
  time_taken_hours: number
  copilot_usage_pct: number
  confidence_score: number
  completion_status: 'completed' | 'in_progress' | 'blocked'
  is_before_ai: boolean
  notes: string | null
  created_at: string
}

export interface TaskCreate {
  developer_id: number
  name: string
  category: string
  date: string
  time_taken_hours: number
  copilot_usage_pct: number
  confidence_score: number
  completion_status: string
  is_before_ai: boolean
  notes?: string
}

export interface PeriodMetrics {
  avg_time_hours: number
  avg_copilot_pct: number
  avg_confidence: number
  task_count: number
}

export interface SummaryMetrics {
  before_ai: PeriodMetrics
  after_ai: PeriodMetrics
}

export interface TeamMemberMetrics {
  developer_id: number
  name: string
  team: string
  role: string
  tasks_logged: number
  avg_time_hours: number
  avg_copilot_pct: number
  avg_confidence: number
}

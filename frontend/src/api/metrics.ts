import client from './client'
import type { SummaryMetrics, TeamMemberMetrics } from '../types'

export const getSummaryMetrics = () =>
  client.get<SummaryMetrics>('/api/metrics/summary').then(r => r.data)

export const getTeamMetrics = () =>
  client.get<TeamMemberMetrics[]>('/api/metrics/team').then(r => r.data)

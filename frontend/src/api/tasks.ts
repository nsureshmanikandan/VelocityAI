import client from './client'
import type { Task, TaskCreate } from '../types'

export const getTasks = (developerId?: number) =>
  client.get<Task[]>('/api/tasks', {
    params: developerId ? { developer_id: developerId } : {}
  }).then(r => r.data)

export const createTask = (payload: TaskCreate) =>
  client.post<Task>('/api/tasks', payload).then(r => r.data)

export const updateTask = (id: number, payload: Partial<TaskCreate>) =>
  client.put<Task>(`/api/tasks/${id}`, payload).then(r => r.data)

export const deleteTask = (id: number) =>
  client.delete(`/api/tasks/${id}`)

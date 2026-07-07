import client from './client'
import type { Developer } from '../types'

export const getDevelopers = () =>
  client.get<Developer[]>('/api/developers').then(r => r.data)

export const getDeveloper = (id: number) =>
  client.get<Developer>(`/api/developers/${id}`).then(r => r.data)

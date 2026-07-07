import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Developer } from '../types'

interface UserStore {
  currentUser: Developer | null
  setCurrentUser: (user: Developer) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null }),
    }),
    { name: 'velocityai-user' }
  )
)

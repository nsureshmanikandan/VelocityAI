import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useUserStore } from './store/userStore'
import { UserPicker } from './components/UserPicker'
import { Dashboard } from './pages/Dashboard'
import { MyTasks } from './pages/MyTasks'
import { TeamView } from './pages/TeamView'
import { Insights } from './pages/Insights'
import { Toaster } from '@/components/ui/sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function App() {
  const { currentUser, clearUser } = useUserStore()
  const [showPicker, setShowPicker] = useState(false)

  const isManager = currentUser?.role === 'manager'

  if (!currentUser || showPicker) {
    return <UserPicker onSelect={() => setShowPicker(false)} />
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-violet-100 text-violet-700'
        : 'text-gray-600 hover:text-violet-700 hover:bg-violet-50'
    }`

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-violet-700">⚡ VelocityAI</span>
            <div className="flex gap-1">
              {isManager && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
              <NavLink to="/my-tasks" className={linkClass}>My Tasks</NavLink>
              {isManager && <NavLink to="/team" className={linkClass}>Team View</NavLink>}
              <NavLink to="/insights" className={linkClass}>AI Insights</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{currentUser.name}</span>
            <Badge variant={isManager ? 'default' : 'secondary'} className="capitalize">
              {currentUser.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { clearUser(); setShowPicker(true) }}
            >
              Switch User
            </Button>
          </div>
        </nav>
        <main className="p-6 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to={isManager ? '/dashboard' : '/my-tasks'} replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/team" element={<TeamView />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

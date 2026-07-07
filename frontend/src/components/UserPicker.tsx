import { useEffect, useState } from 'react'
import { getDevelopers } from '../api/developers'
import { useUserStore } from '../store/userStore'
import type { Developer } from '../types'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

export function UserPicker({ onSelect }: { onSelect: () => void }) {
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [selected, setSelected] = useState<string>('')
  const setCurrentUser = useUserStore(s => s.setCurrentUser)

  useEffect(() => {
    getDevelopers().then(setDevelopers).catch(() => {})
  }, [])

  function handleConfirm() {
    const dev = developers.find(d => d.id === parseInt(selected))
    if (dev) {
      setCurrentUser(dev)
      onSelect()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-96 shadow-2xl">
        <h1 className="text-2xl font-bold text-violet-700 mb-2">⚡ VelocityAI</h1>
        <p className="text-gray-500 text-sm mb-6">Select your profile to continue</p>
        <Select onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a developer..." />
          </SelectTrigger>
          <SelectContent>
            {developers.map(d => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name} ({d.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="w-full mt-4 bg-violet-600 hover:bg-violet-700"
          onClick={handleConfirm}
          disabled={!selected}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { streamInsights } from '../api/insights'
import { InsightsPanel } from '../components/InsightsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Insights() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setContent('')
    setError(null)
    setIsStreaming(true)
    try {
      for await (const token of streamInsights()) {
        setContent(prev => prev + token)
      }
    } catch (e: any) {
      setError(e.message)
      toast.error('Failed to generate insights', { description: e.message })
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500 mt-1">
            Powered by Azure OpenAI GPT-4 — analyzes your team's productivity data
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isStreaming}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isStreaming ? '⏳ Generating...' : '✨ Generate Insights'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            🤖 GPT-4 Analysis
            {isStreaming && (
              <span className="text-xs text-violet-500 font-normal animate-pulse">● Live</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">Could not generate insights</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <p className="text-xs text-red-400 mt-2">
                    Update <code className="bg-red-100 px-1 rounded">backend/.env</code> with valid Azure OpenAI credentials and restart the backend.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <InsightsPanel content={content} isStreaming={isStreaming} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

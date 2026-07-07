import { useState } from 'react'
import { streamInsights } from '../api/insights'
import { InsightsPanel } from '../components/InsightsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Insights() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleGenerate() {
    setContent('')
    setIsStreaming(true)
    try {
      for await (const token of streamInsights()) {
        setContent(prev => prev + token)
      }
    } catch (e: any) {
      toast.error('Error generating insights', { description: e.message })
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
          <InsightsPanel content={content} isStreaming={isStreaming} />
        </CardContent>
      </Card>
    </div>
  )
}

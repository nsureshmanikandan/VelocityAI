interface Props {
  content: string
  isStreaming: boolean
}

export function InsightsPanel({ content, isStreaming }: Props) {
  return (
    <div className="bg-gray-50 border border-violet-100 rounded-xl p-6 min-h-48 font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {content || (
        <span className="text-gray-400">
          Click "Generate Insights" to get GPT-4 analysis of your team's productivity data...
        </span>
      )}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-violet-600 ml-1 animate-pulse" />
      )}
    </div>
  )
}

export async function* streamInsights(): AsyncGenerator<string> {
  const response = await fetch('/api/insights/generate', {
    method: 'POST',
    headers: { 'Accept': 'text/event-stream' },
  })

  if (!response.ok) {
    throw new Error(`Server error: HTTP ${response.status}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    const lines = text.split('\n').filter(l => l.startsWith('data: '))
    for (const line of lines) {
      const data = line.replace('data: ', '').trim()
      if (data === '[DONE]') return
      try {
        const parsed = JSON.parse(data)
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.token) yield parsed.token
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }
}

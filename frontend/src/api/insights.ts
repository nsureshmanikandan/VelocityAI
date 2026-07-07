export async function* streamInsights(): AsyncGenerator<string> {
  const response = await fetch('/api/insights/generate', {
    method: 'POST',
    headers: { 'Accept': 'text/event-stream' },
  })

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
        if (parsed.token) yield parsed.token
      } catch {}
    }
  }
}

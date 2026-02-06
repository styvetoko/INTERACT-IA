/**
 * Utility functions for handling streaming responses from the API
 */

export async function* streamChatResponse(generator: AsyncGenerator<string, void, unknown>) {
  let buffer = ""

  for await (const chunk of generator) {
    buffer += chunk

    // Try to parse complete JSON objects from the buffer
    const lines = buffer.split("\n")

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim()
      if (line) {
        try {
          const parsed = JSON.parse(line)
          yield parsed
        } catch {
          // Continue if JSON parsing fails
        }
      }
    }

    // Keep the incomplete last line in the buffer
    buffer = lines[lines.length - 1]
  }

  // Process any remaining buffer
  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer)
      yield parsed
    } catch {
      // Ignore final parse errors
    }
  }
}

export function createSSEStream(response: Response): AsyncGenerator<string, void, unknown> {
  return {
    async *[Symbol.asyncIterator]() {
      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let buffer = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i]
            if (line.startsWith("data: ")) {
              yield line.slice(6)
            }
          }

          buffer = lines[lines.length - 1]
        }
      } finally {
        reader.releaseLock()
      }
    },
  }
}

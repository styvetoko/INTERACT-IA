"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import type { ChatMessage } from "@/lib/api-client"

export function useChatAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (conversationId: string, content: string): Promise<ChatMessage | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.chat.sendMessage(conversationId, content)

      if (!response.success) {
        setError(response.error || "Failed to send message")
        return null
      }

      return response.data as ChatMessage
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setError(errorMsg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const streamMessage = useCallback(async function* (conversationId: string, content: string) {
    setLoading(true)
    setError(null)

    try {
      for await (const chunk of apiClient.chat.streamMessage(conversationId, content)) {
        yield chunk
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Streaming failed"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    sendMessage,
    streamMessage,
    loading,
    error,
  }
}

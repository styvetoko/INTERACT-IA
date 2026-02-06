"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useChat } from "@/contexts/chat-context"
import type { Message as MsgType } from "@/lib/types"

interface ChatMessagesProps {
  conversationId?: string
}

export function ChatMessages({ conversationId }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { state, actions } = useChat()
  const messages = actions.getConversation(conversationId)
  const loading = state.loading

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                IA
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to INTERACT AI</h2>
            <p className="text-muted-foreground max-w-md">
              Start a conversation. Ask anything, explore ideas, or get assistance with your projects.
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message: MsgType) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
            >
              <Card
                className={`max-w-md lg:max-w-xl px-4 py-3 ${message.role === "user"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border shadow-sm"
                  }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">IN</div>
                    <div className="text-sm font-medium">INTERACT</div>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "opacity-80" : "text-muted-foreground"}`}>
                  {(() => {
                    try {
                      const d = typeof message.timestamp === "string" ? new Date(message.timestamp) : (message.timestamp as Date)
                      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    } catch (e) {
                      return ""
                    }
                  })()}
                </p>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
              <Card className="bg-card border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">INTERACT AI is thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}

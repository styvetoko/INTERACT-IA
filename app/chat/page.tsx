"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { AgentIntroCard } from "@/components/agent/agent-intro-card"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Menu, X } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function ChatContent() {
  const { user } = useAuth()
  const { state, actions } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messages = actions.getConversation(state.activeConversationId)
  const loading = state.loading
  const showIntro = messages.length === 0

  const handleNewConversation = () => {
    actions.createConversation()
  }

  const handleRenameConversation = (id: string, newName: string) => {
    if (actions.updateConversation) actions.updateConversation(id, { title: newName })
  }

  return (
    <main className="h-screen flex bg-background">
      {/* Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewConversation}
        onRenameChat={handleRenameConversation}
        currentConversationId={state.activeConversationId || ""}
        onSelectConversation={(id) => actions.setActiveConversation(id)}
        userName={user?.name}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex-1 text-center">
            <h1 className="font-semibold">INTERACT AI</h1>
          </div>
          <div className="w-10" />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
          {showIntro && messages.length === 0 && <AgentIntroCard />}
          <ChatMessages conversationId={state.activeConversationId} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card/30">
          <ChatInput />
        </div>
      </div>
    </main>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  )
}

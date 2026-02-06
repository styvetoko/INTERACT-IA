"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit2, Trash2, Settings, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

interface ChatSidebarProps {
  open: boolean
  onClose: () => void
  onNewChat: () => void
  onRenameChat: (id: string, name: string) => void
  currentConversationId: string
  onSelectConversation: (id: string) => void
  userName?: string
}

export function ChatSidebar({
  open,
  onClose,
  onNewChat,
  onRenameChat,
  currentConversationId,
  onSelectConversation,
  userName,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState([
    { id: "conversation-1", name: "Getting Started with INTERACT AI" },
    { id: "conversation-2", name: "African Tech Innovation" },
    { id: "conversation-3", name: "AI Ethics Discussion" },
  ])

  const [renaming, setRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const { logout } = useAuth()
  const { t } = useLanguage()

  const handleRename = (id: string) => {
    if (newName.trim()) {
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)))
      onRenameChat(id, newName)
    }
    setRenaming(null)
  }

  const handleDelete = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static w-64 h-screen bg-card border-r border-border flex flex-col transform transition-transform lg:translate-x-0 z-40 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <Button onClick={onNewChat} className="w-full bg-primary hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            {t("chat.newConversation")}
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group p-3 rounded-lg cursor-pointer transition ${
                  currentConversationId === conv.id
                    ? "bg-primary/20 border border-primary/30"
                    : "hover:bg-muted border border-transparent"
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                {renaming === conv.id ? (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(conv.id)
                        if (e.key === "Escape") setRenaming(null)
                      }}
                      className="h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium truncate text-foreground">{conv.name}</p>
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenaming(conv.id)
                          setNewName(conv.name)
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(conv.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t border-border p-4 space-y-2">
          {userName && (
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border mb-2">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            </div>
          )}
          <Link href="/profile">
            <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
              <Settings className="w-4 h-4" />
              <span className="text-sm">{t("nav.settings")}</span>
            </Button>
          </Link>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start gap-2 bg-transparent text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">{t("nav.signOut")}</span>
          </Button>
        </div>
      </aside>
    </>
  )
}

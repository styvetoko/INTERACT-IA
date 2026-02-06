"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, Paperclip, ImageIcon } from "lucide-react"
import { FileUploadModal } from "./file-upload-modal"
import { ImageGenerationModal } from "./image-generation-modal"
import { VoiceInputModal } from "./voice-input-modal"
import { useChat } from "@/contexts/chat-context"

export function ChatInput() {
  const { state, actions } = useChat()
  const [input, setInput] = useState("")
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showImageGen, setShowImageGen] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const conversationId = state.activeConversationId
    if (!input.trim()) return
    let convId = conversationId
    if (!convId) {
      // create a local conversation if none exists so the message can be sent
      try {
        const conv = actions.createConversation?.()
        convId = conv?.id
      } catch (e) {
        console.error("Failed to create conversation", e)
      }
    }
    if (!convId) return
    // Add user message and let ChatContext orchestrate assistant reply
    try {
      const msg = {
        id: `user-${Date.now()}`,
        conversationId: convId,
        role: "user",
        content: input.trim(),
        timestamp: new Date().toISOString(),
        language: state.conversations?.[convId]?.language || "fr",
      }
      await actions.appendMessage(convId, msg)
    } catch (err) {
      console.error("appendMessage failed", err)
    }
    setInput("")
    setAttachedFiles([])
  }

  const handleFilesSelected = (files: File[]) => {
    setAttachedFiles((prev) => [...prev, ...files])
    setShowFileUpload(false)
  }

  const handleVoiceInput = (transcript: string) => {
    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
    setShowVoiceInput(false)
  }

  const handleImageGenerated = (prompt: string, imageData: string) => {
    const conversationId = state.activeConversationId
    let convId = conversationId
    if (!convId) {
      try {
        const conv = actions.createConversation?.()
        convId = conv?.id
      } catch (e) {
        console.error("Failed to create conversation for image", e)
        return
      }
    }
    if (!convId) return
    const msg = {
      id: `user-${Date.now()}`,
      conversationId: convId,
      role: "user",
      content: `Please generate an image: ${prompt}`,
      timestamp: new Date().toISOString(),
      language: state.conversations?.[convId]?.language || "fr",
    }
    actions.appendMessage(convId, msg)
    setShowImageGen(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm"
              >
                <Paperclip className="w-3 h-3" />
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Row */}
        <div className="flex gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={state.loading}
              onClick={() => setShowFileUpload(true)}
              className="h-10 w-10 bg-transparent hover:bg-muted"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={state.loading}
              onClick={() => setShowVoiceInput(true)}
              className="h-10 w-10 bg-transparent hover:bg-muted"
              title="Voice input (Jarvis-style)"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={state.loading}
              onClick={() => setShowImageGen(true)}
              className="h-10 w-10 bg-transparent hover:bg-muted"
              title="Generate image"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>

          <Input
            placeholder="Ask INTERACT AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-input border-border flex-1"
          />

          <Button type="submit" disabled={!input.trim() || state.loading} className="bg-primary hover:bg-primary/90 h-10 px-6">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Modals */}
      <FileUploadModal
        open={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFilesSelected={handleFilesSelected}
      />
      <ImageGenerationModal
        open={showImageGen}
        onClose={() => setShowImageGen(false)}
        onGenerateImage={handleImageGenerated}
      />
      <VoiceInputModal open={showVoiceInput} onClose={() => setShowVoiceInput(false)} onTranscript={handleVoiceInput} />
    </>
  )
}

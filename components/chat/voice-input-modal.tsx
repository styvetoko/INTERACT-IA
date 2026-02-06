"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mic, StopCircle, Volume2 } from "lucide-react"

interface VoiceInputModalProps {
  open: boolean
  onClose: () => void
  onTranscript: (text: string) => void
}

export function VoiceInputModal({ open, onClose, onTranscript }: VoiceInputModalProps) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [micAvailable, setMicAvailable] = useState<boolean>(false)

  // detect support for getUserMedia and MediaRecorder
  useState(() => {
    try {
      // navigator may be undefined in some test environments; guard
      const hasGetUserMedia = typeof navigator !== "undefined" && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      const hasMediaRecorder = typeof window !== "undefined" && typeof (window as any).MediaRecorder !== "undefined"
      setMicAvailable(Boolean(hasGetUserMedia && hasMediaRecorder))
    } catch (e) {
      setMicAvailable(false)
    }
  })

  const handleStartRecording = async () => {
    try {
      if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setTranscript("Microphone not available in this browser or context.")
        return
      }
      if (typeof (window as any).MediaRecorder === "undefined") {
        setTranscript("MediaRecorder is not supported in this browser.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.onstart = () => setRecording(true)
      mediaRecorder.onstop = () => setRecording(false)

      mediaRecorder.start()
    } catch (error) {
      console.error("Microphone access denied:", error)
      setTranscript("Microphone access denied. Please enable microphone permissions.")
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      // TODO: Send audio to speech-to-text API
      setTranscript("Voice input received. Connect to a speech-to-text API for transcription.")
    }
  }

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      onTranscript(transcript)
      setTranscript("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Input (Jarvis-Style)</DialogTitle>
          <DialogDescription>Speak to interact with INTERACT AI</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recording Indicator */}
          {recording && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Mic className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Listening...</p>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-foreground">{transcript}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!recording ? (
              <Button onClick={handleStartRecording} className="bg-primary hover:bg-primary/90 gap-2">
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={handleStopRecording} className="bg-destructive hover:bg-destructive/90 gap-2">
                <StopCircle className="w-4 h-4" />
                Stop
              </Button>
            )}
          </div>

          {transcript && (
            <Button onClick={handleSendTranscript} className="w-full bg-primary hover:bg-primary/90">
              Use This Input
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

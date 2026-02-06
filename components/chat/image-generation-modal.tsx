"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, Download } from "lucide-react"

interface ImageGenerationModalProps {
  open: boolean
  onClose: () => void
  onGenerateImage: (prompt: string, imageData: string) => void
}

export function ImageGenerationModal({ open, onClose, onGenerateImage }: ImageGenerationModalProps) {
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setGenerating(true)
    // Simulate image generation
    setTimeout(() => {
      setGeneratedImage(`/placeholder.svg?height=400&width=400&query=${encodeURIComponent(prompt)}`)
      setGenerating(false)
    }, 2000)
  }

  const handleSendImage = () => {
    if (generatedImage) {
      onGenerateImage(prompt, generatedImage)
      setPrompt("")
      setGeneratedImage(null)
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a")
      link.href = generatedImage
      link.download = `generated-${Date.now()}.png`
      link.click()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>Image Generation</DialogTitle>
          <DialogDescription>Create images using AI. Powered by INTERACT AI</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Image Description</Label>
            <Input
              id="prompt"
              placeholder="Describe the image you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
              className="bg-input border-border"
            />
          </div>

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-2">
              <img
                src={generatedImage || "/placeholder.svg"}
                alt="Generated"
                className="w-full rounded-lg border border-border aspect-square object-cover"
              />
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" className="flex-1 gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {!generatedImage ? (
              <Button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                {generating ? "Generating..." : "Generate Image"}
              </Button>
            ) : (
              <Button onClick={handleSendImage} className="bg-primary hover:bg-primary/90">
                Use This Image
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

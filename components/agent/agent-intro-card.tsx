"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export function AgentIntroCard() {
  return (
    <Card className="border-border bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
      <CardContent className="pt-6">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              INTERACT AI
              <span className="text-xs px-2 py-1 rounded-full bg-secondary/30 text-secondary">Jarvis for Africa</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Hello! I'm INTERACT AI, your intelligent assistant built for Africa. I'm here to help you with any
              question, task, or creative project. Powered by cutting-edge AI technology, I'm designed to be accessible,
              ethical, and empowering. What can I help you with today?
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, MessageCircle, Zap } from "lucide-react"

export default function LandingPage() {
  const [email, setEmail] = useState("")

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">IA</span>
          </div>
          <span className="font-bold text-lg">INTERACT AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
          <Zap className="w-4 h-4 text-secondary" />
          <span className="text-sm text-secondary">Jarvis for Africa's Future</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          The AI Assistant Built for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Africa</span>
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          INTERACT AI is a next-generation artificial intelligence platform designed with African needs at its core.
          Powerful, ethical, and accessible to millions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
              Start Free <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 w-full mt-16">
          {[
            { icon: MessageCircle, title: "Natural Conversation", desc: "Chat naturally with advanced AI" },
            { icon: Zap, title: "Lightning Fast", desc: "Real-time streaming responses" },
            { icon: MessageCircle, title: "Multimodal", desc: "Text, voice, files, and images" },
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition">
              <item.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2025 INTERACT AI. Engineered for Africa, built for the world.</p>
      </footer>
    </main>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Zap, Shield, Globe } from "lucide-react"

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  details: string[]
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to INTERACT AI",
      description: "Jarvis for Africa's Future",
      icon: <Zap className="w-12 h-12 text-secondary" />,
      details: [
        "A next-generation AI assistant built specifically for Africa",
        "Designed with African users and their needs at its core",
        "Powerful enough for complex tasks, simple enough for everyone",
      ],
    },
    {
      title: "Our Mission",
      description: "Empowering Africa through Intelligent Technology",
      icon: <Globe className="w-12 h-12 text-primary" />,
      details: [
        "Democratize access to advanced AI technology",
        "Support African innovation and entrepreneurship",
        "Enable solutions to local and continental challenges",
        "Bridge the technology gap across Africa",
      ],
    },
    {
      title: "Ethical AI Principles",
      description: "Trust, Transparency, and Responsibility",
      icon: <Shield className="w-12 h-12 text-secondary" />,
      details: [
        "Your data is secure and private - we respect your privacy",
        "Transparent about how AI makes decisions",
        "Responsible AI that avoids bias and discrimination",
        "Built to benefit individuals and communities",
      ],
    },
    {
      title: "Key Features",
      description: "Everything You Need to Thrive",
      icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
      details: [
        "Chat with natural language - no technical knowledge needed",
        "Voice input for hands-free interaction (Jarvis-style)",
        "Upload files and images for analysis and processing",
        "Generate images from descriptions",
      ],
    },
  ]

  const step = steps[currentStep]

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-12">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition ${
                i === currentStep ? "bg-primary" : i < currentStep ? "bg-secondary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <Card className="border-border p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8">{step.icon}</div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{step.title}</h1>
          <p className="text-lg text-secondary mb-8">{step.description}</p>

          {/* Details */}
          <div className="space-y-3 mb-12 text-left">
            {step.details.map((detail, i) => (
              <div key={i} className="flex gap-4 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 justify-between">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < steps.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-primary hover:bg-primary/90 gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Link href="/chat">
                <Button className="bg-primary hover:bg-primary/90 gap-2">
                  Start Chatting <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {/* Step Counter */}
          <p className="text-sm text-muted-foreground mt-6">
            Step {currentStep + 1} of {steps.length}
          </p>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Link href="/chat">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Skip Onboarding
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

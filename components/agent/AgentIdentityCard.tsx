"use client"

import React from "react"
import { useAgent } from "@/contexts/agent-context"

export default function AgentIdentityCard() {
    const { state } = useAgent()
    const { profile } = state

    return (
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">IN</div>
                <div>
                    <div className="text-sm text-muted-foreground">{profile.role}</div>
                    <div className="text-lg font-semibold">{profile.name}</div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mt-3">{profile.description}</p>

            <div className="mt-3">
                <div className="text-xs text-muted-foreground">Personality</div>
                <div className="text-sm">{profile.personality?.style ?? 'Calm, helpful, professional'}</div>
            </div>

            <div className="mt-3">
                <div className="text-xs text-muted-foreground">Languages</div>
                <div className="text-sm flex flex-wrap gap-2 mt-1">
                    {(profile.supportedLanguages || []).slice(0, 8).map((l) => (
                        <span key={l} className="px-2 py-1 bg-muted rounded-full text-xs">{l}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

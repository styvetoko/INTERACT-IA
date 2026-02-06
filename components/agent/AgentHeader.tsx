"use client"

import React from "react"
import { useAgent } from "@/contexts/agent-context"
import { useChat } from "@/contexts/chat-context"

export default function AgentHeader() {
    const { state: agentState, actions: agentActions } = useAgent()
    const { state: chatState } = useChat()

    const agent = agentState.profile
    const status = chatState.loading ? "Thinking" : "Idle"

    return (
        <header className="w-full bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">IN</div>
                    <div>
                        <div className="text-sm text-muted-foreground">Agent</div>
                        <div className="text-lg font-semibold">{agent.name} — <span className="font-normal text-sm">{agent.role}</span></div>
                        <div className="text-xs text-muted-foreground mt-1">{agent.mission?.slice(0, 80)}{agent.mission && agent.mission.length > 80 ? '…' : ''}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'Thinking' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {status}
                    </div>
                    <button
                        className="px-3 py-1 rounded-md bg-primary text-white text-sm"
                        onClick={() => agentActions.updateAgent({ settings: { ...(agent.settings || {}), proactive: !agent.settings?.proactive } })}
                    >
                        {agent.settings?.proactive ? 'Proactive ON' : 'Proactive OFF'}
                    </button>
                </div>
            </div>
        </header>
    )
}

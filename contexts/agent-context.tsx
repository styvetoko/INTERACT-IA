"use client"

import React, { createContext, useContext, useReducer, useCallback } from "react"
import type { AgentProfile, MemoryStore, EpisodicMemoryEntry, SemanticMemoryEntry } from "@/lib/types"

type AgentState = {
    profile: AgentProfile
    memory: MemoryStore
}

type AgentAction =
    | { type: "UPDATE_PROFILE"; payload: Partial<AgentProfile> }
    | { type: "RESET_PROFILE" }
    | { type: "ADD_EPISODIC"; payload: EpisodicMemoryEntry }
    | { type: "ADD_SEMANTIC"; payload: SemanticMemoryEntry }

const defaultProfile: AgentProfile = {
    id: "interact-core",
    name: "INTERACT",
    role: "Digital assistant: eyes, hands and mind",
    mission:
        "Devenir l'intelligence artificielle générale africaine de référence, porter le développement technologique de l'Afrique et valoriser les cultures et langues africaines.",
    description:
        "INTERACT observe, comprend, décide et agit pour exécuter des tâches, résoudre des problèmes et amplifier les capacités humaines.",
    persona: {
        voice: "calm_confident",
    },
    identity: { origin: "Africa", culture: "Pan-African", region: "Global" },
    personality: {
        style: "amical, professionnel, pédagogique",
        tone: "calm_confident",
        humour: "light",
        formality: "adaptive",
        values: ["service", "respect", "inclusion", "sustainability"],
    },
    supportedLanguages: [
        "fr",
        "en",
        "douala",
        "bassa",
        "bamiléke",
        "beti",
        "bulu",
        "feefe",
        "lingala",
        "hausa",
        "sw",
        "yoruba",
        "fulfulde",
        "zulu",
    ],
    settings: { proactive: false, privacyLevel: "standard", telemetry: false },
}

const initialState: AgentState = { profile: defaultProfile, memory: {} }

function reducer(state: AgentState, action: AgentAction): AgentState {
    switch (action.type) {
        case "UPDATE_PROFILE":
            return { ...state, profile: { ...state.profile, ...action.payload } }
        case "RESET_PROFILE":
            return { ...state, profile: defaultProfile }
        case "ADD_EPISODIC":
            return { ...state, memory: { ...state.memory, episodic: [...(state.memory.episodic || []), action.payload] } }
        case "ADD_SEMANTIC":
            return { ...state, memory: { ...state.memory, semantic: [...(state.memory.semantic || []), action.payload] } }
        default:
            return state
    }
}

type AgentActions = {
    updateAgent: (patch: Partial<AgentProfile>) => void
    resetAgent: () => void
    addEpisodicMemory: (entry: EpisodicMemoryEntry) => void
    addSemanticMemory: (entry: SemanticMemoryEntry) => void
}

const AgentContext = createContext<{ state: AgentState; actions: AgentActions } | undefined>(undefined)

export function AgentProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    const updateAgent = useCallback((patch: Partial<AgentProfile>) => dispatch({ type: "UPDATE_PROFILE", payload: patch }), [])
    const resetAgent = useCallback(() => dispatch({ type: "RESET_PROFILE" }), [])

    const addEpisodicMemory = useCallback((entry: EpisodicMemoryEntry) => dispatch({ type: "ADD_EPISODIC", payload: entry }), [])
    const addSemanticMemory = useCallback((entry: SemanticMemoryEntry) => dispatch({ type: "ADD_SEMANTIC", payload: entry }), [])

    const actions: AgentActions = { updateAgent, resetAgent, addEpisodicMemory, addSemanticMemory }

    return <AgentContext.Provider value={{ state, actions }}>{children}</AgentContext.Provider>
}

export function useAgent() {
    const ctx = useContext(AgentContext)
    if (!ctx) throw new Error("useAgent must be used within AgentProvider")
    return ctx
}

export default AgentProvider

"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import type { Conversation, Message, AgentProfile } from "@/lib/types"
import chatService from "@/services/chatService"
import { useAgent } from "@/contexts/agent-context"
import { useLanguage } from "@/contexts/language-context"

// Local storage key for persistence
const STORAGE_KEY = "interact_conversations"

// Simple event bus used to notify other subsystems (memory, analytics, tooling)
type EventHandler = (payload?: any) => void
const eventHandlers: Record<string, EventHandler[]> = {}
export const eventBus = {
    on: (evt: string, fn: EventHandler) => {
        eventHandlers[evt] = eventHandlers[evt] || []
        eventHandlers[evt].push(fn)
        return () => {
            eventHandlers[evt] = (eventHandlers[evt] || []).filter((f) => f !== fn)
        }
    },
    emit: (evt: string, payload?: any) => {
        ; (eventHandlers[evt] || []).forEach((fn) => {
            try {
                fn(payload)
            } catch (e) {
                console.error("eventBus handler error", e)
            }
        })
    },
}

type ConversationsMap = Record<string, Conversation>

type ChatState = {
    conversations: ConversationsMap
    activeConversationId?: string
    loading: boolean
    error?: string | null
}

type Action =
    | { type: "SET_ALL"; payload: ConversationsMap }
    | { type: "ADD"; payload: Conversation }
    | { type: "UPDATE"; payload: { id: string; patch: Partial<Conversation> } }
    | { type: "REMOVE"; payload: { id: string } }
    | { type: "APPEND"; payload: { conversationId: string; message: Message } }
    | { type: "REPLACE"; payload: { conversationId: string; messageId: string; message: Message } }
    | { type: "DELETE_MESSAGE"; payload: { conversationId: string; messageId: string } }
    | { type: "SET_ACTIVE"; payload: { id?: string } }
    | { type: "SET_LOADING"; payload: { loading: boolean } }
    | { type: "SET_ERROR"; payload: { error?: string | null } }

const initialState: ChatState = {
    conversations: {},
    activeConversationId: undefined,
    loading: false,
    error: null,
}

function reducer(state: ChatState, action: Action): ChatState {
    switch (action.type) {
        case "SET_ALL":
            return { ...state, conversations: action.payload }
        case "ADD":
            return { ...state, conversations: { [action.payload.id]: action.payload, ...state.conversations } }
        case "UPDATE":
            return { ...state, conversations: { ...state.conversations, [action.payload.id]: { ...(state.conversations[action.payload.id] || {}), ...action.payload.patch } } }
        case "REMOVE": {
            const clone = { ...state.conversations }
            delete clone[action.payload.id]
            return { ...state, conversations: clone }
        }
        case "APPEND": {
            const c = state.conversations[action.payload.conversationId]
            const msgs = c?.messages ? [...c.messages, action.payload.message] : [action.payload.message]
            return { ...state, conversations: { ...state.conversations, [action.payload.conversationId]: { ...(c || { id: action.payload.conversationId }), messages: msgs, updatedAt: action.payload.message.timestamp } } }
        }
        case "REPLACE": {
            const c = state.conversations[action.payload.conversationId]
            const msgs = (c?.messages || []).map((m) => (m.id === action.payload.messageId ? action.payload.message : m))
            return { ...state, conversations: { ...state.conversations, [action.payload.conversationId]: { ...(c || { id: action.payload.conversationId }), messages: msgs, updatedAt: action.payload.message.timestamp } } }
        }
        case "DELETE_MESSAGE": {
            const c = state.conversations[action.payload.conversationId]
            const msgs = (c?.messages || []).filter((m) => m.id !== action.payload.messageId)
            return { ...state, conversations: { ...state.conversations, [action.payload.conversationId]: { ...(c || { id: action.payload.conversationId }), messages: msgs } } }
        }
        case "SET_ACTIVE":
            return { ...state, activeConversationId: action.payload.id }
        case "SET_LOADING":
            return { ...state, loading: action.payload.loading }
        case "SET_ERROR":
            return { ...state, error: action.payload.error }
        default:
            return state
    }
}

// Public actions available to consumers
type ChatActions = {
    getConversation: (conversationId?: string) => Message[]
    createConversation: (conversationId?: string, title?: string, language?: string) => Conversation
    appendMessage: (conversationId: string, message: Message) => Promise<Message>
    updateMessage: (conversationId: string, messageId: string, patch: Partial<Message>) => void
    updateConversation?: (id: string, patch: Partial<Conversation>) => void
    deleteMessage: (conversationId: string, messageId: string) => void
    clearConversation: (conversationId: string) => void
    setConversationLanguage: (conversationId: string, language: string) => void
    setActiveConversation: (id?: string) => void
    // persistence/backfill hooks
    persistToBackend?: (conversationId: string) => Promise<void>
}

const ChatContext = createContext<{ state: ChatState; actions: ChatActions } | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const { state: agentState, actions: agentActions } = useAgent()
    const { language: appLanguage } = useLanguage()

    // Load from localStorage on init
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (raw) {
                const parsed: ConversationsMap = JSON.parse(raw)
                dispatch({ type: "SET_ALL", payload: parsed })
                const firstId = Object.keys(parsed)[0]
                if (firstId) dispatch({ type: "SET_ACTIVE", payload: { id: firstId } })
                return
            }
        } catch (e) {
            console.warn("Failed to read conversations from localStorage", e)
        }

        // No local storage — try fetching summaries from backend (best-effort)
        ; (async () => {
            dispatch({ type: "SET_LOADING", payload: { loading: true } })
            try {
                const summaries = await chatService.getConversations()
                // create empty conversation objects keyed by id
                const mapped: ConversationsMap = {}
                summaries.forEach((s: any) => {
                    mapped[s.id] = { id: s.id, title: s.title || "Conversation", createdAt: s.lastMessageAt, updatedAt: s.lastMessageAt, messages: [], language: appLanguage }
                })
                if (Object.keys(mapped).length === 0) {
                    const localId = `local-${Date.now()}`
                    mapped[localId] = { id: localId, title: "Nouvelle conversation", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [], language: appLanguage }
                }
                dispatch({ type: "SET_ALL", payload: mapped })
                const firstId = Object.keys(mapped)[0]
                if (firstId) dispatch({ type: "SET_ACTIVE", payload: { id: firstId } })
            } catch (e) {
                const localId = `local-${Date.now()}`
                const mapped: ConversationsMap = {}
                mapped[localId] = { id: localId, title: "Nouvelle conversation", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [], language: appLanguage }
                dispatch({ type: "SET_ALL", payload: mapped })
                dispatch({ type: "SET_ACTIVE", payload: { id: localId } })
            } finally {
                dispatch({ type: "SET_LOADING", payload: { loading: false } })
            }
        })()
    }, [appLanguage])

    // Persist to localStorage whenever conversations change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations))
        } catch (e) {
            console.warn("Failed to persist conversations", e)
        }
    }, [state.conversations])

    // Helper: get messages for a conversation in chronological order
    const getConversation = useCallback(
        (conversationId?: string) => {
            const id = conversationId || state.activeConversationId
            if (!id) return [] as Message[]
            const convo = state.conversations[id]
            return (convo?.messages || []).slice()
        },
        [state.conversations, state.activeConversationId],
    )

    const createConversation = useCallback(
        (conversationId?: string, title?: string, language?: string) => {
            const id = conversationId || `local-${Date.now()}`
            const lang = language || appLanguage || "fr"
            const conv: Conversation = { id, title: title || "Nouvelle conversation", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [], language: lang }
            dispatch({ type: "ADD", payload: conv })
            dispatch({ type: "SET_ACTIVE", payload: { id } })
            return conv
        },
        [appLanguage],
    )

    const appendMessage = useCallback(
        async (conversationId: string, message: Message) => {
            // ensure conversation exists
            if (!state.conversations[conversationId]) {
                dispatch({ type: "ADD", payload: { id: conversationId, title: "Conversation", messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), language: message.language || appLanguage } })
            }

            // append message locally
            dispatch({ type: "APPEND", payload: { conversationId, message } })

            // notify other subsystems (saving memories, analytics, streaming)
            try {
                eventBus.emit("memory:newMessage", message)
            } catch (e) {
                console.warn("eventBus emit failed", e)
            }

            // If the message is from a user, generate assistant reply (simulated) via reasoning engine
            if (message.role === "user") {
                dispatch({ type: "SET_LOADING", payload: { loading: true } })
                try {
                    // collect current conversation history
                    const convo = state.conversations[conversationId]
                    const history = [...(convo?.messages || []), message]
                    const convLang = convo?.language || message.language || appLanguage || "fr"

                    // reasoningEngine: gather episodic/semantic memories and call chatService
                    const reasoningEngine = async () => {
                        const episodic = (agentState.memory?.episodic || []).filter((e: any) => !e.conversationId || e.conversationId === conversationId)
                        const semantic = agentState.memory?.semantic || []

                        // small relevance heuristic: keep last 5 episodic entries
                        const recentEpisodic = episodic.slice(-5)

                        // Generate assistant response with memory context
                        const assistant = await chatService.generateReasonedResponse(agentState.profile as AgentProfile, conversationId, history, convLang, { episodic: recentEpisodic, semantic })
                        return assistant
                    }

                    const assistant = await reasoningEngine()

                    // append assistant reply
                    dispatch({ type: "APPEND", payload: { conversationId, message: assistant } })

                    // record episodic memory: store the exchange for future context
                    try {
                        agentActions.addEpisodicMemory({ id: `mem-${Date.now()}`, conversationId, timestamp: new Date().toISOString(), type: "event", text: JSON.stringify({ user: message, assistant }) })
                    } catch (e) {
                        console.warn("failed to add episodic memory", e)
                    }

                    eventBus.emit("memory:newMessage", assistant)
                    return assistant
                } catch (e) {
                    console.error("Simulated response failed", e)
                    throw e
                } finally {
                    dispatch({ type: "SET_LOADING", payload: { loading: false } })
                }
            }

            return message
        },
        [agentActions, agentState.profile, appLanguage, state.conversations],
    )

    const updateMessage = useCallback((conversationId: string, messageId: string, patch: Partial<Message>) => {
        const convo = state.conversations[conversationId]
        if (!convo) return
        const msgs = (convo.messages || []).map((m) => (m.id === messageId ? { ...m, ...patch } : m))
        dispatch({ type: "UPDATE", payload: { id: conversationId, patch: { messages: msgs } } })
    }, [state.conversations])

    const deleteMessage = useCallback((conversationId: string, messageId: string) => {
        dispatch({ type: "DELETE_MESSAGE", payload: { conversationId, messageId } })
        eventBus.emit("memory:deleteMessage", { conversationId, messageId })
    }, [])

    const clearConversation = useCallback((conversationId: string) => {
        dispatch({ type: "UPDATE", payload: { id: conversationId, patch: { messages: [] } } })
        eventBus.emit("memory:clearConversation", { conversationId })
    }, [])

    const setConversationLanguage = useCallback((conversationId: string, language: string) => {
        dispatch({ type: "UPDATE", payload: { id: conversationId, patch: { language } } })
        eventBus.emit("memory:languageChanged", { conversationId, language })
    }, [])

    const setActiveConversation = useCallback((id?: string) => dispatch({ type: "SET_ACTIVE", payload: { id } }), [])

    const updateConversation = useCallback((id: string, patch: Partial<Conversation>) => {
        dispatch({ type: "UPDATE", payload: { id, patch } })
        if (patch.title) {
            // best-effort persistence to backend (non-blocking)
            chatService.updateConversationTitle(id, patch.title).catch((e) => console.warn("persist title failed", e))
        }
    }, [])

    const actions: ChatActions = {
        getConversation,
        createConversation,
        appendMessage,
        updateMessage,
        updateConversation,
        deleteMessage,
        clearConversation,
        setConversationLanguage,
        setActiveConversation,
    }

    return <ChatContext.Provider value={{ state, actions }}>{children}</ChatContext.Provider>
}

export function useChat() {
    const ctx = useContext(ChatContext)
    if (!ctx) throw new Error("useChat must be used within ChatProvider")
    return ctx
}

export default ChatProvider

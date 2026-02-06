// Common types for INTERACT AI frontend
// Keep minimal and compatible with `lib/api-client.ts` structures.

export type MessageRole = "user" | "assistant" | "system" | "tool"

export interface MessageMetadata {
    model?: string
    temperature?: number
    tool?: string
    [key: string]: any
}

export interface Attachment {
    id?: string
    type: "image" | "audio" | "file" | "other"
    url?: string
    name?: string
    size?: number
    mime?: string
}

export interface Message {
    id: string
    conversationId?: string
    role: MessageRole
    content: string
    timestamp?: string
    language?: string
    attachments?: Attachment[]
    metadata?: MessageMetadata
}

export interface Conversation {
    id: string
    title?: string
    createdAt?: string
    updatedAt?: string
    messages?: Message[]
    language?: string
}

export interface AgentProfile {
    id: string
    name: string
    role?: string
    mission?: string
    description?: string
    persona?: Record<string, any>
    identity?: {
        origin?: string
        culture?: string
        region?: string
    }
    personality?: {
        style?: string
        tone?: string
        humour?: string
        formality?: "adaptive" | "formal" | "informal"
        values?: string[]
    }
    supportedLanguages?: string[]
    settings?: {
        proactive?: boolean
        privacyLevel?: "strict" | "standard" | "relaxed"
        telemetry?: boolean
        [key: string]: any
    }
}

export interface ConversationSummary {
    id: string
    title: string
    lastMessageAt?: string
    messageCount?: number
}

// Memory interfaces (placeholders for future implementation)
export interface EpisodicMemoryEntry {
    id: string
    conversationId?: string
    timestamp: string
    type: "event" | "action" | "observation"
    text?: string
    metadata?: Record<string, any>
}

export interface SemanticMemoryEntry {
    id: string
    vectorId?: string
    createdAt?: string
    text: string
    embedding?: number[]
    metadata?: Record<string, any>
}

export interface IdentityMemory {
    userId: string
    profile?: Record<string, any>
    preferences?: Record<string, any>
}

export interface MemoryStore {
    episodic?: EpisodicMemoryEntry[]
    semantic?: SemanticMemoryEntry[]
    identity?: IdentityMemory[]
}

export interface MemoryEntry {
    id: string
    type: "episodic" | "semantic"
    content: any
    timestamp: string
    conversationId?: string
}

export default {} as const

import { apiClient } from "@/lib/api-client"
import type { Message, Conversation, ConversationSummary, Attachment, AgentProfile } from "@/lib/types"

/**
 * chatService - typed wrapper around `apiClient.chat` and related endpoints.
 * Keeps a stable contract for the rest of the frontend and centralizes
 * mapping between backend DTOs and frontend `Message`/`Conversation` types.
 */

function mapChatMessage(dto: any): Message {
    return {
        id: dto.id,
        conversationId: dto.conversationId,
        role: (dto.role as any) || "assistant",
        content: dto.content || dto.text || "",
        timestamp: dto.timestamp || new Date().toISOString(),
        attachments: Array.isArray(dto.attachments) ? dto.attachments.map((a: any) => ({ id: a })) : undefined,
        metadata: dto.metadata,
    }
}

function mapConversation(dto: any): Conversation {
    return {
        id: dto.id,
        title: dto.title,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        messages: Array.isArray(dto.messages) ? dto.messages.map(mapChatMessage) : undefined,
    }
}

export const chatService = {
    async sendMessage(conversationId: string, content: string): Promise<Message> {
        const res = await apiClient.chat.sendMessage(conversationId, content)
        if (!res.success || !res.data) throw new Error(res.error || "sendMessage failed")
        return mapChatMessage(res.data)
    },

    /**
     * Generate a simulated assistant response using agent profile and language.
     * This is a local, deterministic fallback used when no real model is available.
     */
    // Multi-turn reasoning-driven response generator.
    // Returns a context-aware, persona-respecting Message with metadata (intent, topic, sentiment).
    async generateReasonedResponse(
        agentProfile: AgentProfile | any,
        conversationId: string | undefined,
        messages: Message[],
        language: string,
        memory?: { episodic?: any[]; semantic?: any[] },
    ): Promise<Message> {
        // Build a more natural, varied and context-aware reply generation
        // - Detect last user message and simple intents
        // - Choose from multiple templates per language to avoid repetition
        // - Respect agentProfile.personality for tone
        // - Return a typed Message object

        const now = new Date().toISOString()

        // Normalize language key (fallback to French for many African languages)
        const normalizeLang = (l?: string) => {
            if (!l) return "fr"
            const lower = l.toLowerCase()
            if (lower.startsWith("en")) return "en"
            if (lower.startsWith("fr")) return "fr"
            // Common African language codes or names - default to 'fr' for now
            const afr = ["douala", "bassa", "bamiléke", "beti", "bulu", "feefe", "lingala", "hausa", "swahili", "yoruba", "fulfulde", "zulu"]
            for (const a of afr) if (lower.includes(a)) return "fr"
            return "fr"
        }

        const langKey = normalizeLang(language)

        // Extract last user message
        const lastUser = [...messages].reverse().find((m) => m.role === "user")
        const userText = (lastUser?.content || "").trim()

        // Heuristics for intent
        const intent = (() => {
            if (!userText) return "unknown"
            const u = userText.toLowerCase()
            if (/^(bonjour|salut|hello|hi|hey)\b/.test(u)) return "greeting"
            if (/merci|thank(s)?/.test(u)) return "thanks"
            if (/comment tu vas|\bça va\b|how are you|how's it going/.test(u)) return "personal"
            if (/merci de|gracias|thanks for/.test(u)) return "gratitude"
            if (/\bbug|error|crash|stack trace|code|débog|débug|implément|implement|npm|yarn|pnpm|compile\b/.test(u)) return "technical"
            if (/\b(je veux|i want|please create|créer|create|project)\b/.test(u)) return "task"
            if (/\?$/m.test(u)) return "question"
            return "statement"
        })()

        // Personality settings
        const personality = (agentProfile && agentProfile.personality) || { style: "adaptive", tone: "warm" }
        const tone = (personality.tone as string) || "warm"

        // Templates per language and intent (kept concise and varied)
        const templates: Record<string, Record<string, string[]>> = {
            fr: {
                greeting: [
                    `Bonjour ! Je suis ${agentProfile?.name ?? "INTERACT"}, ravi de vous parler. 😊`,
                    `Salut ! ${agentProfile?.name ?? "INTERACT"} à l'appareil — comment puis-je aider ?`,
                    `Bonjour — prêt à vous assister. Que souhaitez-vous faire aujourd'hui ?`,
                ],
                personal: [
                    `Je vais bien, merci ! Et vous ?`,
                    `Tout va bien ici — merci de demander. Comment ça va de votre côté ?`,
                ],
                thanks: [
                    `Avec plaisir — heureux d'avoir pu aider !`,
                    `Merci à vous — si vous avez d'autres questions, je suis là.`,
                ],
                technical: [
                    `D'accord, parlons technique : pouvez-vous préciser l'environnement (OS, version, commandes utilisées) ?`,
                    `Je peux vous aider sur ce point technique — partagez le message d'erreur ou le bout de code.`,
                ],
                task: [
                    `Super, on peut commencer par définir les objectifs et le format du projet. Vous voulez un starter kit ou un guide étape par étape ?`,
                    `Parfait — dites-moi quel langage et quelle structure vous préférez, je vous propose un plan.`,
                ],
                question: [
                    `Bonne question — voici ce que je propose :`,
                    `Je peux vous expliquer ça clairement — voulez-vous une réponse courte ou détaillée ?`,
                ],
                statement: [
                    `Merci pour l'info — j'ai noté cela. Voulez-vous que je propose la suite ?`,
                    `Compris — souhaitez-vous que je transforme cela en plan d'action ?`,
                ],
            },
            en: {
                greeting: [
                    `Hello! I'm ${agentProfile?.name ?? "INTERACT"}, glad to help. 👋`,
                    `Hi there — ${agentProfile?.name ?? "INTERACT"} here. What can I do for you?`,
                    `Hey! Ready when you are. How can I assist?`,
                ],
                personal: [
                    `I'm doing well, thanks — how about you?`,
                    `All good here — appreciate you asking. How are you doing?`,
                ],
                thanks: [
                    `You're welcome — happy to help!`,
                    `No problem — let me know if you need anything else.`,
                ],
                technical: [
                    `Got it. Could you share the error message and environment details?`,
                    `I can help debug — paste the code snippet or logs and I'll take a look.`,
                ],
                task: [
                    `Great — what tech stack do you want to use? I can scaffold a plan.`,
                    `Let's break it down: what's the goal, deadline, and stack?`,
                ],
                question: [
                    `Good question — here's a quick suggestion:`,
                    `I can explain — do you prefer a short summary or a detailed walkthrough?`,
                ],
                statement: [
                    `Thanks for sharing — shall I propose next steps?`,
                    `Understood. Would you like me to take action or provide guidance?`,
                ],
            },
        }

        const langTemplates = templates[langKey] || templates.fr

        // Choose a template group based on intent
        const group = (() => {
            if (intent === "greeting") return "greeting"
            if (intent === "personal") return "personal"
            if (intent === "thanks" || intent === "gratitude") return "thanks"
            if (intent === "technical") return "technical"
            if (intent === "task") return "task"
            if (intent === "question") return "question"
            return "statement"
        })()

        // Pick a variation, using some randomness to avoid repetitiveness
        const variations = langTemplates[group] || langTemplates.statement
        const pick = variations[Math.floor(Math.random() * variations.length)]

        // Compose final content: vary phrasing, add empathetic microcopy
        const micro = (() => {
            if (tone === "warm") return langKey === "fr" ? "Je suis là pour vous aider." : "I'm here to help."
            if (tone === "formal") return langKey === "fr" ? "Je vous écoute." : "I'm listening."
            return ""
        })()

        // Avoid echoing user text directly as a standalone sentence; instead weave when helpful
        let content = pick
        if (intent === "question" && userText && !/\bplease\b|\bsvp\b/.test(userText.toLowerCase())) {
            // offer clarifying option
            content = `${pick} ${langKey === "fr" ? "Pouvez-vous préciser ?" : "Could you clarify?"}`
        }

        if (micro) content = `${content} ${micro}`

        // Add an optional emoji in casual tone
        if (tone === "warm" && Math.random() > 0.6) {
            content = `${content} ${langKey === "fr" ? "🙂" : "🙂"}`
        }

        // Incorporate episodic memory hints (very lightweight): if memory contains last user goals, mention them
        try {
            const epi = memory?.episodic || []
            if (epi.length > 0) {
                const recent = epi.slice(-3).map((e: any) => e.text).join("; ")
                if (recent) {
                    // weave a short reminder when relevant
                    if (langKey === "fr") {
                        // append a short contextual reminder occasionally
                        if (Math.random() > 0.6) content = `${content} Petite mise à jour : je garde en mémoire — ${recent}.`
                    } else {
                        if (Math.random() > 0.6) content = `${content} Quick note: I remember — ${recent}.`
                    }
                }
            }
        } catch (e) {
            // non-fatal
            console.warn("memory integration failed", e)
        }

        // Classify basic sentiment (naive)
        const sentiment = (() => {
            const u = userText.toLowerCase()
            if (/\b(merci|bien|super|génial|great|good|awesome)\b/.test(u)) return "positive"
            if (/\b(triste|pas bien|mauvais|bad|terrible|hate)\b/.test(u)) return "negative"
            return "neutral"
        })()

        const topic = (() => {
            // crude topic extraction by keyword groups
            const u = userText.toLowerCase()
            if (/\b(api|endpoint|http|fetch|request|response)\b/.test(u)) return "api"
            if (/\b(code|js|javascript|ts|typescript|react|next)\b/.test(u)) return "development"
            if (/\b(projet|project|starter|template)\b/.test(u)) return "project"
            if (/\b(image|photo|generate image)\b/.test(u)) return "image"
            return "general"
        })()

        const message: Message = {
            id: `assistant-${Date.now()}`,
            conversationId,
            role: "assistant",
            content,
            timestamp: now,
            metadata: { generatedBy: "reasoning-sim", language: langKey, model: "sim-reasoner-v1", intent, topic, sentiment },
        }

        // Simulate typing/latency to make interactions feel natural
        await new Promise((r) => setTimeout(r, 300 + Math.floor(Math.random() * 900)))

        return message
    },

    // Backwards-compatible alias
    async generateSimulatedResponse(
        agentProfile: AgentProfile | any,
        conversationId: string | undefined,
        messages: Message[],
        language: string,
        memory?: { episodic?: any[]; semantic?: any[] },
    ): Promise<Message> {
        return await (this as any).generateReasonedResponse(agentProfile, conversationId, messages, language, memory)
    },

    async *streamMessage(conversationId: string, content: string): AsyncGenerator<string, void, unknown> {
        // Delegate to apiClient.chat.streamMessage which yields raw chunks
        for await (const chunk of apiClient.chat.streamMessage(conversationId, content)) {
            yield chunk
        }
    },

    async getConversation(conversationId: string): Promise<Conversation> {
        const res = await apiClient.chat.getConversation(conversationId)
        if (!res.success || !res.data) throw new Error(res.error || "getConversation failed")
        return mapConversation(res.data)
    },

    async getConversations(): Promise<ConversationSummary[]> {
        const res = await apiClient.chat.getConversations()
        if (!res.success || !res.data) throw new Error(res.error || "getConversations failed")
        return (res.data as any[]).map((c) => ({ id: c.id, title: c.title, lastMessageAt: c.updatedAt, messageCount: Array.isArray(c.messages) ? c.messages.length : undefined }))
    },

    async updateConversationTitle(conversationId: string, title: string): Promise<Conversation> {
        const res = await apiClient.chat.updateConversationTitle(conversationId, title)
        if (!res.success || !res.data) throw new Error(res.error || "updateConversationTitle failed")
        return mapConversation(res.data)
    },

    async deleteConversation(conversationId: string): Promise<void> {
        const res = await apiClient.chat.deleteConversation(conversationId)
        if (!res.success) throw new Error(res.error || "deleteConversation failed")
    },

    async uploadFile(file: File, conversationId: string): Promise<Attachment> {
        const res = await apiClient.files.upload(file, conversationId)
        if (!res.success || !res.data) throw new Error(res.error || "upload failed")
        // Expect backend to return file id and url
        return { id: res.data.id, url: res.data.url, name: res.data.name, size: res.data.size, mime: res.data.mime }
    },

    async generateImage(prompt: string): Promise<string> {
        const res = await apiClient.images.generate(prompt)
        if (!res.success || !res.data) throw new Error(res.error || "image generation failed")
        return res.data.imageUrl
    },

    async transcribeVoice(blob: Blob): Promise<string> {
        const res = await apiClient.voice.transcribe(blob)
        if (!res.success || !res.data) throw new Error(res.error || "transcription failed")
        return res.data.text
    },
}

export default chatService

// Script de test: simule l'envoi d'un message et affiche la réponse générée par la logique de simulation

function generateSimulatedResponse(agentProfile, language, userMessage, conversationId) {
    const now = new Date().toISOString()

    const templates = {
        fr: {
            greeting: 'Bonjour 👋',
            intro: `Je suis ${agentProfile?.name ?? 'INTERACT'}, ton partenaire technologique.`,
            ask: "Comment puis-je t'aider aujourd'hui ?",
        },
        en: {
            greeting: 'Hello 👋',
            intro: `I'm ${agentProfile?.name ?? 'INTERACT'}, your technology partner.`,
            ask: 'How can I help you today?',
        },
    }

    const lang = (language || 'fr').startsWith('en') ? 'en' : 'fr'
    const tpl = templates[lang] || templates.fr

    const isFirst = true // pour la simulation, considérer première interaction

    const contentParts = []
    contentParts.push(tpl.greeting)
    if (isFirst) contentParts.push(tpl.intro)
    contentParts.push(`${lang === 'fr' ? "J'ai bien compris votre message" : 'I understood your message'} : \"${userMessage}\".`)
    contentParts.push(tpl.ask)

    const content = contentParts.join('\n')

    const message = {
        id: `assistant-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content,
        timestamp: now,
        metadata: { generatedBy: 'simulator', language: lang },
    }

    return message
}

// Profil d'agent (copié depuis contexts/agent-context.tsx defaultProfile)
const agentProfile = {
    id: 'interact-core',
    name: 'INTERACT',
    role: "Digital assistant: eyes, hands and mind",
    mission:
        "Devenir l'intelligence artificielle générale africaine de référence, porter le développement technologique de l'Afrique et valoriser les cultures et langues africaines.",
    description:
        "INTERACT observe, comprend, décide et agit pour exécuter des tâches, résoudre des problèmes et amplifier les capacités humaines.",
    persona: { voice: 'calm_confident' },
    identity: { origin: 'Africa', culture: 'Pan-African', region: 'Global' },
    personality: {
        style: 'amical, professionnel, pédagogique',
        tone: 'calm_confident',
        humour: 'light',
        formality: 'adaptive',
        values: ['service', 'respect', 'inclusion', 'sustainability'],
    },
    supportedLanguages: ['fr', 'en', 'douala', 'bassa'],
    settings: { proactive: false, privacyLevel: 'standard', telemetry: false },
}

// Simulation: message en français
const language = 'fr'
const userMessage = 'bonjour'
const conversationId = 'conv-test-1'

const reply = generateSimulatedResponse(agentProfile, language, userMessage, conversationId)

console.log('=== Simulated assistant reply ===')
console.log(reply.content)
console.log('\n=== Metadata ===')
console.log(reply.metadata)

import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { LanguageProvider } from "@/contexts/language-context"
import AgentProvider from "@/contexts/agent-context"
import ChatProvider from "@/contexts/chat-context"
import AgentHeader from "@/components/agent/AgentHeader"

// Removed Vercel/Turbopack `next/font/google` usage to avoid
// dependency on Vercel internals. We rely on a system font stack
// defined in `app/globals.css` instead for stability locally.

export const metadata: Metadata = {
  title: "INTERACT AI - Jarvis for Africa",
  description: "The next-generation AI assistant platform for Africa. Intelligent, accessible, and powerful.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <AgentProvider>
              <ChatProvider>
                <AgentHeader />
                {children}
              </ChatProvider>
            </AgentProvider>
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

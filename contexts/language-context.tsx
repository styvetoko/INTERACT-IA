"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Language } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("interact_language") as Language | null
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr")) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      const detectedLang: Language = browserLang.startsWith("fr") ? "fr" : "en"
      setLanguageState(detectedLang)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("interact_language", lang)
  }

  const t = (path: string): string => {
    const { getTranslation } = require("@/lib/translations")
    return getTranslation(language, path)
  }

  // Always render the provider so `useLanguage` consumers have a context
  // during static prerender/build. The actual language value will update
  // on the client once `localStorage` is read in the effect above.
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (undefined === context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}

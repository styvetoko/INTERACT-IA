"use client"

export const dynamic = "force-dynamic"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const { t, language, setLanguage } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
    } catch {
      setError(t("auth.loginFailed") || "Invalid email or password")
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("en")}
            className={language === "en" ? "bg-primary hover:bg-primary/90" : "bg-transparent"}
          >
            English
          </Button>
          <Button
            variant={language === "fr" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("fr")}
            className={language === "fr" ? "bg-primary hover:bg-primary/90" : "bg-transparent"}
          >
            Français
          </Button>
        </div>

        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          {t("nav.backToChat")}
        </Link>

        <Card className="border-border">
          <CardHeader>
            <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <span className="text-sm font-bold text-primary-foreground">IA</span>
            </div>
            <CardTitle>{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.haveAccount")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              {error && <div className="text-sm text-destructive">{error}</div>}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? t("chat.loading") : t("auth.login")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link href="/signup" className="text-primary hover:underline">
                {t("auth.signUpHere")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

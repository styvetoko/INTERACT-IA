"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, LogOut, User, Settings, Shield, Bell } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage()

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+234 801 234 5678",
    country: "Nigeria",
    language: language,
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    productUpdates: true,
    securityAlerts: true,
  })

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    if (field === "language") {
      setLanguage(value as "en" | "fr")
    }
  }

  const handleNotificationChange = (field: string) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field as keyof typeof notifications] }))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <Link href="/chat" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("nav.backToChat")}
        </Link>
        <h1 className="text-3xl font-bold">{t("profile.accountSettings")}</h1>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t("profile.personalInfo")}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{t("profile.notifications")}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t("profile.security")}</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t("profile.preferences")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{t("profile.personalInfo")}</CardTitle>
                <CardDescription>{t("profile.updateProfile")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("profile.fullName")}</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.emailAddress")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("profile.phoneNumber")}</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">{t("profile.country")}</Label>
                    <Input
                      id="country"
                      value={profile.country}
                      onChange={(e) => handleProfileChange("country", e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("profile.language")}</Label>
                    <select
                      id="language"
                      value={profile.language}
                      onChange={(e) => handleProfileChange("language", e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 mt-4">{t("profile.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{t("profile.notifications")}</CardTitle>
                <CardDescription>{t("profile.manageNotifications")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: "emailNotifications",
                    titleKey: "profile.emailNotifications",
                    descKey: "profile.emailNotificationsDesc",
                  },
                  {
                    key: "productUpdates",
                    titleKey: "profile.productUpdates",
                    descKey: "profile.productUpdatesDesc",
                  },
                  {
                    key: "securityAlerts",
                    titleKey: "profile.securityAlerts",
                    descKey: "profile.securityAlertsDesc",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{t(item.titleKey)}</p>
                      <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() => handleNotificationChange(item.key)}
                      className="w-5 h-5 rounded border-border bg-input cursor-pointer accent-primary"
                    />
                  </div>
                ))}
                <Button className="bg-primary hover:bg-primary/90">{t("profile.savePreferences")}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{t("profile.security")}</CardTitle>
                <CardDescription>{t("profile.updatePassword")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">{t("profile.currentPassword")}</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">{t("profile.newPassword")}</Label>
                  <Input
                    id="new"
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, new: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">{t("profile.confirmPasswordField")}</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
                    className="bg-input border-border"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90">{t("profile.updatePasswordBtn")}</Button>
              </CardContent>
            </Card>

            <Card className="border-border border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">{t("profile.activeSessions")}</CardTitle>
                <CardDescription>{t("profile.manageActiveSessions")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <p className="font-medium mb-1">{t("profile.currentSession")}</p>
                  <p className="text-sm text-muted-foreground mb-3">Chrome on Windows • Last active: Just now</p>
                  <Button variant="outline" className="bg-transparent">
                    {t("profile.signOutDevice")}
                  </Button>
                </div>
                <Button variant="destructive" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("profile.signOutAll")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>{t("profile.preferences")}</CardTitle>
                <CardDescription>{t("profile.customizeExperience")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("profile.theme")}</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "dark", label: t("profile.dark") },
                      { value: "light", label: t("profile.light") },
                      { value: "auto", label: t("profile.auto") },
                    ].map((theme) => (
                      <Button
                        key={theme.value}
                        variant={theme.value === "dark" ? "default" : "outline"}
                        className={theme.value === "dark" ? "bg-primary hover:bg-primary/90" : "bg-transparent"}
                      >
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("profile.textSize")}</Label>
                  <div className="flex gap-3">
                    {[
                      { value: "small", label: t("profile.small") },
                      { value: "normal", label: t("profile.normal") },
                      { value: "large", label: t("profile.large") },
                    ].map((size) => (
                      <Button
                        key={size.value}
                        variant={size.value === "normal" ? "default" : "outline"}
                        className={size.value === "normal" ? "bg-primary hover:bg-primary/90" : "bg-transparent"}
                      >
                        {size.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{t("profile.dataOptimization")}</p>
                    <p className="text-sm text-muted-foreground">{t("profile.dataOptimizationDesc")}</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-border bg-input cursor-pointer accent-primary"
                  />
                </div>

                <Button className="bg-primary hover:bg-primary/90">{t("profile.savePreferences")}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

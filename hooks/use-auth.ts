"use client"

import { useState, useCallback, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  user: any | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    user: null,
    loading: true,
    error: null,
  })

  // Check if user is already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: true,
        accessToken: token,
        loading: false,
      }))
    } else {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
      }))
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiClient.auth.signup(name, email, password)

      if (response.success && response.data?.access_token) {
        apiClient.setCredentials(response.data.access_token)
        setAuthState({
          isAuthenticated: true,
          accessToken: response.data.access_token,
          user: response.data.user,
          loading: false,
          error: null,
        })
        return true
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: response.error || "Signup failed",
        }))
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup error"
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }))
      return false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiClient.auth.login(email, password)

      if (response.success && response.data?.access_token) {
        apiClient.setCredentials(response.data.access_token)
        setAuthState({
          isAuthenticated: true,
          accessToken: response.data.access_token,
          user: response.data.user,
          loading: false,
          error: null,
        })
        return true
      } else {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: response.error || "Login failed",
        }))
        return false
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login error"
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }))
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }))

    try {
      await apiClient.auth.logout()
    } finally {
      apiClient.clearCredentials()
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        user: null,
        loading: false,
        error: null,
      })
    }
  }, [])

  return {
    ...authState,
    signup,
    login,
    logout,
  }
}

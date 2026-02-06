/**
 * INTERACT AI - API Client Service
 * Centralized service for all backend API communication
 * Ready to connect to Python FastAPI backend
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  attachments?: string[]
}

export interface ConversationData {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  country?: string
  language?: string
  createdAt: string
}

class InteractAIClient {
  private baseUrl: string
  private apiKey: string | null = null
  private accessToken: string | null = null

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api") {
    this.baseUrl = baseUrl
    this.loadStoredCredentials()
  }

  /**
   * Load stored credentials from localStorage
   */
  private loadStoredCredentials(): void {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token")
      this.apiKey = localStorage.getItem("api_key")
    }
  }

  /**
   * Set authentication credentials
   */
  setCredentials(accessToken: string, apiKey?: string): void {
    this.accessToken = accessToken
    if (apiKey) this.apiKey = apiKey
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", accessToken)
      if (apiKey) localStorage.setItem("api_key", apiKey)
    }
  }

  /**
   * Clear authentication credentials
   */
  clearCredentials(): void {
    this.accessToken = null
    this.apiKey = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("api_key")
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit & { method?: string } = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        this.clearCredentials()
        window.location.href = "/login"
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || "An error occurred",
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  /**
   * Authentication Endpoints
   */
  auth = {
    signup: async (name: string, email: string, password: string): Promise<ApiResponse> => {
      return this.request("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      })
    },

    login: async (email: string, password: string): Promise<ApiResponse> => {
      return this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
    },

    logout: async (): Promise<ApiResponse> => {
      return this.request("/auth/logout", {
        method: "POST",
      })
    },

    refreshToken: async (): Promise<ApiResponse> => {
      return this.request("/auth/refresh", {
        method: "POST",
      })
    },
  }

  /**
   * Chat Endpoints
   */
  chat = {
    sendMessage: async (conversationId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
      return this.request("/chat/message", {
        method: "POST",
        body: JSON.stringify({ conversationId, content }),
      })
    },

    streamMessage: async function* (conversationId: string, content: string) {
      const url = `${this.baseUrl}/chat/stream`
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ conversationId, content }),
        })

        if (!response.ok) throw new Error("Stream failed")

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          yield decoder.decode(value)
        }
      } catch (error) {
        throw error instanceof Error ? error : new Error("Stream error")
      }
    },

    getConversation: async (conversationId: string): Promise<ApiResponse<ConversationData>> => {
      return this.request(`/chat/conversation/${conversationId}`)
    },

    getConversations: async (): Promise<ApiResponse<ConversationData[]>> => {
      return this.request("/chat/conversations")
    },

    updateConversationTitle: async (conversationId: string, title: string): Promise<ApiResponse<ConversationData>> => {
      return this.request(`/chat/conversation/${conversationId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
      })
    },

    deleteConversation: async (conversationId: string): Promise<ApiResponse> => {
      return this.request(`/chat/conversation/${conversationId}`, {
        method: "DELETE",
      })
    },
  }

  /**
   * File Upload Endpoints
   */
  files = {
    upload: async (file: File, conversationId: string): Promise<ApiResponse> => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("conversationId", conversationId)

      const headers: HeadersInit = {}
      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`
      }

      try {
        const response = await fetch(`${this.baseUrl}/files/upload`, {
          method: "POST",
          headers,
          body: formData,
        })

        const data = await response.json()
        return {
          success: response.ok,
          data: response.ok ? data : undefined,
          error: response.ok ? undefined : data.error,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        }
      }
    },

    delete: async (fileId: string): Promise<ApiResponse> => {
      return this.request(`/files/${fileId}`, {
        method: "DELETE",
      })
    },
  }

  /**
   * Image Generation Endpoints
   */
  images = {
    generate: async (prompt: string): Promise<ApiResponse<{ imageUrl: string }>> => {
      return this.request("/images/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      })
    },

    delete: async (imageId: string): Promise<ApiResponse> => {
      return this.request(`/images/${imageId}`, {
        method: "DELETE",
      })
    },
  }

  /**
   * Voice Processing Endpoints
   */
  voice = {
    transcribe: async (audioBlob: Blob): Promise<ApiResponse<{ text: string }>> => {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const headers: HeadersInit = {}
      if (this.accessToken) {
        headers["Authorization"] = `Bearer ${this.accessToken}`
      }

      try {
        const response = await fetch(`${this.baseUrl}/voice/transcribe`, {
          method: "POST",
          headers,
          body: formData,
        })

        const data = await response.json()
        return {
          success: response.ok,
          data: response.ok ? data : undefined,
          error: response.ok ? undefined : data.error,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Transcription failed",
        }
      }
    },
  }

  /**
   * User Profile Endpoints
   */
  users = {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
      return this.request("/users/profile")
    },

    updateProfile: async (updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> => {
      return this.request("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(updates),
      })
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
      return this.request("/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    },
  }
}

// Export singleton instance
export const apiClient = new InteractAIClient()

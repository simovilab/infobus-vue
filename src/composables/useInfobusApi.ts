import { ref, type Ref } from 'vue'
import type { InfobusApiConfig } from '../types'

export function useInfobusApi(config: InfobusApiConfig) {
  const isLoading = ref(false)
  const error: Ref<string | null> = ref(null)

  const makeRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    isLoading.value = true
    error.value = null

    try {
      const url = new URL(endpoint, config.baseUrl)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>)
      }

      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }

      const response = await fetch(url.toString(), {
        ...options,
        headers,
        signal: AbortSignal.timeout(config.timeout || 10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Handle wrapped API responses
      if (data.success === false) {
        throw new Error(data.error || data.message || 'API request failed')
      }

      return data.data || data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    makeRequest
  }
}

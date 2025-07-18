import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInfobusApi } from '../useInfobusApi'

describe('useInfobusApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct default values', () => {
    const config = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      timeout: 5000
    }

    const { isLoading, error } = useInfobusApi(config)

    expect(isLoading.value).toBe(false)
    expect(error.value).toBe(null)
  })

  it('should make successful API request', async () => {
    const mockResponse = { data: { test: 'data' } }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse)
    })

    const config = {
      baseUrl: 'https://api.example.com',
      timeout: 5000
    }

    const { makeRequest } = useInfobusApi(config)
    const result = await makeRequest('/test')

    expect(result).toEqual({ test: 'data' })
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
  })

  it('should handle API errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    })

    const config = {
      baseUrl: 'https://api.example.com',
      timeout: 5000
    }

    const { makeRequest, error } = useInfobusApi(config)

    await expect(makeRequest('/test')).rejects.toThrow(
      'HTTP error! status: 404'
    )
    expect(error.value).toBe('HTTP error! status: 404')
  })

  it('should include API key in headers when provided', async () => {
    const mockResponse = { data: { test: 'data' } }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse)
    })

    const config = {
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
      timeout: 5000
    }

    const { makeRequest } = useInfobusApi(config)
    await makeRequest('/test')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key'
        })
      })
    )
  })
})

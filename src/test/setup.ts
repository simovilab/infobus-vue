import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn(),
      remove: vi.fn(),
      fitBounds: vi.fn()
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn()
    })),
    geoJSON: vi.fn(() => ({
      addTo: vi.fn(),
      clearLayers: vi.fn(),
      addData: vi.fn(),
      getBounds: vi.fn(() => ({
        isValid: vi.fn(() => true)
      }))
    }))
  }
}))

// Mock AbortSignal.timeout if not available
if (typeof AbortSignal.timeout === 'undefined') {
  AbortSignal.timeout = vi.fn(() => new AbortController().signal)
}

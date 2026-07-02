import { renderHook, act } from '@testing-library/react'
import { AccessibilityProvider, useAccessibility } from '../context/AccessibilityContext'
import { afterEach, describe, expect, it } from 'vitest'

const wrapper = ({ children }) => <AccessibilityProvider>{children}</AccessibilityProvider>

afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('high-contrast')
    document.documentElement.style.fontSize = ''
})

describe('useAccessibility', () => {
    it('valores iniciais sem localStorage', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        expect(result.current.highContrast).toBe(false)
        expect(result.current.fontScale).toBe(100)
    })

    it('toggleContrast ativa classe no html e persiste', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        act(() => result.current.toggleContrast())
        expect(result.current.highContrast).toBe(true)
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
        expect(localStorage.getItem('a11y_high_contrast')).toBe('1')
    })

    it('toggleContrast desativa e remove do localStorage', () => {
        localStorage.setItem('a11y_high_contrast', '1')
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        expect(result.current.highContrast).toBe(true)
        act(() => result.current.toggleContrast())
        expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
        expect(localStorage.getItem('a11y_high_contrast')).toBe(null)
    })

    it('increaseFont aplica fontSize no html e respeita limite de 150', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        act(() => result.current.increaseFont())
        expect(result.current.fontScale).toBe(112.5)
        expect(document.documentElement.style.fontSize).toBe('112.5%')
        for (let i = 0; i < 10; i++) act(() => result.current.increaseFont())
        expect(result.current.fontScale).toBe(150)
    })

    it('decreaseFont respeita limite de 87.5', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        for (let i = 0; i < 10; i++) act(() => result.current.decreaseFont())
        expect(result.current.fontScale).toBe(87.5)
    })

    it('resetFont volta a 100 e limpa fontSize e localStorage', () => {
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        act(() => result.current.increaseFont())
        act(() => result.current.resetFont())
        expect(result.current.fontScale).toBe(100)
        expect(document.documentElement.style.fontSize).toBe('')
        expect(localStorage.getItem('a11y_font_scale')).toBe(null)
    })

    it('lê escala de fonte do localStorage', () => {
        localStorage.setItem('a11y_font_scale', '125')
        const { result } = renderHook(() => useAccessibility(), { wrapper })
        expect(result.current.fontScale).toBe(125)
    })
})

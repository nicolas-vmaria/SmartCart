import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { afterEach, describe, expect, it } from 'vitest'

const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>

afterEach(() => localStorage.clear())

describe('useTheme', () => {
    it('valor inicial dark é false sem localStorage', () => {
        const { result } = renderHook(() => useTheme(), { wrapper })
        expect(result.current.dark).toBe(false)
    })

    it('toggle() alterna dark de false para true', () => {
        const { result } = renderHook(() => useTheme(), { wrapper })
        act(() => result.current.toggle())
        expect(result.current.dark).toBe(true)
    })

    it('lê tema dark do localStorage', () => {
        localStorage.setItem('theme', 'dark')
        const { result } = renderHook(() => useTheme(), { wrapper })
        expect(result.current.dark).toBe(true)
    })
})

import { renderHook } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => {
    localStorage.clear()
})

describe('useAuth', () => {
    it('sem token, isLogged é false e nome é vazio', () => {
        const { result } = renderHook(() => useAuth())
        expect(result.current.isLogged).toBe(false)
        expect(result.current.nome).toBe('')
    })

    it('com token no localStorage, isLogged é true', () => {
        localStorage.setItem('user_token', 'token-fake')
        const { result } = renderHook(() => useAuth())
        expect(result.current.isLogged).toBe(true)
    })

    it('com user_nome no localStorage, retorna o nome', () => {
        localStorage.setItem('user_token', 'token-fake')
        localStorage.setItem('user_nome', 'Felipe')
        const { result } = renderHook(() => useAuth())
        expect(result.current.nome).toBe('Felipe')
    })
})

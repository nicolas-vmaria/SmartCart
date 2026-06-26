import { act, cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionWatcher } from '../App'

let store

function mockLocalStorage() {
    store = {}
    vi.stubGlobal('localStorage', {
        getItem: vi.fn(key => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = String(value) }),
        removeItem: vi.fn(key => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    })
}

function criarToken(payload) {
    const encodedPayload = btoa(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    return `header.${encodedPayload}.signature`
}

function CurrentPath() {
    const location = useLocation()
    return <div data-testid="path">{location.pathname}</div>
}

function renderWatcher(initialPath = '/') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <SessionWatcher />
            <Routes>
                <Route path="*" element={<CurrentPath />} />
            </Routes>
        </MemoryRouter>
    )
}

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-25T12:00:00.000Z'))
    mockLocalStorage()
})

afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('SessionWatcher', () => {
    it('desloga cliente quando o token expira sem requisicao', async () => {
        const exp = Math.floor(Date.now() / 1000) + 1
        localStorage.setItem('user_token', criarToken({ role: 'cliente', exp }))
        localStorage.setItem('user_nome', 'Felipe')

        renderWatcher('/profile')

        await act(async () => {
            vi.advanceTimersByTime(1100)
        })

        expect(localStorage.getItem('user_token')).toBeNull()
        expect(localStorage.getItem('user_nome')).toBeNull()
        expect(screen.getByText('Token expirado. Faça login novamente.')).toBeInTheDocument()
        expect(screen.getByTestId('path')).toHaveTextContent('/login')
    })

    it('desloga admin quando o token expira sem requisicao', async () => {
        const exp = Math.floor(Date.now() / 1000) + 1
        localStorage.setItem('admin_token', criarToken({ role: 'admin', exp }))
        localStorage.setItem('admin_user', JSON.stringify({ nome: 'Admin' }))

        renderWatcher('/admin')

        await act(async () => {
            vi.advanceTimersByTime(1100)
        })

        expect(localStorage.getItem('admin_token')).toBeNull()
        expect(localStorage.getItem('admin_user')).toBeNull()
        expect(screen.getByText('Token expirado. Faça login novamente.')).toBeInTheDocument()
        expect(screen.getByTestId('path')).toHaveTextContent('/admin/login')
    })
})

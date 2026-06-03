import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRouteUser from '../components/ProtectRoutesUser'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let store

beforeEach(() => {
    store = {}
    const localStorageMock = {
        getItem: vi.fn(key => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = String(value) }),
        removeItem: vi.fn(key => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }

    vi.stubGlobal('localStorage', localStorageMock)
})

afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.unstubAllGlobals()
})

function criarTokenCliente(exp = Math.floor(Date.now() / 1000) + 3600) {
    const payload = btoa(JSON.stringify({ role: 'cliente', exp }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

    return `header.${payload}.signature`
}

describe('ProtectedRouteUser', () => {
    it('sem token, redireciona para /login', () => {
        render(
            <MemoryRouter initialEntries={['/perfil']}>
                <Routes>
                    <Route element={<ProtectedRouteUser />}>
                        <Route path="/perfil" element={<div>Perfil</div>} />
                    </Route>
                    <Route path="/login" element={<div>Login Usuario</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Login Usuario')).toBeInTheDocument()
    })

    it('com token valido, renderiza o conteudo protegido', () => {
        localStorage.setItem('user_token', criarTokenCliente())

        render(
            <MemoryRouter initialEntries={['/perfil']}>
                <Routes>
                    <Route element={<ProtectedRouteUser />}>
                        <Route path="/perfil" element={<div>Perfil</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Perfil')).toBeInTheDocument()
    })

    it('com token expirado, limpa sessao e redireciona para /login', () => {
        localStorage.setItem('user_token', criarTokenCliente(Math.floor(Date.now() / 1000) - 1))
        localStorage.setItem('user_nome', 'Felipe')

        render(
            <MemoryRouter initialEntries={['/perfil']}>
                <Routes>
                    <Route element={<ProtectedRouteUser />}>
                        <Route path="/perfil" element={<div>Perfil</div>} />
                    </Route>
                    <Route path="/login" element={<div>Login Usuario</div>} />
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Login Usuario')).toBeInTheDocument()
        expect(localStorage.getItem('user_token')).toBeNull()
        expect(localStorage.getItem('user_nome')).toBeNull()
    })
})

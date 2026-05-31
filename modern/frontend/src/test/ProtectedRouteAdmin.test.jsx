import { render, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRouteAdmin from '../components/admin/ProtectedRouteAdmin'
import { afterEach, describe, expect, it } from 'vitest'

function criarTokenAdmin(exp = Math.floor(Date.now() / 1000) + 3600) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    const payload = btoa(JSON.stringify({ role: 'admin', exp }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return `${header}.${payload}.assinatura-fake`
}

afterEach(() => localStorage.clear())

describe('ProtectedRouteAdmin', () => {
    it('sem token, redireciona para /admin/login', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRouteAdmin />}>
                        <Route path="/admin" element={<div>Painel Admin</div>} />
                    </Route>
                    <Route path="/admin/login" element={<div>Login Admin</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(within(container).getByText('Login Admin')).toBeInTheDocument()
    })

    it('com token admin válido, renderiza o painel', () => {
        localStorage.setItem('admin_token', criarTokenAdmin())
        const { container } = render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRouteAdmin />}>
                        <Route path="/admin" element={<div>Painel Admin</div>} />
                    </Route>
                    <Route path="/admin/login" element={<div>Login Admin</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(within(container).getByText('Painel Admin')).toBeInTheDocument()
    })

    it('com token expirado, redireciona para /admin/login', () => {
        const tokenExpirado = criarTokenAdmin(Math.floor(Date.now() / 1000) - 1)
        localStorage.setItem('admin_token', tokenExpirado)
        const { container } = render(
            <MemoryRouter initialEntries={['/admin']}>
                <Routes>
                    <Route element={<ProtectedRouteAdmin />}>
                        <Route path="/admin" element={<div>Painel Admin</div>} />
                    </Route>
                    <Route path="/admin/login" element={<div>Login Admin</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(within(container).getByText('Login Admin')).toBeInTheDocument()
    })
})

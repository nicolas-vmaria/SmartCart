import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRouteUser from '../components/ProtectRoutesUser'
import { afterEach, describe, expect, it } from 'vitest'

afterEach(() => localStorage.clear())

describe('ProtectedRouteUser', () => {
    it('sem token, redireciona para /admin/login', () => {
        render(
            <MemoryRouter initialEntries={['/perfil']}>
                <Routes>
                    <Route element={<ProtectedRouteUser />}>
                        <Route path="/perfil" element={<div>Perfil</div>} />
                    </Route>
                    <Route path="/admin/login" element={<div>Login Admin</div>} />
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('Login Admin')).toBeInTheDocument()
    })

    it('com token válido, renderiza o conteúdo protegido', () => {
        localStorage.setItem('user_token', 'token-fake')
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
})

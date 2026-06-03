import { Navigate, Outlet } from 'react-router-dom'

function decodeToken(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    } catch {
        return null
    }
}

export default function ProtectedRouteUser() {
    const token = localStorage.getItem('user_token')

    if (!token) {
        return <Navigate to="/login" replace />
    }

    const payload = decodeToken(token)

    if (!payload || payload.role !== 'cliente' || (payload.exp && payload.exp * 1000 < Date.now())) {
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_nome')
        window.dispatchEvent(new Event('storage'))
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

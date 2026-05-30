import { Navigate, Outlet } from 'react-router-dom'

function decodeToken(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    } catch {
        return null
    }
}

export default function ProtectedRouteAdmin() {
    const token = localStorage.getItem('admin_token')

    if (!token) {
        return <Navigate to="/admin/login" replace />
    }

    const payload = decodeToken(token)

    if (!payload || payload.role !== 'admin' || payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('admin_token')
        return <Navigate to="/admin/login" replace />
    }

    return <Outlet />
}

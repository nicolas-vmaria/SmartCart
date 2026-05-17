import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRouteUser() {
    const token = localStorage.getItem('user_token')

    if (!token) {
        return <Navigate to="/admin/login" replace />
    }

    return <Outlet />
}
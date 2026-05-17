import { useState, useEffect } from 'react'

export function useAuth() {
    const [isLogged, setIsLogged] = useState(!!localStorage.getItem('user_token'))
    const [nome, setNome] = useState(localStorage.getItem('user_nome') || '')

    useEffect(() => {
        function sync() {
            setIsLogged(!!localStorage.getItem('user_token'))
            setNome(localStorage.getItem('user_nome') || '')
        }
        window.addEventListener('storage', sync)
        return () => window.removeEventListener('storage', sync)
    }, [])

    return { isLogged, nome }
}

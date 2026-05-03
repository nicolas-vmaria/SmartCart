import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        // Só aplica background no body para evitar o branco nos cantos do sidebar
        if (dark) {
            document.body.style.backgroundColor = '#080808'
            document.body.style.colorScheme = 'dark'
            localStorage.setItem('theme', 'dark')
        } else {
            document.body.style.backgroundColor = ''
            document.body.style.colorScheme = ''
            localStorage.setItem('theme', 'light')
        }
    }, [dark])

    function toggle() { setDark(prev => !prev) }

    return (
        <ThemeContext.Provider value={{ dark, toggle, setDark }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}

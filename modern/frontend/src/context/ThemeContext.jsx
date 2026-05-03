import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

    useEffect(() => {
        localStorage.setItem('theme', dark ? 'dark' : 'light')
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

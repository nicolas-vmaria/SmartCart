import { createContext, useContext, useEffect, useState } from 'react'

const AccessibilityContext = createContext()

const FONT_MIN = 87.5
const FONT_MAX = 150
const FONT_STEP = 12.5

export function AccessibilityProvider({ children }) {
    const [highContrast, setHighContrast] = useState(() => localStorage.getItem('a11y_high_contrast') === '1')
    const [fontScale, setFontScale] = useState(() => {
        const saved = Number(localStorage.getItem('a11y_font_scale'))
        return saved >= FONT_MIN && saved <= FONT_MAX ? saved : 100
    })

    useEffect(() => {
        document.documentElement.classList.toggle('high-contrast', highContrast)
        if (highContrast) localStorage.setItem('a11y_high_contrast', '1')
        else localStorage.removeItem('a11y_high_contrast')
    }, [highContrast])

    useEffect(() => {
        document.documentElement.style.fontSize = fontScale === 100 ? '' : `${fontScale}%`
        if (fontScale === 100) localStorage.removeItem('a11y_font_scale')
        else localStorage.setItem('a11y_font_scale', String(fontScale))
    }, [fontScale])

    function toggleContrast() { setHighContrast(prev => !prev) }
    function increaseFont() { setFontScale(prev => Math.min(prev + FONT_STEP, FONT_MAX)) }
    function decreaseFont() { setFontScale(prev => Math.max(prev - FONT_STEP, FONT_MIN)) }
    function resetFont() { setFontScale(100) }

    return (
        <AccessibilityContext.Provider value={{ highContrast, toggleContrast, fontScale, increaseFont, decreaseFont, resetFont }}>
            {children}
        </AccessibilityContext.Provider>
    )
}

export function useAccessibility() {
    return useContext(AccessibilityContext)
}

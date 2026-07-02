import { useEffect } from 'react'

export function useDocumentTitle(titulo) {
    useEffect(() => {
        if (!titulo) return
        document.title = `${titulo} | SmartCart`
        return () => {
            document.title = 'SmartCart'
        }
    }, [titulo])
}

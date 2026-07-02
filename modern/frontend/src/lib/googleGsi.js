let gsiPromise = null

export function loadGsi() {
    if (window.google?.accounts) return Promise.resolve()
    if (gsiPromise) return gsiPromise
    gsiPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.onload = resolve
        script.onerror = () => {
            gsiPromise = null
            reject(new Error('Falha ao carregar Google Sign-In'))
        }
        document.head.appendChild(script)
    })
    return gsiPromise
}

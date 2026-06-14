const TZ = 'America/Sao_Paulo'

function parseUTC(str: string): Date | null {
    if (!str) return null
    return new Date(str.replace(' ', 'T') + 'Z')
}

export function formatDate(str: string): string {
    const d = parseUTC(str)
    if (!d) return '—'
    return d.toLocaleDateString('pt-BR', { timeZone: TZ })
}

export function formatDateTime(str: string): string {
    const d = parseUTC(str)
    if (!d) return '—'
    return d.toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

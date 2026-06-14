const TZ = 'America/Sao_Paulo'

function parseUTC(str) {
    if (!str) return null
    return new Date(str.replace(' ', 'T') + 'Z')
}

export function formatDate(str) {
    const d = parseUTC(str)
    if (!d) return '—'
    return d.toLocaleDateString('pt-BR', { timeZone: TZ })
}

export function formatDateTime(str) {
    const d = parseUTC(str)
    if (!d) return '—'
    return d.toLocaleString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatMonthYear(str) {
    const d = parseUTC(str)
    if (!d) return '—'
    return d.toLocaleDateString('pt-BR', { timeZone: TZ, month: 'short', year: 'numeric' })
}

export function formatDateLong(str) {
    const d = parseUTC(str)
    if (!d) return '—'
    return d.toLocaleDateString('pt-BR', { timeZone: TZ, day: '2-digit', month: 'long', year: 'numeric' })
}

export function parseDateParts(str) {
    if (!str) return { date: '—', hour: '—', iso: '' }
    const d = parseUTC(str)
    const date = d.toLocaleDateString('pt-BR', { timeZone: TZ })
    const hour = d.toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
    const iso = str.split(' ')[0]
    return { date, hour, iso }
}

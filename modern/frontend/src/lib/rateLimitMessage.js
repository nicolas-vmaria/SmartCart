export function getRateLimitMessage(err, fallback = 'Erro ao conectar com o servidor') {
    if (err.response?.status !== 429) {
        return err.response?.data?.error || fallback
    }

    const retryAfter = Number(err.response?.data?.retry_after)
    if (!retryAfter || Number.isNaN(retryAfter)) {
        return 'Muitas tentativas. Tente novamente mais tarde.'
    }

    if (retryAfter < 60) {
        return `Muitas tentativas. Tente novamente em ${retryAfter} segundo${retryAfter === 1 ? '' : 's'}.`
    }

    const minutes = Math.ceil(retryAfter / 60)
    return `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes === 1 ? '' : 's'}.`
}

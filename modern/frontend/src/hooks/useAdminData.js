import { useState, useEffect, useCallback } from 'react'

export function useAdminData(cacheKey, fetchFn) {
    const [data, setData] = useState(() => {
        try {
            const c = localStorage.getItem(cacheKey)
            if (!c) return null
            const parsed = JSON.parse(c)
            return Array.isArray(parsed) ? parsed : null
        } catch { return null }
    })
    const [loading, setLoading] = useState(() => !localStorage.getItem(cacheKey))

    const refetch = useCallback(() => {
        setLoading(true)
        return fetchFn()
            .then(fresh => {
                setData(fresh)
                localStorage.setItem(cacheKey, JSON.stringify(fresh))
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => { refetch() }, [])

    function updateCache(updater) {
        setData(prev => {
            const next = typeof updater === 'function' ? updater(prev ?? []) : updater
            localStorage.setItem(cacheKey, JSON.stringify(next))
            return next
        })
    }

    return { data: Array.isArray(data) ? data : [], loading, setData: updateCache, refetch, setLoading }
}

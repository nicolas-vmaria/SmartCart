import { useState, useEffect } from 'react'
import { getConfiguracoes } from '../lib/api/configuracoes'

let _cache = null
let _promise = null

export function useConfiguracoes() {
    const [config, setConfig] = useState(_cache ?? {})
    const [loading, setLoading] = useState(!_cache)

    useEffect(() => {
        if (_cache) return
        if (!_promise) {
            _promise = getConfiguracoes()
                .then(({ data }) => {
                    _cache = data.configuracoes ?? {}
                    return _cache
                })
                .catch(() => {
                    _cache = {}
                    return {}
                })
        }
        _promise.then(data => {
            setConfig(data)
            setLoading(false)
        })
    }, [])

    return { config, loading }
}

export function invalidateConfiguracoes() {
    _cache = null
    _promise = null
}

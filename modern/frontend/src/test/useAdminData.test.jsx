import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminData } from '../hooks/useAdminData'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => localStorage.clear())

describe('useAdminData', () => {
    it('estado inicial sem cache: data=[] e loading=true', () => {
        const fetchFn = vi.fn().mockResolvedValue([])
        const { result } = renderHook(() => useAdminData('key-1', fetchFn))
        expect(result.current.data).toEqual([])
        expect(result.current.loading).toBe(true)
    })

    it('após fetch, data é preenchido e loading=false', async () => {
        const fetchFn = vi.fn().mockResolvedValue([{ id: 1, nome: 'Produto A' }])
        const { result } = renderHook(() => useAdminData('key-2', fetchFn))
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toEqual([{ id: 1, nome: 'Produto A' }])
    })

    it('refetch() recarrega os dados', async () => {
        const fetchFn = vi.fn()
            .mockResolvedValueOnce([{ id: 1 }])
            .mockResolvedValueOnce([{ id: 2 }])
        const { result } = renderHook(() => useAdminData('key-3', fetchFn))
        await waitFor(() => expect(result.current.loading).toBe(false))
        await act(() => result.current.refetch())
        await waitFor(() => expect(result.current.data).toEqual([{ id: 2 }]))
    })

    it('erro no fetch: loading=false e data=[]', async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error('falhou'))
        const { result } = renderHook(() => useAdminData('key-4', fetchFn))
        await waitFor(() => expect(result.current.loading).toBe(false))
        expect(result.current.data).toEqual([])
    })
})

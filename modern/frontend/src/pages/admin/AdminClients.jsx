import { useState, useRef, useEffect } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import Toast from '../../components/Toast'
import { Search, Trash2, Loader2 } from 'lucide-react'
import { getClients, deleteClient } from '../../lib/api/clients'

function formatDate(dateStr) {
    if (!dateStr) return '—'
    const [date] = dateStr.split(' ')
    const [y, m, d] = date.split('-')
    return `${d}/${m}/${y}`
}

function formatPhone(tel) {
    if (!tel) return '—'
    const d = tel.replace(/\D/g, '')
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
    return tel
}

export default function AdminClients() {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [deletingIds, setDeletingIds] = useState([])
    const [toast, setToast] = useState(null)

    useEffect(() => {
        async function fetchClients() {
            try {
                const { data } = await getClients()
                setClients(Array.isArray(data) ? data : [])
            } catch (err) {
                setToast({ message: err.response?.data?.error || 'Erro ao carregar clientes', type: 'error' })
            } finally {
                setLoading(false)
            }
        }
        fetchClients()
    }, [])

    const filtered = clients.filter(c =>
        c.papel_id == 1 &&
        (c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.tel || '').includes(search))
    )

    const allSelected = filtered.length > 0 && filtered.every(c => selected.includes(c.id))

    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    function toggleAll() {
        if (allSelected) {
            setSelected(prev => prev.filter(id => !filtered.map(c => c.id).includes(id)))
        } else {
            setSelected(prev => [...new Set([...prev, ...filtered.map(c => c.id)])])
        }
    }

    async function handleDelete(ids) {
        setDeletingIds(ids)
        try {
            await Promise.all(ids.map(id => deleteClient(id)))
            setClients(prev => prev.filter(c => !ids.includes(c.id)))
            setSelected(prev => prev.filter(id => !ids.includes(id)))
            setToast({ message: `${ids.length > 1 ? `${ids.length} clientes removidos` : 'Cliente removido'} com sucesso`, type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao excluir cliente', type: 'error' })
        } finally {
            setDeletingIds([])
        }
    }

    return (
        <main>
            <AdminHeader title="Clientes" description="Gerencie os clientes cadastrados." />

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            className="outline-none dark:bg-(--admin-card) dark:text-(--admin-text) text-sm w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {selected.length > 0 && (
                        <button
                            onClick={() => handleDelete(selected)}
                            disabled={deletingIds.length > 0}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all disabled:opacity-50"
                        >
                            {deletingIds.length > 0 ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            Excluir {selected.length} selecionado(s)
                        </button>
                    )}

                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted) ml-auto">{filtered.length} cliente(s)</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 size={28} className="animate-spin text-gray-300 dark:text-(--admin-text-muted)" />
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                                <th className="pb-3 pr-3">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                                </th>
                                <th className="pb-3 font-medium">Nome</th>
                                <th className="pb-3 font-medium">Email</th>
                                <th className="pb-3 font-medium">Telefone</th>
                                <th className="pb-3 font-medium">Cadastro</th>
                                <th className="pb-3 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(client => (
                                <tr key={client.id} className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 ${selected.includes(client.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                    <td className="py-3 pr-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(client.id)}
                                            onChange={() => toggleOne(client.id)}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{client.nome}</td>
                                    <td className="py-3 text-gray-600 dark:text-(--admin-text)">{client.email}</td>
                                    <td className="py-3 text-gray-600 dark:text-(--admin-text)">{formatPhone(client.tel)}</td>
                                    <td className="py-3 text-gray-600 dark:text-(--admin-text)">{formatDate(client.created_at)}</td>
                                    <td className="py-3">
                                        <button
                                            onClick={() => handleDelete([client.id])}
                                            disabled={deletingIds.includes(client.id)}
                                            className="p-1.5 rounded-md hover:bg-red-950/40 transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-red-500 disabled:opacity-50"
                                        >
                                            {deletingIds.includes(client.id)
                                                ? <Loader2 size={15} className="animate-spin" />
                                                : <Trash2 size={15} />
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">Nenhum cliente encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}

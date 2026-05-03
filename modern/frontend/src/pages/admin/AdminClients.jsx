import { useState, useRef, useEffect } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Search, Trash2, Pencil, X, UserPlus, SlidersHorizontal } from 'lucide-react'

const initialClients = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '(11) 91234-5678', orders: 5, status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '(21) 98765-4321', orders: 12, status: 'Ativo' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(31) 97654-3210', orders: 2, status: 'Inativo' },
    { id: 4, name: 'Ana Costa', email: 'ana@email.com', phone: '(41) 96543-2109', orders: 8, status: 'Ativo' },
    { id: 5, name: 'Carlos Mendes', email: 'carlos@email.com', phone: '(51) 95432-1098', orders: 0, status: 'Inativo' },
]

const statusStyle = {
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-red-100 text-red-700',
}

const emptyForm = { name: '', email: '', phone: '', status: 'Ativo' }

export default function AdminClients() {
    const [clients, setClients] = useState(initialClients)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [filters, setFilters] = useState({ status: 'Todos', orders: 'Todos' })
    const filterRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilters(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const activeFiltersCount = [filters.status !== 'Todos', filters.orders !== 'Todos'].filter(Boolean).length

    const filtered = clients.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filters.status === 'Todos' || c.status === filters.status
        const matchOrders =
            filters.orders === 'Todos' ? true :
            filters.orders === 'Sem pedidos' ? c.orders === 0 :
            filters.orders === '1-5' ? c.orders >= 1 && c.orders <= 5 :
            c.orders > 5
        return matchSearch && matchStatus && matchOrders
    })

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

    function deleteSelected() {
        setClients(prev => prev.filter(c => !selected.includes(c.id)))
        setSelected([])
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email) return
        setClients(prev => [...prev, { ...form, id: Date.now(), orders: 0 }])
        setForm(emptyForm)
        setShowModal(false)
    }

    function clearFilters() {
        setFilters({ status: 'Todos', orders: 'Todos' })
    }

    return (
        <main>
            <AdminHeader title="Clientes" description="Gerencie os clientes, exclua, edite ou adicione." />

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

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilters(prev => !prev)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${activeFiltersCount > 0 ? 'border-verde-escuro text-verde-escuro bg-green-50' : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}
                        >
                            <SlidersHorizontal size={15} />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-verde-escuro text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>
                            )}
                        </button>

                        {showFilters && (
                            <div className="absolute top-11 left-0 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-xl shadow-lg dark:shadow-black/40 p-4 z-20 w-52 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Status</label>
                                    {['Todos', 'Ativo', 'Inativo'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilters(prev => ({ ...prev, status: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.status === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Pedidos</label>
                                    {['Todos', 'Sem pedidos', '1-5', 'Mais de 5'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilters(prev => ({ ...prev, orders: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.orders === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button
                            onClick={deleteSelected}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all"
                        >
                            <Trash2 size={15} />
                            Excluir {selected.length} selecionado(s)
                        </button>
                    )}

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all ml-auto"
                    >
                        <UserPlus size={15} />
                        Novo cliente
                    </button>

                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{filtered.length} cliente(s)</span>
                </div>

                <table className="w-full text-sm ">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 pr-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                            </th>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Telefone</th>
                            <th className="pb-3 font-medium">Pedidos</th>
                            <th className="pb-3 font-medium">Status</th>
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
                                <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{client.name}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{client.email}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{client.phone}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{client.orders}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[client.status]}`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) hover:cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                        <Pencil size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">Nenhum cliente encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-black/40">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">Novo cliente</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Nome *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Email *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="email@exemplo.com"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Telefone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Status</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                >
                                    <option>Ativo</option>
                                    <option>Inativo</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all"
                                >
                                    Criar cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

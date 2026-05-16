import { useState, useRef, useEffect } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Search, Trash2, Pencil, X, Plus, SlidersHorizontal, ImagePlus, ExternalLink } from 'lucide-react'
import { createProduct, getProduct } from '../../lib/api/products'
import { getCategories } from '../../lib/api/category'
import Toast from '../../components/Toast'



const statusStyle = {
    'Ativo':   'bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-300',
    'Inativo': 'bg-red-100 text-red-700 dark:bg-red-500/25 dark:text-red-300',
}

const emptyForm = { name: '', categoria_id: '', descricao: '', price: '', stock: '', status: 'Ativo', image: null }

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editing, setEditing] = useState(null)
    const [filters, setFilters] = useState({ status: 'Todos', categoria: 'Todas', stock: 'Todos' })
    const filterRef = useRef(null)
    const [toast, setToast] = useState(false)

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilters(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function getProducts() {
        try {
            const { data } = await getProduct()
            setProducts(data)
        } catch(err) {
            setToast({ message: err.response?.data?.error || 'Erro ao conectar com o servidor' })
        }
    }

    useEffect(() => {
        getProducts()
    }, [])

    useEffect(() => {
        getCategories().then(({ data }) => setCategories(data)).catch(() => {})
    }, [])

    const activeFiltersCount = [
        filters.status !== 'Todos',
        filters.categoria !== 'Todas',
        filters.stock !== 'Todos',
    ].filter(Boolean).length

    const filtered = products.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.categoria.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filters.status === 'Todos' || (filters.status === 'Ativo' ? p.status == 1 : p.status == 0)
        const matchcategoria = filters.categoria === 'Todas' || p.categoria === filters.categoria
        const matchStock =
            filters.stock === 'Todos' ? true :
            filters.stock === 'Sem estoque' ? p.stock === 0 :
            filters.stock === 'Baixo (1-10)' ? p.stock >= 1 && p.stock <= 10 :
            p.stock > 10
        return matchSearch && matchStatus && matchcategoria && matchStock
    })

    const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id))

    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    function toggleAll() {
        if (allSelected) {
            setSelected(prev => prev.filter(id => !filtered.map(p => p.id).includes(id)))
        } else {
            setSelected(prev => [...new Set([...prev, ...filtered.map(p => p.id)])])
        }
    }

    function deleteSelected() {
        setProducts(prev => prev.filter(p => !selected.includes(p.id)))
        setSelected([])
    }

    function openEdit(product) {
        setEditing(product.id)
        setForm({ name: product.name, categoria: product.categoria, price: product.price, stock: product.stock, status: product.status, image: product.image || null })
        setShowModal(true)
    }

    function closeModal() {
        setShowModal(false)
        setEditing(null)
        setForm(emptyForm)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.price) return

        if (editing) {
            setProducts(prev => prev.map(p => p.id === editing ? { ...p, ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 } : p))
        } else {
            try{
                const {data} = await createProduct(form)
                setToast({message: data.message, type: 'success'})
                await getProducts()
            }catch(err){
                setToast({message: err.response?.data?.error, type: 'error'})
            }
        }
        
        closeModal()
    }

    function clearFilters() {
        setFilters({ status: 'Todos', categoria: 'Todas', stock: 'Todos' })
    }

    return (
        <main>
            <AdminHeader title="Produtos" description="Gerencie o catálogo de produtos da loja." />

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou categoria..."
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
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, status: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.status === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Categoria</label>
                                    {[{ id: 'todas', nome: 'Todas' }, ...categories].map(c => (
                                        <button key={c.id} onClick={() => setFilters(prev => ({ ...prev, categoria: c.nome }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.categoria === c.nome ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {c.nome}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Estoque</label>
                                    {['Todos', 'Sem estoque', 'Baixo (1-10)', 'Normal'].map(opt => (
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, stock: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.stock === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
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
                        <button onClick={deleteSelected}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all">
                            <Trash2 size={15} />
                            Excluir {selected.length} selecionado(s)
                        </button>
                    )}

                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all ml-auto">
                        <Plus size={15} />
                        Novo produto
                    </button>

                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{filtered.length} produto(s)</span>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 pr-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                            </th>
                            <th className="pb-3 font-medium">Foto</th>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Categoria</th>
                            <th className="pb-3 font-medium">Preço</th>
                            <th className="pb-3 font-medium">Estoque</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(product => (
                            <tr key={product.id} className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 ${selected.includes(product.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                <td className="py-3 pr-3">
                                    <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleOne(product.id)} className="cursor-pointer" />
                                </td>
                                <td className="py-3">
                                    {product.foto_url
                                        ? <img src={product.foto_url} alt={product.nome} className="w-10 h-10 rounded-lg object-cover" />
                                        : <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-300 dark:text-(--admin-text-muted)"><ImagePlus size={16} /></div>
                                    }
                                </td>
                                <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{product.nome}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{product.categoria}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">R${parseFloat(product.preco).toFixed(2).replace('.', ',')}</td>
                                <td className="py-3">
                                    <span className={`font-medium ${product.estoque === 0 ? 'text-red-500' : product.estoque <= 10 ? 'text-yellow-500' : 'text-gray-600 dark:text-(--admin-text)'}`}>
                                        {product.estoque}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[product.status == 1 ? 'Ativo' : 'Inativo']}`}>
                                        {product.status == 1 ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="py-3 flex items-center gap-1">
                                    <button onClick={() => openEdit(product)} title="Editar produto" className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                        <Pencil size={15} />
                                    </button>
                                    <a href={`/produto/${product.slug}`} target="_blank" rel="noreferrer" title="Ver no site"
                                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                        <ExternalLink size={15} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">Nenhum produto encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-black/40">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">{editing ? 'Editar produto' : 'Novo produto'}</h2>
                            <button onClick={closeModal} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Foto do produto</label>
                                <label className="cursor-pointer border-2 border-dashed border-gray-200 dark:border-(--admin-border) rounded-lg p-4 flex flex-col items-center gap-2 hover:border-verde-escuro transition-all">
                                    {form.image
                                        ? <img src={form.image} alt="preview" className="h-28 object-contain rounded-lg" />
                                        : <>
                                            <ImagePlus size={28} className="text-gray-300 dark:text-(--admin-text-muted)" />
                                            <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Clique para selecionar uma imagem</span>
                                          </>
                                    }
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={e => {
                                            const file = e.target.files[0]
                                            if (!file) return
                                            const reader = new FileReader()
                                            reader.onload = ev => setForm(prev => ({ ...prev, image: ev.target.result }))
                                            reader.readAsDataURL(file)
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Nome *</label>
                                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="Nome do produto" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Categoria *</label>
                                <select value={form.categoria_id} onChange={e => setForm(prev => ({ ...prev, categoria_id: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all">
                                    <option value="">Selecione...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Preço *</label>
                                    <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                        placeholder="0,00" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Estoque</label>
                                    <input type="number" min="0" value={form.stock} onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                        placeholder="0" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Descrição</label>
                                <textarea value={form.descricao} onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all resize-none"
                                    placeholder="Descrição do produto" rows={3} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Status</label>
                                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all">
                                    <option>Ativo</option>
                                    <option>Inativo</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                                    {editing ? 'Salvar' : 'Criar produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(false)}/>}
        </main>
    )
}

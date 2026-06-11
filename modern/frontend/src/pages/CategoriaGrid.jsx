import { useState, useMemo, useEffect } from 'react'
import { imgUrl } from '../lib/cloudinaryUrl'
import { Link, useParams, Navigate } from 'react-router-dom'
import { LuSlidersHorizontal, LuArrowUpDown, LuChevronRight, LuTag } from 'react-icons/lu'
import { FaCartShopping } from 'react-icons/fa6'
import { getCategoryBySlug } from '../lib/api/categories'
import { slugIconMap } from '../lib/categoryIcons'

const ORDENAR = [
    { value: 'relevancia', label: 'Relevância' },
    { value: 'preco-asc',  label: 'Menor preço' },
    { value: 'preco-desc', label: 'Maior preço' },
]

function ProdutoCard({ produto }) {
    const { id, nome, preco, foto_url } = produto
    return (
        <Link
            to={`/produto/${id}`}
            className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
            <div className="relative bg-gray-100 h-52 flex items-center justify-center overflow-hidden">
                {foto_url ? (
                    <img src={imgUrl(foto_url, 400)} alt={nome} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaCartShopping className="text-gray-400 text-3xl" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 p-4 flex-1">
                <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-verde-escuro transition-colors line-clamp-2">
                    {nome}
                </h3>

                <div className="mt-auto">
                    <p className="text-xs text-gray-400">a partir de</p>
                    <p className="text-lg font-bold text-gray-900">
                        {Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>
        </Link>
    )
}

function SkeletonCard() {
    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="h-52 bg-gray-200" />
            <div className="p-4 flex flex-col gap-3">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
            </div>
        </div>
    )
}

export default function CategoriaGrid() {
    const { slug } = useParams()
    const [categoria, setCategoria] = useState(null)
    const [produtos, setProdutos] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [ordem, setOrdem] = useState('relevancia')
    const [filtroPor, setFiltroPor] = useState({ min: '', max: '' })
    const [showFiltros, setShowFiltros] = useState(false)

    useEffect(() => {
        setLoading(true)
        setNotFound(false)
        getCategoryBySlug(slug)
            .then(({ data }) => {
                setCategoria(data.data.categoria)
                setProdutos(data.data.produtos)
            })
            .catch(err => {
                if (err.response?.status === 404) setNotFound(true)
            })
            .finally(() => setLoading(false))
    }, [slug])

    const produtosFiltrados = useMemo(() => {
        let arr = [...produtos]
        const min = parseFloat(filtroPor.min)
        const max = parseFloat(filtroPor.max)
        if (!isNaN(min)) arr = arr.filter(p => Number(p.preco) >= min)
        if (!isNaN(max)) arr = arr.filter(p => Number(p.preco) <= max)
        switch (ordem) {
            case 'preco-asc':  return arr.sort((a, b) => a.preco - b.preco)
            case 'preco-desc': return arr.sort((a, b) => b.preco - a.preco)
            default:           return arr
        }
    }, [produtos, ordem, filtroPor])

    if (notFound) return <Navigate to="/produtos" replace />

    const Icon = slugIconMap[slug]

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-verde-escuro py-14 px-6">
                <div className="max-w-6xl mx-auto">
                    <p className="text-verde-claro/60 text-sm mb-3 flex items-center gap-1">
                        <Link to="/" className="hover:text-verde-claro transition-colors">Início</Link>
                        <LuChevronRight size={14} />
                        <Link to="/produtos" className="hover:text-verde-claro transition-colors">Produtos</Link>
                        <LuChevronRight size={14} />
                        <span className="text-verde-claro">{loading ? '...' : categoria?.nome}</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-verde-claro/10 text-verde-claro flex items-center justify-center text-2xl shrink-0">
                            {Icon ? <Icon size={28} /> : <LuTag size={28} />}
                        </div>
                        <div>
                            {loading ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-7 bg-white/20 rounded w-48" />
                                    <div className="h-4 bg-white/10 rounded w-64" />
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-white">{categoria?.nome}</h1>
                                    <p className="text-verde-claro/70 text-sm mt-0.5">{categoria?.descricao}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <p className="text-sm text-gray-500">
                        {loading ? (
                            <span className="inline-block h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        ) : (
                            <><span className="font-bold text-gray-800">{produtosFiltrados.length}</span> produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}</>
                        )}
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFiltros(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-colors cursor-pointer
                                ${showFiltros ? 'bg-verde-escuro text-white border-verde-escuro' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <LuSlidersHorizontal size={15} />
                            Filtros
                        </button>

                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                            <LuArrowUpDown size={15} className="text-gray-400 shrink-0" />
                            <select
                                value={ordem}
                                onChange={e => setOrdem(e.target.value)}
                                className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
                            >
                                {ORDENAR.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Painel de filtros */}
                {showFiltros && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex items-end gap-6 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço mínimo</label>
                            <input
                                type="number" min="0" placeholder="R$ 0"
                                value={filtroPor.min}
                                onChange={e => setFiltroPor(p => ({ ...p, min: e.target.value }))}
                                className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-verde-escuro w-36"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço máximo</label>
                            <input
                                type="number" min="0" placeholder="Sem limite"
                                value={filtroPor.max}
                                onChange={e => setFiltroPor(p => ({ ...p, max: e.target.value }))}
                                className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-verde-escuro w-36"
                            />
                        </div>
                        <button
                            onClick={() => setFiltroPor({ min: '', max: '' })}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : produtosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {produtosFiltrados.map(produto => (
                            <ProdutoCard key={produto.id} produto={produto} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <LuSlidersHorizontal size={24} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-700">Nenhum produto encontrado</p>
                            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de preço.</p>
                        </div>
                        <button
                            onClick={() => setFiltroPor({ min: '', max: '' })}
                            className="text-sm text-verde-escuro font-bold hover:underline cursor-pointer"
                        >
                            Limpar filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

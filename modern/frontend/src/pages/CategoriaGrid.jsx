import { useState, useMemo } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { IoIosStar } from 'react-icons/io'
import { LuSlidersHorizontal, LuArrowUpDown, LuChevronRight } from 'react-icons/lu'
import { FaCartShopping } from 'react-icons/fa6'
import { categoriasPorSlug, produtosPorCategoria } from '../data/produtos'

const ORDENAR = [
    { value: 'relevancia', label: 'Relevância' },
    { value: 'preco-asc',  label: 'Menor preço' },
    { value: 'preco-desc', label: 'Maior preço' },
    { value: 'rating',     label: 'Melhor avaliado' },
    { value: 'avaliacoes', label: 'Mais avaliados' },
]

function ProdutoCard({ produto }) {
    const { id, nome, preco, rating, avaliações, tag } = produto
    return (
        <Link
            to={`/produto/${id}`}
            className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
            {/* Image placeholder */}
            <div className="relative bg-gray-100 h-52 flex items-center justify-center">
                {tag && (
                    <span className="absolute top-3 left-3 bg-verde-escuro text-verde-claro text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {tag}
                    </span>
                )}
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaCartShopping className="text-gray-400 text-3xl" />
                </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 p-4 flex-1">
                <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-verde-escuro transition-colors line-clamp-2">
                    {nome}
                </h3>

                <div className="flex items-center gap-1 mt-auto">
                    <IoIosStar className="text-amber-400 text-sm" />
                    <span className="text-sm font-bold text-gray-700">{rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({avaliações})</span>
                </div>

                <div className="flex items-end justify-between mt-1">
                    <div>
                        <p className="text-xs text-gray-400">a partir de</p>
                        <p className="text-lg font-bold text-gray-900">
                            {preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <button
                        onClick={e => e.preventDefault()}
                        className="w-9 h-9 rounded-xl bg-verde-escuro text-verde-claro flex items-center justify-center hover:opacity-80 transition-opacity shrink-0"
                    >
                        <FaCartShopping size={15} />
                    </button>
                </div>
            </div>
        </Link>
    )
}

export default function CategoriaGrid() {
    const { slug } = useParams()
    const categoria = categoriasPorSlug[slug]

    if (!categoria) return <Navigate to="/produtos" replace />

    const Icon = categoria.icon
    const lista = produtosPorCategoria[slug] ?? []

    const [ordem, setOrdem] = useState('relevancia')
    const [filtroPor, setFiltroPor] = useState({ min: '', max: '' })
    const [showFiltros, setShowFiltros] = useState(false)

    const produtosFiltrados = useMemo(() => {
        let arr = [...lista]

        const min = parseFloat(filtroPor.min)
        const max = parseFloat(filtroPor.max)
        if (!isNaN(min)) arr = arr.filter(p => p.preco >= min)
        if (!isNaN(max)) arr = arr.filter(p => p.preco <= max)

        switch (ordem) {
            case 'preco-asc':  return arr.sort((a, b) => a.preco - b.preco)
            case 'preco-desc': return arr.sort((a, b) => b.preco - a.preco)
            case 'rating':     return arr.sort((a, b) => b.rating - a.rating)
            case 'avaliacoes': return arr.sort((a, b) => b.avaliações - a.avaliações)
            default:           return arr
        }
    }, [lista, ordem, filtroPor])

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
                        <span className="text-verde-claro">{categoria.label}</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-verde-claro/10 text-verde-claro flex items-center justify-center text-2xl shrink-0">
                            <Icon size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{categoria.label}</h1>
                            <p className="text-verde-claro/70 text-sm mt-0.5">{categoria.descricao}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                    <p className="text-sm text-gray-500">
                        <span className="font-bold text-gray-800">{produtosFiltrados.length}</span> produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
                    </p>

                    <div className="flex items-center gap-3">
                        {/* Filtro preço toggle */}
                        <button
                            onClick={() => setShowFiltros(v => !v)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-colors cursor-pointer
                                ${showFiltros ? 'bg-verde-escuro text-white border-verde-escuro' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <LuSlidersHorizontal size={15} />
                            Filtros
                        </button>

                        {/* Ordenação */}
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
                                type="number"
                                min="0"
                                placeholder="R$ 0"
                                value={filtroPor.min}
                                onChange={e => setFiltroPor(p => ({ ...p, min: e.target.value }))}
                                className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-verde-escuro w-36"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço máximo</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="Sem limite"
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
                {produtosFiltrados.length > 0 ? (
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

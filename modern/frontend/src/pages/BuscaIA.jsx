import { useState, useEffect, useRef } from "react"
import { imgUrl } from "../lib/cloudinaryUrl"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { getProducts } from "../lib/api/products"
import { searchProducts } from "../lib/IaAssistant"
import { Search } from "lucide-react"
import { FaCartShopping } from "react-icons/fa6"

function ProdutoCardSkeleton() {
    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="bg-gray-200 h-52" />
            <div className="flex flex-col gap-2 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
            </div>
        </div>
    )
}

function ProdutoCard({ produto }) {
    const { nome, preco, foto_url, slug } = produto
    return (
        <Link
            to={`/produto/${slug}`}
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

export default function BuscaIA() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const initialQuery = searchParams.get('q') ?? ''

    const [query, setQuery] = useState(initialQuery)
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [allProducts, setAllProducts] = useState(null)
    const inputRef = useRef(null)

    useEffect(() => {
        getProducts()
            .then(({ data }) => setAllProducts(data.products ?? data ?? []))
            .catch(() => setAllProducts([]))
    }, [])

    useEffect(() => {
        if (initialQuery) runSearch(initialQuery)
        else inputRef.current?.focus()
    }, [])

    async function runSearch(q) {
        if (!q.trim()) return
        setLoading(true)
        setSearched(true)
        setResults([])
        try {
            const catalog = allProducts ?? (await getProducts().then(({ data }) => data.products ?? data ?? []))
            const slugs = await searchProducts(q.trim(), catalog)
            const found = slugs
                .map(slug => catalog.find(p => p.slug === slug))
                .filter(Boolean)
            setResults(found)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        const q = query.trim()
        if (!q) return
        navigate(`/busca?q=${encodeURIComponent(q)}`, { replace: true })
        runSearch(q)
    }

    return (
        <main className="min-h-screen px-5 md:px-10 py-10 md:py-16">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Busca <span className="italic font-light">inteligente</span>
                </h1>
                <p className="text-gray-500 mb-8 text-sm">Descreva o que você procura em linguagem natural e a IA encontra os produtos certos.</p>

                <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
                    <div className="flex items-center gap-3 flex-1 border border-gray-200 rounded-full px-5 py-3 shadow-sm focus-within:border-verde-escuro transition-colors bg-white">
                        <Search size={18} className="text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ex: carrinho inteligente para supermercado grande..."
                            className="flex-1 text-sm outline-none bg-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-6 py-3 bg-verde-escuro text-white rounded-full text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </form>

                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => <ProdutoCardSkeleton key={i} />)}
                    </div>
                )}

                {!loading && searched && results.length === 0 && (
                    <div className="text-center py-16 flex flex-col items-center gap-3">
                        <Search size={40} className="text-gray-300" />
                        <p className="text-gray-500">Nenhum produto encontrado para <strong>"{initialQuery || query}"</strong>.</p>
                        <p className="text-sm text-gray-400">Tente termos diferentes ou <Link to="/produtos" className="underline text-verde-escuro">veja todos os produtos</Link>.</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        <p className="text-sm text-gray-500 mb-5">{results.length} produto(s) encontrado(s) para <strong>"{initialQuery || query}"</strong></p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {results.map(p => <ProdutoCard key={p.id} produto={p} />)}
                        </div>
                    </>
                )}

                {!searched && (
                    <div className="text-center py-16 text-gray-400">
                        <Search size={40} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Digite o que você procura acima e pressione buscar.</p>
                    </div>
                )}
            </div>
        </main>
    )
}

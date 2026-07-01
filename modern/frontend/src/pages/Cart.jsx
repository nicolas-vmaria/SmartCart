import { Link } from "react-router-dom"
import { imgUrl } from "../lib/cloudinaryUrl"
import Breadcrumb from "../components/Breadcrumb"
import { useState, useEffect, useCallback, memo } from "react"
import { ShoppingCart, Trash2, Loader2, X, Tag, Truck, AlertTriangle } from "lucide-react"
import { validateCoupon } from "../lib/api/coupons"
import { getCart, updateCartItem, removeCartItem, clearCart, addToCart } from "../lib/api/cart"
import { getProdutosDestaque } from "../lib/api/products"
import { suggestCartProducts } from "../lib/IaAssistant"
import ConfirmDialog from "../components/ConfirmDialog"
import { calcularFrete } from "../lib/frete"
import Toast from "../components/Toast"
import { useConfiguracoes } from "../hooks/useConfiguracoes"
import { getRateLimitMessage } from "../lib/rateLimitMessage"

const CART_CACHE_KEY = 'cart_cache'

const CartItem = memo(function CartItem({ item, onChangeQtd, onRemove, updating }) {
    const onMinus = useCallback(() => onChangeQtd(item, -1), [item, onChangeQtd])
    const onPlus  = useCallback(() => onChangeQtd(item, +1), [item, onChangeQtd])
    const desconto = Number(item.desconto_percentual) || 0
    const preco = Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const precoOriginal = Number(item.preco_original).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const subtotal = (Number(item.preco) * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <div className="flex flex-col sm:flex-row bg-gray-100 p-5 sm:p-8 rounded-2xl gap-4 sm:gap-6 items-start sm:items-center">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl border-2 border-gray-200 bg-white flex justify-center items-center shrink-0 overflow-hidden">
                {item.foto_url
                    ? <img src={imgUrl(item.foto_url, 300)} alt={item.produto_nome} loading="lazy" className="w-full h-full object-cover" />
                    : <ShoppingCart className="text-gray-300 text-4xl" size={40} />
                }
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-bold truncate">{item.produto_nome}</h1>
                    <p className="text-gray-500 text-sm">SKU: {item.produto_id}</p>
                    {desconto > 0 ? (
                        <div className="flex items-center gap-2">
                            <p className="text-verde-escuro font-semibold text-sm">{preco} un.</p>
                            <p className="text-gray-400 text-xs line-through">{precoOriginal}</p>
                            <span className="text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full">-{desconto}%</span>
                        </div>
                    ) : (
                        <p className="text-verde-escuro font-semibold text-sm">{preco} un.</p>
                    )}
                    {item.quantidade > item.estoque && (
                        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertTriangle size={12} /> Apenas {item.estoque} em estoque
                        </p>
                    )}
                </div>

                <p className="font-bold text-xl text-right shrink-0">{subtotal}</p>

                <div className="flex text-lg shrink-0">
                    <button
                        onClick={onMinus}
                        disabled={updating}
                        className="flex justify-center items-center bg-white w-9 h-9 border border-gray-200 rounded-l-xl border-r-0 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >-</button>
                    <div className="flex justify-center items-center bg-white w-9 h-9 border border-gray-200 font-medium">
                        {updating ? <Loader2 size={14} className="animate-spin text-gray-400" /> : item.quantidade}
                    </div>
                    <button
                        onClick={onPlus}
                        disabled={updating || item.quantidade >= item.estoque}
                        className="flex justify-center items-center bg-white w-9 h-9 border border-gray-200 rounded-r-xl border-l-0 cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >+</button>
                </div>

                <button onClick={onRemove} disabled={updating} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 shrink-0 disabled:opacity-40">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    )
})

function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingCart size={52} className="text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-verde-escuro flex items-center justify-center text-verde-claro text-xs font-bold">0</div>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Seu carrinho está vazio</h2>
                <p className="text-gray-400 mt-2 text-sm max-w-xs">Você ainda não adicionou nenhum produto. Explore nossa loja e encontre o SmartCart ideal para você.</p>
            </div>
            <div className="flex gap-3">
                <Link to="/produtos" className="bg-verde-escuro text-verde-claro px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">Ver produtos</Link>
                <Link to="/" className="border border-gray-200 text-gray-600 px-6 py-3 rounded-full font-bold text-sm hover:border-gray-400 transition-all">Voltar ao início</Link>
            </div>
        </div>
    )
}

export default function Cart() {
    const { config } = useConfiguracoes()
    const freteGratisMinimo = (() => {
        const raw = Number(config.frete_gratis_minimo)
        return isNaN(raw) ? 500 : raw
    })()

    const [items, setItems] = useState(() => {
        try { const c = localStorage.getItem(CART_CACHE_KEY); return c ? JSON.parse(c) : [] } catch { return [] }
    })
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponError, setCouponError] = useState('')
    const [validating, setValidating] = useState(false)
    const [toast, setToast] = useState(null)
    const [confirmClear, setConfirmClear] = useState(false)
    const [cepCalc, setCepCalc] = useState('')
    const [cepResult, setCepResult] = useState(null)
    const [loadingCep, setLoadingCep] = useState(false)
    const [cepError, setCepError] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [suggestionsLoading, setSuggestionsLoading] = useState(false)
    const [addingSuggestion, setAddingSuggestion] = useState(null)

    useEffect(() => {
        getCart()
            .then(res => {
                const carrinho = res.data.carrinho ?? []
                setItems(carrinho)
                localStorage.setItem(CART_CACHE_KEY, JSON.stringify(carrinho))
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (loading || items.length === 0) return
        setSuggestionsLoading(true)
        getProdutosDestaque()
            .then(async ({ data }) => {
                const products = data.products ?? []
                const slugs = await suggestCartProducts(items, products)
                const found = slugs.map(s => products.find(p => p.slug === s)).filter(Boolean)
                setSuggestions(found)
            })
            .catch(() => {})
            .finally(() => setSuggestionsLoading(false))
    }, [loading, items.length])

    const changeQtd = useCallback(async (item, delta) => {
        const novaQtd = item.quantidade + delta
        if (novaQtd < 1) return
        setUpdating(item.item_id)
        try {
            await updateCartItem(item.item_id, novaQtd)
            setItems(prev => {
                const next = prev.map(i => i.item_id === item.item_id ? { ...i, quantidade: novaQtd } : i)
                localStorage.setItem(CART_CACHE_KEY, JSON.stringify(next))
                return next
            })
            window.dispatchEvent(new CustomEvent('cart:updated'))
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao atualizar quantidade', type: 'error' })
        } finally {
            setUpdating(null)
        }
    }, [])

    const handleRemove = useCallback(async (item_id) => {
        setUpdating(item_id)
        try {
            await removeCartItem(item_id)
            setItems(prev => {
                const next = prev.filter(i => i.item_id !== item_id)
                localStorage.setItem(CART_CACHE_KEY, JSON.stringify(next))
                return next
            })
            window.dispatchEvent(new CustomEvent('cart:updated'))
        } catch {
            setToast({ message: 'Erro ao remover item', type: 'error' })
        } finally {
            setUpdating(null)
        }
    }, [])

    async function applyCoupon() {
        if (!couponCode.trim()) return
        setValidating(true)
        setCouponError('')
        try {
            const { data } = await validateCoupon(couponCode.trim())
            setAppliedCoupon(data.coupon)
        } catch (err) {
            setCouponError(getRateLimitMessage(err, 'Cupom inválido'))
            setAppliedCoupon(null)
        } finally {
            setValidating(false)
        }
    }

    function removeCoupon() {
        setAppliedCoupon(null)
        setCouponCode('')
        setCouponError('')
    }

    async function handleClearCart() {
        try {
            await clearCart()
            setItems([])
            localStorage.removeItem(CART_CACHE_KEY)
            window.dispatchEvent(new CustomEvent('cart:updated'))
        } catch {
            setToast({ message: 'Erro ao limpar carrinho', type: 'error' })
        }
    }

    async function buscarFrete() {
        const digits = cepCalc.replace(/\D/g, '')
        if (digits.length !== 8) { setCepError('CEP inválido'); return }
        setLoadingCep(true)
        setCepError('')
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
            const json = await res.json()
            if (json.erro) { setCepError('CEP não encontrado'); return }
            setCepResult({ cidade: json.localidade, uf: json.uf })
        } catch {
            setCepError('Erro ao consultar CEP')
        } finally {
            setLoadingCep(false)
        }
    }

    const hasStockIssue = items.some(i => i.quantidade > i.estoque)
    const subtotal = items.reduce((acc, i) => acc + Number(i.preco) * i.quantidade, 0)

    const faixas = config.desconto_ativo === '1'
        ? [1, 2, 3]
            .map(n => ({ minimo: Number(config[`desconto_faixa_${n}_minimo`]), pct: Number(config[`desconto_faixa_${n}_pct`]) }))
            .filter(f => f.minimo > 0 && f.pct > 0)
            .sort((a, b) => b.minimo - a.minimo)
        : []
    const faixaAtiva        = faixas.find(f => subtotal >= f.minimo) ?? null
    const descontoProgressivo = faixaAtiva ? subtotal * (faixaAtiva.pct / 100) : 0

    const discount = appliedCoupon
        ? appliedCoupon.tipo_desconto === 'percentual'
            ? subtotal * (parseFloat(appliedCoupon.desconto) / 100)
            : Math.min(parseFloat(appliedCoupon.desconto), subtotal)
        : 0
    const subtotalComDesconto = subtotal - discount - descontoProgressivo
    const frete = items.length === 0 ? 0
        : cepResult ? calcularFrete(cepResult.uf, subtotalComDesconto, freteGratisMinimo)
        : null
    const total = subtotalComDesconto + (frete ?? 0)

    return (
        <main className="min-h-screen w-full flex flex-col lg:flex-row justify-center gap-6 lg:gap-10 p-5 md:p-10 items-start">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {confirmClear && (
                <ConfirmDialog
                    title="Limpar carrinho"
                    message="Tem certeza que deseja remover todos os itens do carrinho?"
                    confirmLabel="Limpar"
                    onConfirm={() => { setConfirmClear(false); handleClearCart() }}
                    onCancel={() => setConfirmClear(false)}
                />
            )}

            <section className="flex flex-col w-full lg:flex-1">
                <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Carrinho' }]} />
                <div className="flex items-center justify-between py-5">
                    <h1 className="text-4xl font-bold">
                        Carrinho
                        {items.length > 0 && (
                            <span className="ml-3 text-xl font-normal text-gray-400">({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                        )}
                    </h1>
                    {items.length > 0 && !loading && (
                        <button onClick={() => setConfirmClear(true)}
                            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
                            <Trash2 size={14} /> Limpar carrinho
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex bg-gray-100 p-8 rounded-2xl gap-6 items-center">
                                <div className="w-36 h-36 rounded-2xl bg-gray-300 animate-pulse shrink-0" />
                                <div className="flex w-full items-center justify-between gap-4">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="h-5 bg-gray-300 animate-pulse rounded w-48" />
                                        <div className="h-3 bg-gray-200 animate-pulse rounded w-24" />
                                        <div className="h-3 bg-gray-200 animate-pulse rounded w-20" />
                                    </div>
                                    <div className="h-6 bg-gray-300 animate-pulse rounded w-28 shrink-0" />
                                    <div className="flex shrink-0">
                                        <div className="w-9 h-9 bg-gray-300 animate-pulse rounded-l-xl" />
                                        <div className="w-9 h-9 bg-gray-300 animate-pulse" />
                                        <div className="w-9 h-9 bg-gray-300 animate-pulse rounded-r-xl" />
                                    </div>
                                    <div className="w-6 h-6 bg-gray-300 animate-pulse rounded shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map(item => (
                            <CartItem
                                key={item.item_id}
                                item={item}
                                updating={updating === item.item_id}
                                onChangeQtd={changeQtd}
                                onRemove={() => handleRemove(item.item_id)}
                            />
                        ))}
                    </div>
                )}

                {(suggestionsLoading || suggestions.length > 0) && !loading && items.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Você também pode gostar</h3>
                        <div className="flex flex-col gap-3">
                            {suggestionsLoading ? (
                                Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="flex bg-gray-100 p-4 rounded-2xl gap-4 items-center animate-pulse">
                                        <div className="w-16 h-16 rounded-xl bg-gray-300 shrink-0" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="h-4 bg-gray-300 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        </div>
                                        <div className="h-9 w-24 bg-gray-300 rounded-full shrink-0" />
                                    </div>
                                ))
                            ) : suggestions.map(p => (
                                <div key={p.id} className="flex bg-gray-100 p-4 rounded-2xl gap-4 items-center">
                                    <Link to={`/produto/${p.slug}`} className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {p.foto_url
                                            ? <img src={imgUrl(p.foto_url, 150)} alt={p.nome} loading="lazy" className="w-full h-full object-cover" />
                                            : <ShoppingCart size={20} className="text-gray-300" />
                                        }
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/produto/${p.slug}`} className="font-medium text-gray-800 text-sm hover:text-verde-escuro transition-colors line-clamp-2 leading-snug">
                                            {p.nome}
                                        </Link>
                                        <p className="text-sm font-bold text-gray-700 mt-0.5">
                                            {Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </div>
                                    <button
                                        disabled={addingSuggestion === p.id}
                                        onClick={async () => {
                                            setAddingSuggestion(p.id)
                                            try {
                                                await addToCart(p.slug, p.id, 1)
                                                window.dispatchEvent(new Event('cart:updated'))
                                                const res = await getCart()
                                                const carrinho = res.data.carrinho ?? []
                                                setItems(carrinho)
                                                localStorage.setItem(CART_CACHE_KEY, JSON.stringify(carrinho))
                                                setSuggestions(prev => prev.filter(s => s.id !== p.id))
                                            } catch {
                                                setToast({ message: 'Erro ao adicionar produto', type: 'error' })
                                            } finally {
                                                setAddingSuggestion(null)
                                            }
                                        }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-verde-escuro text-white text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50 shrink-0"
                                    >
                                        {addingSuggestion === p.id
                                            ? <Loader2 size={12} className="animate-spin" />
                                            : <ShoppingCart size={12} />
                                        }
                                        Adicionar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {(loading || items.length > 0) && <section className="flex items-start w-full lg:w-80 lg:mt-20 shrink-0">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden w-full">

                    {/* Header */}
                    <div className="px-5 pt-5 pb-4">
                        <h2 className="text-lg font-bold text-gray-900">Resumo do pedido</h2>
                    </div>

                    {/* Descontos progressivos */}
                    {items.length > 0 && !loading && faixas.length > 0 && (() => {
                        const faixasAsc = [...faixas].sort((a, b) => a.minimo - b.minimo)
                        const proxima   = faixasAsc.find(f => subtotal < f.minimo)
                        return (
                            <div className="px-5 py-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Descontos progressivos</p>
                                <div className="flex flex-col gap-1.5">
                                    {faixasAsc.map(f => {
                                        const isAtiva = faixaAtiva?.minimo === f.minimo
                                        return (
                                            <div key={f.minimo} className="flex items-center gap-2 text-xs">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAtiva ? 'bg-green-500' : 'bg-gray-200'}`} />
                                                <span className={`flex-1 ${isAtiva ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                                                    Acima de {f.minimo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                                <span className={`font-medium ${isAtiva ? 'text-green-700' : 'text-gray-400'}`}>{f.pct}% off</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {proxima && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Adicione mais <span className="font-semibold text-gray-600">{(proxima.minimo - subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span> para {proxima.pct}% off
                                    </p>
                                )}
                            </div>
                        )
                    })()}

                    {/* Frete grátis */}
                    {items.length > 0 && !loading && freteGratisMinimo === 0 && (
                        <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2 text-green-600 text-xs font-medium">
                            <Truck size={12} /> Frete grátis em todas as compras!
                        </div>
                    )}
                    {items.length > 0 && !loading && freteGratisMinimo > 0 && subtotalComDesconto < freteGratisMinimo && (
                        <div className="px-5 py-4 border-t border-gray-100">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Frete grátis</span>
                                <span className="font-medium text-gray-700">{(freteGratisMinimo - subtotalComDesconto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} restantes</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(subtotalComDesconto / freteGratisMinimo * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Cupom */}
                    <div className="px-5 py-4 border-t border-gray-100">
                        {appliedCoupon ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                    <Tag size={13} />
                                    {appliedCoupon.codigo}
                                </div>
                                <button onClick={removeCoupon} className="text-green-400 hover:text-red-400 transition-colors cursor-pointer">
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                    placeholder="Código do cupom"
                                    className="border border-gray-200 rounded-xl flex-1 h-10 px-3 text-sm outline-none focus:border-verde-escuro transition-colors"
                                />
                                <button
                                    onClick={applyCoupon}
                                    disabled={validating || !couponCode.trim()}
                                    className="h-10 px-4 rounded-xl bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    {validating ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                                </button>
                            </div>
                        )}
                        {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
                    </div>

                    {/* Detalhamento de preços */}
                    <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium text-gray-900">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        {descontoProgressivo > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Desconto {faixaAtiva.pct}%</span>
                                <span className="text-green-600 font-medium">-{descontoProgressivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Cupom</span>
                                <span className="text-green-600 font-medium">-{discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Frete</span>
                            <span className={frete === 0 && items.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400 italic'}>
                                {items.length === 0 ? '—'
                                    : frete === null ? 'A calcular'
                                    : frete === 0 ? 'Grátis'
                                    : frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>

                    {/* Calculador de frete */}
                    <div className="px-5 py-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 mb-2.5">
                            <Truck size={12} /> Calcular frete
                        </p>
                        {cepResult ? (
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                                <div>
                                    <p className="text-xs text-gray-400">{cepResult.cidade} — {cepResult.uf}</p>
                                    <p className={`text-sm font-bold mt-0.5 ${frete === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                                        {frete === 0 ? 'Frete grátis' : frete?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <button onClick={() => { setCepResult(null); setCepCalc('') }} className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                    <X size={13} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={cepCalc}
                                        onChange={e => { setCepCalc(e.target.value); setCepError('') }}
                                        onKeyDown={e => e.key === 'Enter' && buscarFrete()}
                                        placeholder="00000-000"
                                        maxLength={9}
                                        className="border border-gray-200 rounded-xl flex-1 h-10 px-3 text-sm outline-none focus:border-verde-escuro transition-colors"
                                    />
                                    <button
                                        onClick={buscarFrete}
                                        disabled={loadingCep || cepCalc.replace(/\D/g, '').length < 8}
                                        className="h-10 px-4 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-all disabled:opacity-40 cursor-pointer"
                                    >
                                        {loadingCep ? <Loader2 size={14} className="animate-spin" /> : 'OK'}
                                    </button>
                                </div>
                                {cepError
                                    ? <p className="text-red-500 text-xs mt-1.5">{cepError}</p>
                                    : <p className="text-xs text-gray-400 mt-1.5">{freteGratisMinimo === 0 ? 'Frete grátis em todas as compras' : `Grátis acima de ${freteGratisMinimo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
                                }
                            </>
                        )}
                    </div>

                    {/* Total + CTA */}
                    <div className="px-5 pt-4 pb-5 border-t border-gray-100">
                        <div className="flex justify-between items-baseline mb-4">
                            <span className="text-base font-semibold text-gray-700">Total</span>
                            <span className="text-2xl font-bold text-gray-900">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        {hasStockIssue && (
                            <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mb-3 justify-center">
                                <AlertTriangle size={13} /> Ajuste as quantidades antes de continuar
                            </p>
                        )}
                        <Link
                            to="/checkout/1"
                            state={{
                                ...(cepResult ? { cep: cepCalc } : {}),
                                ...(appliedCoupon ? { coupon: appliedCoupon } : {}),
                            }}
                            className={`flex items-center justify-center bg-verde-escuro text-white h-12 w-full rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 font-bold text-sm
                                ${(items.length === 0 || hasStockIssue) ? 'opacity-40 pointer-events-none' : ''}`}
                        >
                            Finalizar compra
                        </Link>
                    </div>

                </div>
            </section>}
        </main>
    )
}

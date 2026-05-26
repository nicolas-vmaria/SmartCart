import { Link } from "react-router-dom"
import { useState, useEffect, useCallback, memo } from "react"
import { ShoppingCart, Trash2, Loader2, X, Tag, Truck, AlertTriangle } from "lucide-react"
import { validateCoupon } from "../lib/api/coupons"
import { getCart, updateCartItem, removeCartItem, clearCart } from "../lib/api/cart"
import ConfirmDialog from "../components/ConfirmDialog"
import { calcularFrete, FRETE_GRATIS_MINIMO } from "../lib/frete"
import Toast from "../components/Toast"

const CART_CACHE_KEY = 'cart_cache'

const CartItem = memo(function CartItem({ item, onChangeQtd, onRemove, updating }) {
    const onMinus = useCallback(() => onChangeQtd(item, -1), [item, onChangeQtd])
    const onPlus  = useCallback(() => onChangeQtd(item, +1), [item, onChangeQtd])
    const preco = Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const subtotal = (Number(item.preco) * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <div className="flex bg-gray-100 p-8 rounded-2xl gap-6 items-center">
            <div className="w-36 h-36 rounded-2xl border-2 border-gray-200 bg-white flex justify-center items-center shrink-0 overflow-hidden">
                {item.foto_url
                    ? <img src={item.foto_url} alt={item.produto_nome} className="w-full h-full object-contain p-2" />
                    : <ShoppingCart className="text-gray-300 text-4xl" size={40} />
                }
            </div>

            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <h1 className="text-xl font-bold truncate">{item.produto_nome}</h1>
                    <p className="text-gray-500 text-sm">SKU: {item.produto_id}</p>
                    <p className="text-verde-escuro font-semibold text-sm">{preco} un.</p>
                    {item.quantidade > item.estoque && (
                        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                            <AlertTriangle size={12} /> Apenas {item.estoque} em estoque
                        </p>
                    )}
                </div>

                <p className="font-bold text-xl w-36 text-right shrink-0">{subtotal}</p>

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
            setCouponError(err.response?.data?.error || 'Cupom inválido')
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
    const discount = appliedCoupon
        ? appliedCoupon.tipo_desconto === 'percentual'
            ? subtotal * (parseFloat(appliedCoupon.desconto) / 100)
            : Math.min(parseFloat(appliedCoupon.desconto), subtotal)
        : 0
    const subtotalComDesconto = subtotal - discount
    const frete = items.length === 0 ? 0
        : cepResult ? calcularFrete(cepResult.uf, subtotalComDesconto)
        : null
    const total = subtotalComDesconto + (frete ?? 0)

    return (
        <main className="min-h-screen w-full flex justify-center gap-20 p-10">
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

            <section className="flex flex-col w-[70%]">
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
            </section>

            <section className="flex items-start mt-20 w-[20%]">
                <div className="bg-gray-100 shadow-2xl p-5 rounded-2xl w-full">
                    <h1 className="text-2xl font-bold">Resumo do pedido</h1>

                    {appliedCoupon ? (
                        <div className="flex items-center justify-between mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                <Tag size={14} />
                                {appliedCoupon.codigo}
                            </div>
                            <button onClick={removeCoupon} className="text-green-500 hover:text-red-400 transition-colors cursor-pointer">
                                <X size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                placeholder="Código do cupom"
                                className="bg-white border border-gray-200 rounded-xl flex-1 h-10 px-3 text-sm outline-none focus:border-verde-escuro transition-colors"
                            />
                            <button
                                onClick={applyCoupon}
                                disabled={validating || !couponCode.trim()}
                                className="h-10 px-3 rounded-xl bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                {validating ? <Loader2 size={15} className="animate-spin" /> : 'Aplicar'}
                            </button>
                        </div>
                    )}
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}

                    <div className="flex flex-col gap-1 my-5">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold">Subtotal:</span>
                            <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="font-bold">Desconto:</span>
                                <span>- {discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="font-bold">Frete:</span>
                            <span className={frete === 0 && items.length > 0 ? 'text-green-600 font-bold' : 'text-gray-500 italic'}>
                                {items.length === 0 ? '—'
                                    : frete === null ? 'A calcular'
                                    : frete === 0 ? 'Grátis'
                                    : frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>

                    {/* Calculador de frete */}
                    <div className="border-t border-gray-200 pt-4 pb-2 flex flex-col gap-2">
                        <p className="text-sm font-bold flex items-center gap-1.5">
                            <Truck size={14} /> Calcular frete
                        </p>
                        {cepResult ? (
                            <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-400">{cepResult.cidade} — {cepResult.uf}</p>
                                    <p className={`text-sm font-bold ${frete === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                                        {frete === 0 ? 'Frete grátis' : frete?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <button onClick={() => { setCepResult(null); setCepCalc('') }} className="text-gray-300 hover:text-gray-500 transition-colors">
                                    <X size={14} />
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
                                        className="bg-white border border-gray-200 rounded-xl flex-1 h-10 px-3 text-sm outline-none focus:border-verde-escuro transition-colors"
                                    />
                                    <button
                                        onClick={buscarFrete}
                                        disabled={loadingCep || cepCalc.replace(/\D/g, '').length < 8}
                                        className="h-10 px-3 rounded-xl bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {loadingCep ? <Loader2 size={15} className="animate-spin" /> : 'OK'}
                                    </button>
                                </div>
                                {cepError
                                    ? <p className="text-red-500 text-xs">{cepError}</p>
                                    : <p className="text-xs text-gray-400">Frete grátis acima de R$ 500,00</p>
                                }
                            </>
                        )}
                    </div>

                    <hr />

                    <div className="flex justify-between my-5 font-bold text-lg">
                        <span>Total:</span>
                        <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>

                    {hasStockIssue && (
                        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium text-center justify-center">
                            <AlertTriangle size={13} /> Ajuste as quantidades antes de continuar
                        </p>
                    )}
                    <Link
                        to="/checkout/1"
                        state={{
                            ...(cepResult ? { cep: cepCalc } : {}),
                            ...(appliedCoupon ? { coupon: appliedCoupon } : {}),
                        }}
                        className={`flex items-center justify-center bg-verde-escuro text-white h-12 w-full rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 font-bold
                            ${(items.length === 0 || hasStockIssue) ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                        Finalizar compra
                    </Link>
                </div>
            </section>
        </main>
    )
}

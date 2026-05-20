import { Link } from "react-router-dom"
import { useState } from "react"
import { ShoppingCart, Trash2, Loader2, X, Tag } from "lucide-react"
import { FaCartShopping } from "react-icons/fa6"
import { validateCoupon } from "../lib/api/coupons"

const initialItems = [
    { id: 1, titulo: 'SmartCart Pro 100', sku: 'SC-100', preco: 2499.00 },
    { id: 2, titulo: 'Suporte para Smartphone', sku: 'ACC-HOLDER', preco: 149.00 },
]

function CartItem({ item, qtd, onMinus, onPlus, onRemove }) {
    return (
        <div className="flex bg-gray-100 p-8 rounded-2xl gap-6 items-center">
            <div className="w-36 h-36 rounded-2xl border-2 border-gray-200 bg-white flex justify-center items-center shrink-0">
                <FaCartShopping className="text-gray-300 text-4xl" />
            </div>

            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold">{item.titulo}</h1>
                    <p className="text-gray-500 text-sm">SKU: {item.sku}</p>
                </div>

                <p className="font-bold text-xl w-32 text-right">
                    {(item.preco * qtd).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>

                <div className="flex text-lg">
                    <button onClick={onMinus} className="flex justify-center items-center bg-white w-9 h-9 border border-gray-200 rounded-l-xl border-r-0 cursor-pointer hover:bg-gray-50 transition-colors">-</button>
                    <div className="flex justify-center items-center bg-white w-9 h-9 border border-gray-200 font-medium">{qtd}</div>
                    <button onClick={onPlus} className="flex justify-center items-center bg-white w-9 h-9 border border-gray-200 rounded-r-xl border-l-0 cursor-pointer hover:bg-gray-50 transition-colors">+</button>
                </div>

                <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    )
}

function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center">
                    <ShoppingCart size={52} className="text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-verde-escuro flex items-center justify-center text-verde-claro text-xs font-bold">
                    0
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800">Seu carrinho está vazio</h2>
                <p className="text-gray-400 mt-2 text-sm max-w-xs">
                    Você ainda não adicionou nenhum produto. Explore nossa loja e encontre o SmartCart ideal para você.
                </p>
            </div>

            <div className="flex gap-3">
                <Link
                    to="/produtos"
                    className="bg-verde-escuro text-verde-claro px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all"
                >
                    Ver produtos
                </Link>
                <Link
                    to="/"
                    className="border border-gray-200 text-gray-600 px-6 py-3 rounded-full font-bold text-sm hover:border-gray-400 transition-all"
                >
                    Voltar ao início
                </Link>
            </div>
        </div>
    )
}

export default function Cart() {
    const [items, setItems] = useState(initialItems)
    const [qtds, setQtds] = useState(() => Object.fromEntries(initialItems.map(i => [i.id, 1])))
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponError, setCouponError] = useState('')
    const [validating, setValidating] = useState(false)

    function changeQtd(id, delta) {
        setQtds(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }))
    }

    function removeItem(id) {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    async function applyСoupon() {
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

    const subtotal = items.reduce((acc, i) => acc + i.preco * (qtds[i.id] ?? 1), 0)
    const entrega = items.length > 0 ? 29.90 : 0

    const discount = appliedCoupon
        ? appliedCoupon.tipo_desconto === 'percentual'
            ? subtotal * (parseFloat(appliedCoupon.desconto) / 100)
            : Math.min(parseFloat(appliedCoupon.desconto), subtotal)
        : 0

    const total = subtotal - discount + entrega

    return (
        <main className="min-h-screen w-full flex justify-center gap-20 p-10">

            <section className="flex flex-col w-[70%]">
                <h1 className="text-4xl py-5 self-start font-bold">
                    Carrinho
                    {items.length > 0 && (
                        <span className="ml-3 text-xl font-normal text-gray-400">({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                    )}
                </h1>

                {items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map(item => (
                            <CartItem
                                key={item.id}
                                item={item}
                                qtd={qtds[item.id] ?? 1}
                                onMinus={() => changeQtd(item.id, -1)}
                                onPlus={() => changeQtd(item.id, +1)}
                                onRemove={() => removeItem(item.id)}
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
                            <button onClick={removeCoupon} className="text-green-500 hover:text-red-400 transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                                onKeyDown={e => e.key === 'Enter' && applyСoupon()}
                                placeholder="Código do cupom"
                                className="bg-white border border-gray-200 rounded-xl flex-1 h-10 px-3 text-sm outline-none focus:border-verde-escuro transition-colors"
                            />
                            <button
                                onClick={applyСoupon}
                                disabled={validating || !couponCode.trim()}
                                className="h-10 px-3 rounded-xl bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
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
                            <span className="font-bold">Taxa de entrega:</span>
                            <span>{entrega > 0 ? entrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</span>
                        </div>
                    </div>

                    <hr />

                    <div className="flex justify-between my-5 font-bold text-lg">
                        <span>Total:</span>
                        <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>

                    <Link
                        to="/checkout/1"
                        className={`flex items-center justify-center bg-verde-escuro text-white h-12 w-full rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:bg-verde-claro active:text-verde-escuro font-bold
                            ${items.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                        Finalizar compra
                    </Link>
                </div>
            </section>
        </main>
    )
}
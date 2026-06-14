import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Breadcrumb from "../components/Breadcrumb"
import { Package, ChevronRight, Clock, ShoppingBag } from "lucide-react"
import { FaPix } from "react-icons/fa6"
import { FaRegCreditCard } from "react-icons/fa"
import { getUserOrders, cancelOrder, getOrderById } from "../lib/api/orders"
import ConfirmDialog from "../components/ConfirmDialog"
import { formatDate } from "../lib/date"

const statusConfig = {
    aguardando: { label: 'Aguardando',  cls: 'bg-yellow-100 text-yellow-700' },
    pago:       { label: 'Pago',        cls: 'bg-blue-100 text-blue-700'     },
    enviado:    { label: 'Enviado',     cls: 'bg-indigo-100 text-indigo-700' },
    entregue:   { label: 'Entregue',    cls: 'bg-green-100 text-green-700'   },
    cancelado:  { label: 'Cancelado',   cls: 'bg-red-100 text-red-700'       },
}

const paymentIcon = {
    pix:            <FaPix className="text-teal-600" />,
    cartao_credito: <FaRegCreditCard className="text-blue-600" />,
}

const paymentLabel = {
    pix:            'PIX',
    cartao_credito: 'Cartão de Crédito',
}


function OrderSkeleton() {
    return (
        <div className="animate-pulse bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
            <div className="flex gap-4">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="h-5 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-100 rounded w-28" />
            </div>
        </div>
    )
}

export default function MeusPedidos() {
    const [pedidos, setPedidos] = useState([])
    const [loading, setLoading] = useState(true)
    const [cancelingId, setCancelingId] = useState(null)
    const [confirmCancelId, setConfirmCancelId] = useState(null)
    const [loadingDetailId, setLoadingDetailId] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        getUserOrders()
            .then(res => setPedidos(res.data.pedidos ?? []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    async function handleCancel(id) {
        setCancelingId(id)
        try {
            await cancelOrder(id)
            setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelado' } : p))
        } catch {}
        setCancelingId(null)
    }

    async function handleDetail(id) {
        setLoadingDetailId(id)
        try {
            const res = await getOrderById(id)
            navigate('/pedido/confirmado', { state: { pedido: res.data.pedido } })
        } catch {}
        setLoadingDetailId(null)
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Meus Pedidos' }]} />

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package size={22} /> Meus pedidos
                    </h1>
                    <Link to="/produtos"
                        className="flex items-center gap-1 text-sm text-verde-escuro font-bold hover:underline">
                        Continuar comprando <ChevronRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <OrderSkeleton key={i} />)
                ) : pedidos.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
                        <ShoppingBag size={40} className="text-gray-300" />
                        <p className="text-gray-500 font-bold">Você ainda não fez nenhum pedido.</p>
                        <Link to="/produtos"
                            className="mt-2 bg-verde-escuro text-verde-claro px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-all">
                            Explorar produtos
                        </Link>
                    </div>
                ) : (
                    pedidos.map(pedido => {
                        const status = statusConfig[pedido.status] ?? statusConfig.aguardando
                        const canCancel = ['aguardando', 'pago'].includes(pedido.status)
                        return (
                            <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-800 text-sm">
                                        Pedido #{String(pedido.id).padStart(5, '0')}
                                    </span>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.cls}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock size={11} /> {formatDate(pedido.created_at)}
                                    </span>
                                    <span>{pedido.qtd_itens} {Number(pedido.qtd_itens) === 1 ? 'item' : 'itens'}</span>
                                    <span className="flex items-center gap-1">
                                        {paymentIcon[pedido.metodo_pagamento]}
                                        {paymentLabel[pedido.metodo_pagamento] ?? pedido.metodo_pagamento}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="font-bold text-gray-800">{fmt(pedido.total)}</span>
                                    <div className="flex gap-2">
                                        {canCancel && (
                                            <button
                                                onClick={() => setConfirmCancelId(pedido.id)}
                                                disabled={cancelingId === pedido.id}
                                                className="text-xs text-red-500 font-bold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50">
                                                {cancelingId === pedido.id ? 'Cancelando...' : 'Cancelar'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDetail(pedido.id)}
                                            disabled={loadingDetailId === pedido.id}
                                            className="text-xs text-verde-escuro font-bold px-3 py-1.5 rounded-lg border border-verde-escuro/30 hover:bg-verde-escuro/5 transition-all disabled:opacity-50 flex items-center gap-1">
                                            {loadingDetailId === pedido.id
                                                ? 'Carregando...'
                                                : <>Ver detalhes <ChevronRight size={12} /></>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}

            </div>

            {confirmCancelId && (
                <ConfirmDialog
                    title="Cancelar pedido"
                    message={`Tem certeza que deseja cancelar o pedido #${String(confirmCancelId).padStart(5, '0')}?`}
                    confirmLabel="Cancelar pedido"
                    onConfirm={() => { handleCancel(confirmCancelId); setConfirmCancelId(null) }}
                    onCancel={() => setConfirmCancelId(null)}
                />
            )}
        </main>
    )
}

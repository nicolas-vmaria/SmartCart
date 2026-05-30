import { Link, useLocation, Navigate } from "react-router-dom"
import { CheckCircle, MapPin, CreditCard, Package, Clock, ChevronRight, ShoppingBag } from "lucide-react"
import { FaPix } from "react-icons/fa6"
import { FaRegCreditCard } from "react-icons/fa"

const paymentIcon = {
    pix:            <FaPix className="text-teal-600" />,
    cartao_credito: <FaRegCreditCard className="text-blue-600" />,
}

const paymentLabel = {
    pix:            'PIX',
    cartao_credito: 'Cartão de Crédito',
}

const statusTimeline = {
    aguardando: 1,
    pago:       2,
    enviado:    3,
    entregue:   4,
    cancelado:  0,
}

const timelineSteps = [
    { label: 'Pedido recebido', desc: 'Confirmamos o recebimento do seu pedido.' },
    { label: 'Pago',            desc: 'Pagamento confirmado.' },
    { label: 'Enviado',         desc: 'A transportadora retirou o pacote.' },
    { label: 'Entregue',        desc: 'Pedido entregue no endereço informado.' },
]

export default function OrderConfirmation() {
    const { state } = useLocation()

    if (!state?.pedido) return <Navigate to="/" replace />

    const { pedido } = state
    const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const doneUntil = statusTimeline[pedido.status] ?? 1

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-2xl mx-auto flex flex-col gap-6">

                {/* Sucesso */}
                <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-4 text-center shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-verde-escuro flex items-center justify-center shadow-lg">
                        <CheckCircle className="text-verde-claro" size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Pedido confirmado!</h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            Obrigado pela sua compra. Acompanhe o status abaixo.
                        </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 flex items-center gap-3">
                        <span className="text-sm text-gray-400">Número do pedido</span>
                        <span className="font-bold text-verde-escuro text-lg">#{String(pedido.id).padStart(5, '0')}</span>
                    </div>
                </div>

                {/* Itens */}
                {pedido.itens?.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingBag size={16} /> Itens do pedido
                        </h2>
                        {pedido.itens.map(item => (
                            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.foto_url
                                        ? <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
                                        : <Package size={18} className="text-gray-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-800 truncate">{item.nome}</p>
                                    <p className="text-xs text-gray-400">Qtd: {item.quantidade} · {fmt(item.preco_unitario_historico)} cada</p>
                                </div>
                                <p className="font-bold text-sm shrink-0">{fmt(item.subtotal)}</p>
                            </div>
                        ))}

                        <div className="flex flex-col gap-2 text-sm pt-2 border-t border-gray-100">
                            <div className="flex justify-between font-bold text-gray-800 text-base">
                                <span>Total</span>
                                <span>{fmt(pedido.total)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Entrega e pagamento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <MapPin size={15} className="text-verde-escuro" /> Endereço de entrega
                        </h3>
                        <div className="text-sm text-gray-500 leading-relaxed">
                            <p>{pedido.rua}, {pedido.numero}</p>
                            {pedido.complemento && <p>{pedido.complemento}</p>}
                            <p>{pedido.bairro}</p>
                            <p>{pedido.cidade} — {pedido.estado}</p>
                            <p>CEP: {pedido.cep}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <CreditCard size={15} className="text-verde-escuro" /> Pagamento
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-xl">{paymentIcon[pedido.metodo_pagamento] ?? paymentIcon.pix}</span>
                            <span className="font-medium">{paymentLabel[pedido.metodo_pagamento] ?? pedido.metodo_pagamento}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
                            <Clock size={12} />
                            Pagamento confirmado
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <Package size={16} /> Acompanhamento
                    </h2>
                    <div className="flex flex-col gap-0">
                        {timelineSteps.map(({ label, desc }, i) => {
                            const done = i < doneUntil
                            return (
                                <div key={label} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10
                                            ${done ? 'bg-verde-escuro' : 'bg-gray-100 border-2 border-gray-200'}`}>
                                            {done
                                                ? <CheckCircle size={16} className="text-verde-claro" />
                                                : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                            }
                                        </div>
                                        {i < timelineSteps.length - 1 && (
                                            <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-verde-escuro/30' : 'bg-gray-100'}`} style={{ minHeight: 32 }} />
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <p className={`font-bold text-sm ${done ? 'text-verde-escuro' : 'text-gray-400'}`}>{label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                    <Link to="/meus-pedidos"
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-full font-bold text-sm hover:border-gray-400 transition-all">
                        Meus pedidos
                    </Link>
                    <Link to="/produtos"
                        className="flex-1 flex items-center justify-center gap-2 bg-verde-escuro text-verde-claro py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">
                        Continuar comprando <ChevronRight size={16} />
                    </Link>
                </div>

            </div>
        </main>
    )
}

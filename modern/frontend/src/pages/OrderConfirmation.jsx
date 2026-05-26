import { Link, useLocation, Navigate } from "react-router-dom"
import { CheckCircle, MapPin, CreditCard, Package, Clock, ChevronRight, ShoppingBag } from "lucide-react"
import { FaPix } from "react-icons/fa6"
import { FaRegCreditCard, FaBarcode } from "react-icons/fa"

const paymentIcon = {
    pix:    <FaPix className="text-teal-600" />,
    cartao: <FaRegCreditCard className="text-blue-600" />,
    boleto: <FaBarcode className="text-gray-600" />,
}

const paymentLabel = {
    pix:    'PIX',
    cartao: 'Cartão de Crédito',
    boleto: 'Boleto Bancário',
}

const timeline = [
    { label: 'Pedido recebido',   desc: 'Confirmamos o recebimento do seu pedido.',        done: true  },
    { label: 'Em preparação',     desc: 'Seu pedido está sendo separado no estoque.',       done: false },
    { label: 'Enviado',           desc: 'A transportadora retirou o pacote.',               done: false },
    { label: 'Entregue',          desc: 'Pedido entregue no endereço informado.',           done: false },
]

export default function OrderConfirmation() {
    const { state } = useLocation()

    if (!state?.pedidoId) return <Navigate to="/" replace />

    const { pedidoId, delivery, paymentMethod, total } = state

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
                            Obrigado pela sua compra. Você receberá um e-mail de confirmação em breve.
                        </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 flex items-center gap-2">
                        <span className="text-sm text-gray-400">Número do pedido</span>
                        <span className="font-bold text-verde-escuro text-lg">{pedidoId}</span>
                    </div>
                </div>

                {/* Resumo do pedido */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag size={16} /> Resumo do pedido
                    </h2>

                    <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={20} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm text-gray-800">SmartCart Pro 100</p>
                            <p className="text-xs text-gray-400">SKU: SC-100 · Qtd: 1</p>
                        </div>
                        <p className="font-bold text-sm">R$ 2.499,00</p>
                    </div>

                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span><span>R$ 2.499,00</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Entrega</span><span>R$ 29,90</span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100 mt-1">
                            <span>Total</span>
                            <span>{total ?? 'R$ 2.528,90'}</span>
                        </div>
                    </div>
                </div>

                {/* Entrega e pagamento */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <MapPin size={15} className="text-verde-escuro" /> Endereço de entrega
                        </h3>
                        {delivery ? (
                            <div className="text-sm text-gray-500 leading-relaxed">
                                <p className="font-medium text-gray-700">{delivery.nome}</p>
                                <p>{delivery.endereco}, {delivery.numero}</p>
                                {delivery.complemento && <p>{delivery.complemento}</p>}
                                <p>{delivery.cidade} — {delivery.estado}</p>
                                <p>CEP: {delivery.cep}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Endereço não informado.</p>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                            <CreditCard size={15} className="text-verde-escuro" /> Pagamento
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-xl">{paymentIcon[paymentMethod] ?? paymentIcon.pix}</span>
                            <span className="font-medium">{paymentLabel[paymentMethod] ?? 'PIX'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
                            <Clock size={12} />
                            {paymentMethod === 'boleto'
                                ? 'Confirmação em até 2 dias úteis'
                                : 'Pagamento confirmado'}
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <Package size={16} /> Acompanhamento
                    </h2>
                    <div className="flex flex-col gap-0">
                        {timeline.map(({ label, desc, done }, i) => (
                            <div key={label} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10
                                        ${done ? 'bg-verde-escuro' : 'bg-gray-100 border-2 border-gray-200'}`}>
                                        {done
                                            ? <CheckCircle size={16} className="text-verde-claro" />
                                            : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                                        }
                                    </div>
                                    {i < timeline.length - 1 && (
                                        <div className={`w-0.5 flex-1 my-1 ${done ? 'bg-verde-escuro/30' : 'bg-gray-100'}`} style={{ minHeight: 32 }} />
                                    )}
                                </div>
                                <div className="pb-6">
                                    <p className={`font-bold text-sm ${done ? 'text-verde-escuro' : 'text-gray-400'}`}>{label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                    <Link to="/produtos"
                        className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-full font-bold text-sm hover:border-gray-400 transition-all">
                        Continuar comprando
                    </Link>
                    <Link to="/"
                        className="flex-1 flex items-center justify-center gap-2 bg-verde-escuro text-verde-claro py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">
                        Ir ao início <ChevronRight size={16} />
                    </Link>
                </div>

            </div>
        </main>
    )
}

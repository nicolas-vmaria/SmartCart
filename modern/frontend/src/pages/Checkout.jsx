import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaTruck, FaCreditCard, FaCheckCircle } from "react-icons/fa"
import { FaPix } from "react-icons/fa6"
import { MdOutlineReceipt } from "react-icons/md"
import { FiChevronRight, FiChevronLeft } from "react-icons/fi"

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function StepIndicator({ step }) {
    const steps = [
        { label: 'Entrega', icon: <FaTruck /> },
        { label: 'Pagamento', icon: <FaCreditCard /> },
        { label: 'Confirmação', icon: <FaCheckCircle /> },
    ]

    return (
        <div className="flex items-center mb-10">
            {steps.map(({ label, icon }, i) => {
                const num = i + 1
                const done = step > num
                const active = step === num
                return (
                    <div key={label} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all duration-300
                                ${done ? 'bg-verde-escuro text-verde-claro' : active ? 'bg-verde-escuro text-verde-claro ring-4 ring-verde-escuro/20' : 'bg-gray-100 text-gray-400'}`}>
                                {done ? <FaCheckCircle /> : icon}
                            </div>
                            <span className={`text-xs font-bold ${active || done ? 'text-verde-escuro' : 'text-gray-400'}`}>{label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-3 mb-5 transition-all duration-500 ${step > num ? 'bg-verde-escuro' : 'bg-gray-200'}`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-gray-600">{label}</label>
            {children}
        </div>
    )
}

const inputCls = "border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-verde-escuro transition-colors"

function DeliveryStep({ data, onChange }) {

    const findCep = async (e) => {
        const res = await fetch(`https://viacep.com.br/ws/${e}/json/`)
        const data = await res.json()

        if(!data.erro){
            onChange('endereco', data.logradouro)
            onChange('cidade', data.localidade)
            onChange('estado', data.uf)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-2xl font-bold">Endereço de Entrega</h2>
                <p className="text-gray-400 text-sm mt-1">Preencha os dados para envio do seu pedido.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Nome completo">
                    <input className={inputCls} placeholder="Seu nome" value={data.nome} onChange={e => onChange('nome', e.target.value)} />
                </Field>
                <Field label="E-mail">
                    <input className={inputCls} type="email" placeholder="seu@email.com" value={data.email} onChange={e => onChange('email', e.target.value)} />
                </Field>
                <Field label="Telefone">
                    <input className={inputCls} placeholder="(11) 99999-9999" value={data.telefone} onChange={e => onChange('telefone', e.target.value)} />
                </Field>
                <Field label="CEP">
                    <input className={inputCls} placeholder="00000-000" maxLength={9} value={data.cep} onChange={e => { onChange('cep', e.target.value); if (e.target.value.replace(/\D/g, '').length === 8) findCep(e.target.value) }} />
                </Field>
                <Field label="Endereço">
                    <input className={`${inputCls} col-span-2`} placeholder="Rua, Avenida..." value={data.endereco} onChange={e => onChange('endereco', e.target.value)} />
                </Field>
                <div />
                <Field label="Número">
                    <input className={inputCls} placeholder="123" value={data.numero} onChange={e => onChange('numero', e.target.value)} />
                </Field>
                <Field label="Complemento">
                    <input className={inputCls} placeholder="Apto, sala... (opcional)" value={data.complemento} onChange={e => onChange('complemento', e.target.value)} />
                </Field>
                <Field label="Cidade">
                    <input className={inputCls} placeholder="São Paulo" value={data.cidade} onChange={e => onChange('cidade', e.target.value)} />
                </Field>
                <Field label="Estado">
                    <select className={`${inputCls} bg-white`} value={data.estado} onChange={e => onChange('estado', e.target.value)}>
                        <option value="">Selecione...</option>
                        {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                </Field>
            </div>
        </div>
    )
}

function PaymentStep({ method, setMethod, cardData, onCardChange }) {
    const options = [
        { id: 'pix', label: 'PIX', icon: <FaPix className="text-2xl" /> },
        { id: 'cartao', label: 'Cartão de Crédito', icon: <FaCreditCard className="text-2xl" /> },
        { id: 'boleto', label: 'Boleto', icon: <MdOutlineReceipt className="text-2xl" /> },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold">Forma de Pagamento</h2>
                <p className="text-gray-400 text-sm mt-1">Escolha como deseja pagar.</p>
            </div>

            <div className="flex gap-3">
                {options.map(({ id, label, icon }) => (
                    <button key={id} onClick={() => setMethod(id)}
                        className={`flex-1 flex flex-col items-center gap-2 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                            ${method === id ? 'border-verde-escuro bg-verde-escuro/5 text-verde-escuro' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                        {icon}
                        <span className="text-sm font-bold">{label}</span>
                    </button>
                ))}
            </div>

            {method === 'pix' && (
                <div className="flex flex-col items-center gap-4 py-4 animate-fade-in">
                    <div className="w-44 h-44 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400">
                        <FaPix className="text-3xl" />
                        <span className="text-xs">QR Code PIX</span>
                    </div>
                    <p className="text-gray-500 text-center text-sm max-w-xs">Escaneie com o app do seu banco. Pagamento confirmado na hora.</p>
                    <div className="bg-gray-100 rounded-xl p-3 w-full text-center text-xs font-mono text-gray-500 break-all select-all">
                        00020126330014br.gov.bcb.pix0111094258599220204000053039865802BR5920SmartCart6009SAO PAULO62140510SC0000000016304ABCD
                    </div>
                    <button className="text-sm text-verde-escuro font-bold border border-verde-escuro px-4 py-2 rounded-full hover:bg-verde-escuro hover:text-white transition-all">
                        Copiar código PIX
                    </button>
                </div>
            )}

            {method === 'cartao' && (
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Número do cartão">
                        <input className={`${inputCls} font-mono col-span-2`} placeholder="0000 0000 0000 0000" maxLength={19}
                            value={cardData.numero} onChange={e => onCardChange('numero', e.target.value)} />
                    </Field>
                    <div />
                    <Field label="Nome no cartão">
                        <input className={inputCls} placeholder="NOME SOBRENOME"
                            value={cardData.nome} onChange={e => onCardChange('nome', e.target.value.toUpperCase())} />
                    </Field>
                    <div />
                    <Field label="Validade">
                        <input className={`${inputCls} font-mono`} placeholder="MM/AA" maxLength={5}
                            value={cardData.validade} onChange={e => onCardChange('validade', e.target.value)} />
                    </Field>
                    <Field label="CVV">
                        <input className={`${inputCls} font-mono`} placeholder="000" maxLength={4}
                            value={cardData.cvv} onChange={e => onCardChange('cvv', e.target.value)} />
                    </Field>
                    <Field label="Parcelamento">
                        <select className={`${inputCls} bg-white col-span-2`} value={cardData.parcelas} onChange={e => onCardChange('parcelas', e.target.value)}>
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                                <option key={n} value={n}>
                                    {n}x de R$ {(520 / n).toFixed(2).replace('.', ',')} {n === 1 ? '— à vista' : '— sem juros'}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>
            )}

            {method === 'boleto' && (
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-full h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-12 px-4">
                            {Array.from({ length: 60 }).map((_, i) => (
                                <div key={i} className="bg-gray-700 w-0.5" style={{ height: `${Math.random() * 100}%` }} />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-500 text-center text-sm">
                        O boleto vence em <strong>3 dias úteis</strong>. Após o pagamento, a confirmação pode levar até 2 dias.
                    </p>
                    <button className="border-2 border-verde-escuro text-verde-escuro rounded-full px-6 py-2 text-sm font-bold transition-all hover:bg-verde-escuro hover:text-white">
                        Copiar código do boleto
                    </button>
                </div>
            )}
        </div>
    )
}

function ConfirmationStep() {
    return (
        <div className="flex flex-col items-center gap-6 py-8">
            <div className="w-24 h-24 bg-verde-escuro rounded-full flex items-center justify-center shadow-lg">
                <FaCheckCircle className="text-5xl text-verde-claro" />
            </div>
            <div className="text-center">
                <h2 className="text-3xl font-bold text-verde-escuro">Pedido realizado!</h2>
                <p className="text-gray-500 mt-2">Seu pedido foi confirmado e está sendo processado.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Número do pedido</span>
                    <span className="font-bold">#SC-00042</span>
                </div>
                <hr />
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Previsão de entrega</span>
                    <span className="font-bold">5 a 10 dias úteis</span>
                </div>
                <hr />
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Confirmação por e-mail</span>
                    <span className="font-bold text-verde-escuro">Enviada ✓</span>
                </div>
            </div>
            <Link to="/" className="mt-2 bg-verde-escuro text-white px-10 py-3 rounded-full transition-all hover:bg-verde-claro hover:text-verde-escuro font-bold">
                Voltar ao início
            </Link>
        </div>
    )
}

function OrderSummary() {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full flex flex-col gap-4 sticky top-28">
            <h2 className="text-xl font-bold">Resumo do pedido</h2>

            <div className="flex items-center gap-3 py-3 border-b border-gray-200">
                <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-xs text-gray-400 font-bold shrink-0">IMG</div>
                <div className="flex-1">
                    <p className="font-bold text-sm">SmartCart Pro</p>
                    <p className="text-xs text-gray-400">SKU: 039232 · Qtd: 1</p>
                </div>
                <p className="font-bold text-sm">R$ 940,99</p>
            </div>

            <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>R$ 940,99</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Desconto</span>
                    <span className="text-green-600">− R$ 20,00</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Taxa de entrega</span>
                    <span className="text-green-600">Grátis</span>
                </div>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ 920,99</span>
            </div>
        </div>
    )
}

export default function Checkout() {
    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState('pix')
    const navigate = useNavigate()

    const [delivery, setDelivery] = useState({
        nome: '', email: '', telefone: '', cep: '',
        endereco: '', numero: '', complemento: '', cidade: '', estado: ''
    })

    const [cardData, setCardData] = useState({
        numero: '', nome: '', validade: '', cvv: '', parcelas: '1'
    })

    const handleDeliveryChange = (field, value) => setDelivery(prev => ({ ...prev, [field]: value }))
    const handleCardChange = (field, value) => setCardData(prev => ({ ...prev, [field]: value }))

    const pedidoId = `#SC-${String(Math.floor(10000 + Math.random() * 90000))}`

    const next = () => {
        if (step === 2) {
            navigate('/pedido/confirmado', {
                state: { pedidoId, delivery, paymentMethod, total: 'R$ 2.528,90' }
            })
            return
        }
        setStep(s => s + 1)
    }
    const back = () => setStep(s => Math.max(s - 1, 1))

    return (
        <main className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-5xl mx-auto flex gap-10 items-start">

                <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <StepIndicator step={step} />

                    {step === 1 && <DeliveryStep data={delivery} onChange={handleDeliveryChange} />}
                    {step === 2 && <PaymentStep method={paymentMethod} setMethod={setPaymentMethod} cardData={cardData} onCardChange={handleCardChange} />}
                    {step === 3 && <ConfirmationStep />}

                    {step < 3 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            {step > 1 ? (
                                <button onClick={back}
                                    className="flex items-center gap-2 text-gray-500 border border-gray-200 px-6 py-3 rounded-full hover:border-gray-400 transition-all cursor-pointer">
                                    <FiChevronLeft /> Voltar
                                </button>
                            ) : (
                                <Link to="/carrinho" className="flex items-center gap-2 text-gray-500 border border-gray-200 px-6 py-3 rounded-full hover:border-gray-400 transition-all">
                                    <FiChevronLeft /> Carrinho
                                </Link>
                            )}

                            <button onClick={next}
                                className="flex items-center gap-2 bg-verde-escuro text-white px-8 py-3 rounded-full transition-all hover:bg-verde-claro hover:text-verde-escuro font-bold cursor-pointer">
                                {step === 2 ? 'Finalizar pedido' : 'Continuar'} <FiChevronRight />
                            </button>
                        </div>
                    )}
                </section>

                <aside className="w-80 shrink-0">
                    <OrderSummary />
                </aside>

            </div>
        </main>
    )
}

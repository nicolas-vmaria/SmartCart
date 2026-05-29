import { useState, useEffect, useMemo } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FaTruck, FaCreditCard, FaCheckCircle } from "react-icons/fa"
import { FaPix } from "react-icons/fa6"
import { FiChevronRight, FiChevronLeft } from "react-icons/fi"
import { Package, Copy, Check, Tag, Loader2, X } from "lucide-react"
import { QRCode } from "react-qr-code"
import { getCart } from "../lib/api/cart"
import { createOrder } from "../lib/api/orders"
import { gerarPixPayload } from "../lib/pix"
import { calcularFrete, FRETE_GRATIS_MINIMO } from "../lib/frete"
import { validateCoupon } from "../lib/api/coupons"
import { siVisa, siMastercard, siAmericanexpress, siDiscover } from 'simple-icons'
import Toast from "../components/Toast"
import { getProfile } from "../lib/api/profile"

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
    const [loadingCep, setLoadingCep] = useState(false)
    const [cepErro, setCepErro]       = useState(false)

    function clearAddress() {
        onChange('endereco', '')
        onChange('bairro',   '')
        onChange('cidade',   '')
        onChange('estado',   '')
    }

    const findCep = async (cep) => {
        setLoadingCep(true)
        setCepErro(false)
        try {
            const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
            const json = await res.json()
            if (!json.erro) {
                onChange('endereco', json.logradouro)
                onChange('bairro',   json.bairro)
                onChange('cidade',   json.localidade)
                onChange('estado',   json.uf)
            } else {
                setCepErro(true)
            }
        } catch {
            setCepErro(true)
        } finally {
            setLoadingCep(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h2 className="text-2xl font-bold">Endereço de Entrega</h2>
                <p className="text-gray-400 text-sm mt-1">Preencha os dados para envio do seu pedido.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CEP">
                    <div className="relative">
                        <input
                            className={`${inputCls} w-full ${cepErro ? 'border-red-400 focus:border-red-400' : ''}`}
                            placeholder="00000-000"
                            maxLength={9}
                            value={data.cep}
                            onChange={e => {
                                const val = e.target.value
                                onChange('cep', val)
                                setCepErro(false)
                                clearAddress()
                                if (val.replace(/\D/g, '').length === 8) findCep(val)
                            }}
                        />
                        {loadingCep && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-verde-escuro border-t-transparent rounded-full animate-spin" />}
                    </div>
                    {cepErro && <p className="text-red-500 text-xs mt-1">CEP não encontrado. Verifique e tente novamente.</p>}
                </Field>
                <Field label="Endereço (rua)">
                    <input className={inputCls} placeholder="Rua, Avenida..." value={data.endereco} onChange={e => onChange('endereco', e.target.value)} />
                </Field>
                <Field label="Número">
                    <input className={inputCls} placeholder="123" value={data.numero} onChange={e => onChange('numero', e.target.value)} />
                </Field>
                <Field label="Complemento">
                    <input className={inputCls} placeholder="Apto, sala... (opcional)" value={data.complemento} onChange={e => onChange('complemento', e.target.value)} />
                </Field>
                <Field label="Bairro">
                    <input className={inputCls} placeholder="Bairro" value={data.bairro} onChange={e => onChange('bairro', e.target.value)} />
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

function luhn(num) {
    const digits = num.replace(/\D/g, '')
    let sum = 0, odd = true
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i])
        if (!odd) { n *= 2; if (n > 9) n -= 9 }
        sum += n; odd = !odd
    }
    return digits.length >= 13 && sum % 10 === 0
}

function maskCard(v)   { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
function maskExpiry(v) { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d }

function detectBrand(num) {
    const n = num.replace(/\D/g, '')
    if (/^4/.test(n))                                              return 'visa'
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]))/.test(n))             return 'mastercard'
    if (/^3[47]/.test(n))                                          return 'amex'
    if (/^(401178|401179|438935|457631|457632|4576321|431274|451416|457393|504175|506699|506770|506778|509000|509999|650031|650033|650035|650036|650038|650039|650050|650627|650901|650999|655000|655004|6550|6362|6363|6277|50670|50671|50672|50673|50674|50675|50676|50677|50900|50920|50930|50940|50950|50960|50970|50980|50990|51040|51050|51060|51070|51080|51090|51100|51110|51120|51130|51140|51150|51160|51170|51180|51190|51200|4011|4312|4389|4514|4576|5041|5066|5067|509)/.test(n)) return 'elo'
    if (/^(6062|637095|637612|637599)/.test(n))                   return 'hipercard'
    if (/^(6011|64[4-9]|65)/.test(n))                             return 'discover'
    return null
}

const SI = ({ icon, size = 28 }) => (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
)

const MastercardLogo = () => (
    <svg width="50" height="32" viewBox="0 0 50 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <clipPath id="mc-right">
                <circle cx="31" cy="16" r="13"/>
            </clipPath>
        </defs>
        <circle cx="19" cy="16" r="13" fill="#EB001B"/>
        <circle cx="31" cy="16" r="13" fill="#F79E1B"/>
        <circle cx="19" cy="16" r="13" fill="#FF5F00" clipPath="url(#mc-right)"/>
    </svg>
)

const brandIcon = {
    visa:       <SI icon={siVisa} size={44} />,
    mastercard: <MastercardLogo />,
    amex:       <SI icon={siAmericanexpress} size={32} />,
    discover:   <SI icon={siDiscover} size={32} />,
    elo:        <span className="text-sm font-black px-2 py-0.5 rounded bg-yellow-400 text-black leading-none tracking-wide">ELO</span>,
    hipercard:  <span className="text-sm font-black px-2 py-0.5 rounded bg-red-600 text-white leading-none">Hiper</span>,
}

function PaymentStep({ method, setMethod, cardData, onCardChange, cardErrors, coupon, couponCode, setCouponCode, onApplyCoupon, onRemoveCoupon, couponError, validatingCoupon }) {
    const options = [
        { id: 'pix',            label: 'PIX',              icon: <FaPix className="text-2xl" /> },
        { id: 'cartao_credito', label: 'Cartão de Crédito', icon: <FaCreditCard className="text-2xl" /> },
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
                <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-2xl p-4 text-sm text-teal-800">
                    <FaPix className="text-xl shrink-0 mt-0.5 text-teal-600" />
                    <span>Ao finalizar, você receberá o <strong>QR Code PIX</strong> com o valor exato do pedido para escanear com o app do seu banco.</span>
                </div>
            )}

            {method === 'cartao_credito' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Field label="Número do cartão">
                            <div className="relative">
                                <input className={`${inputCls} font-mono pr-12 w-full ${cardErrors?.numero ? 'border-red-400' : ''}`}
                                    placeholder="0000 0000 0000 0000" maxLength={19}
                                    value={cardData.numero}
                                    onChange={e => onCardChange('numero', maskCard(e.target.value))} />
                                {brandIcon[detectBrand(cardData.numero)] && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                        {brandIcon[detectBrand(cardData.numero)]}
                                    </span>
                                )}
                            </div>
                            {cardErrors?.numero && <p className="text-xs text-red-500 mt-1">{cardErrors.numero}</p>}
                        </Field>
                    </div>
                    <div className="col-span-2">
                        <Field label="Nome no cartão">
                            <input className={`${inputCls} ${cardErrors?.nome ? 'border-red-400' : ''}`}
                                placeholder="NOME SOBRENOME"
                                value={cardData.nome}
                                onChange={e => onCardChange('nome', e.target.value.toUpperCase())} />
                            {cardErrors?.nome && <p className="text-xs text-red-500 mt-1">{cardErrors.nome}</p>}
                        </Field>
                    </div>
                    <Field label="Validade">
                        <input className={`${inputCls} font-mono ${cardErrors?.validade ? 'border-red-400' : ''}`}
                            placeholder="MM/AA" maxLength={5}
                            value={cardData.validade}
                            onChange={e => onCardChange('validade', maskExpiry(e.target.value))} />
                        {cardErrors?.validade && <p className="text-xs text-red-500 mt-1">{cardErrors.validade}</p>}
                    </Field>
                    <Field label="CVV">
                        <input className={`${inputCls} font-mono ${cardErrors?.cvv ? 'border-red-400' : ''}`}
                            placeholder="000" maxLength={4}
                            value={cardData.cvv}
                            onChange={e => onCardChange('cvv', e.target.value.replace(/\D/g,'').slice(0,4))} />
                        {cardErrors?.cvv && <p className="text-xs text-red-500 mt-1">{cardErrors.cvv}</p>}
                    </Field>
                </div>
            )}

            {/* Cupom */}
            <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Tag size={13} /> Cupom de desconto
                </p>
                {coupon ? (
                    <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                            <Tag size={14} /> {coupon.codigo}
                        </div>
                        <button onClick={onRemoveCoupon} className="text-green-500 hover:text-red-400 transition-colors">
                            <X size={15} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2">
                            <input
                                value={couponCode}
                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                onKeyDown={e => e.key === 'Enter' && onApplyCoupon()}
                                placeholder="Código do cupom"
                                className={`${inputCls} flex-1`}
                            />
                            <button onClick={onApplyCoupon} disabled={validatingCoupon || !couponCode.trim()}
                                className="px-4 py-3 rounded-xl bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
                                {validatingCoupon ? <Loader2 size={15} className="animate-spin" /> : 'Aplicar'}
                            </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                    </>
                )}
            </div>
        </div>
    )
}

function OrderSummary({ itens, loading, estado, coupon }) {
    const subtotal = useMemo(() =>
        itens.reduce((sum, i) => sum + Number(i.preco) * i.quantidade, 0), [itens])
    const discount = coupon
        ? coupon.tipo_desconto === 'percentual'
            ? subtotal * (parseFloat(coupon.desconto) / 100)
            : Math.min(parseFloat(coupon.desconto), subtotal)
        : 0
    const subtotalComDesconto = subtotal - discount
    const frete = estado ? calcularFrete(estado, subtotalComDesconto) : null
    const total = subtotalComDesconto + (frete ?? 0)

    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full flex flex-col gap-4 sticky top-28">
            <h2 className="text-xl font-bold">Resumo do pedido</h2>

            {loading ? (
                <div className="flex flex-col gap-3 animate-pulse">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-200">
                            <div className="w-14 h-14 rounded-xl bg-gray-200 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-14" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
                    {itens.map(item => (
                        <div key={item.item_id ?? item.produto_id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                {item.foto_url
                                    ? <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
                                    : <Package size={20} className="text-gray-400" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-800 truncate">{item.nome}</p>
                                <p className="text-xs text-gray-400">Qtd: {item.quantidade}</p>
                            </div>
                            <p className="font-bold text-sm shrink-0">{fmt(Number(item.preco) * item.quantidade)}</p>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-2 animate-pulse">
                    <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-12" />
                        <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                    <hr className="my-1" />
                    <div className="flex justify-between">
                        <div className="h-5 bg-gray-200 rounded w-12" />
                        <div className="h-5 bg-gray-200 rounded w-24" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Subtotal</span>
                            <span>{fmt(subtotal)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Desconto</span>
                                <span>- {fmt(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Frete</span>
                            <span className={frete === 0 ? 'text-green-600 font-bold' : frete === null ? 'text-gray-400 italic' : ''}>
                                {frete === null ? 'A calcular' : frete === 0 ? 'Grátis' : fmt(frete)}
                            </span>
                        </div>
                    </div>

                    <hr />

                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{fmt(total)}</span>
                    </div>
                </>
            )}
        </div>
    )
}

function PixModal({ pedido, onConfirm }) {
    const [copied, setCopied] = useState(false)
    const payload = gerarPixPayload(pedido.total, pedido.transacao_id)
    const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    function handleCopy() {
        navigator.clipboard.writeText(payload)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1 text-center">
                    <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-1">
                        <FaPix className="text-2xl text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Pague com PIX</h2>
                    <p className="text-sm text-gray-400">Escaneie o QR Code com o app do seu banco</p>
                </div>

                <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 shadow-inner">
                    <QRCode value={payload} size={192} />
                </div>

                <div className="text-2xl font-bold text-verde-escuro">{fmt(pedido.total)}</div>

                <div className="w-full flex flex-col gap-2">
                    <p className="text-xs text-gray-400 text-center font-medium">Ou copie o código PIX:</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-500 break-all select-all leading-relaxed">
                        {payload}
                    </div>
                    <button onClick={handleCopy}
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all border
                            ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                        {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar código</>}
                    </button>
                </div>

                <button onClick={onConfirm}
                    className="w-full bg-verde-escuro text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all">
                    Já realizei o pagamento
                </button>
            </div>
        </div>
    )
}

export default function Checkout() {
    const [step, setStep] = useState(1)
    const [paymentMethod, setPaymentMethod] = useState('pix')
    const [itens, setItens] = useState([])
    const [loadingCart, setLoadingCart] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [pixPedido, setPixPedido] = useState(null)
    const [toast, setToast] = useState(null)
    const navigate = useNavigate()
    const { state: navState } = useLocation()

    const [delivery, setDelivery] = useState({
        cep: navState?.cep ?? '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
    })

    const [cardData, setCardData] = useState({
        numero: '', nome: '', validade: '', cvv: ''
    })
    const [cardErrors, setCardErrors] = useState(null)
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(navState?.coupon ?? null)
    const [couponError, setCouponError] = useState('')
    const [validatingCoupon, setValidatingCoupon] = useState(false)

    useEffect(() => {
        getCart()
            .then(res => setItens(res.data.carrinho ?? []))
            .catch(() => {})
            .finally(() => setLoadingCart(false))
    }, [])

    useEffect(() => {
        const digits = (navState?.cep ?? '').replace(/\D/g, '')
        if (digits.length !== 8) return
        fetch(`https://viacep.com.br/ws/${digits}/json/`)
            .then(r => r.json())
            .then(json => {
                if (json.erro) return
                setDelivery(prev => ({
                    ...prev,
                    endereco: json.logradouro ?? prev.endereco,
                    bairro:   json.bairro     ?? prev.bairro,
                    cidade:   json.localidade ?? prev.cidade,
                    estado:   json.uf         ?? prev.estado,
                }))
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (!localStorage.getItem('user_token')) return
        getProfile()
            .then(async res => {
                const p = res.data.profile
                const cep = (p.cep || '').replace(/\D/g, '')

                setDelivery(prev => ({
                    ...prev,
                    numero:      p.numero      || prev.numero,
                    complemento: p.complemento || prev.complemento,
                    cep:         p.cep         || prev.cep,
                }))

                if (cep.length === 8) {
                    try {
                        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
                        const json = await res.json()
                        if (!json.erro) {
                            setDelivery(prev => ({
                                ...prev,
                                endereco: json.logradouro || prev.endereco,
                                bairro:   json.bairro     || prev.bairro,
                                cidade:   json.localidade || prev.cidade,
                                estado:   json.uf         || prev.estado,
                            }))
                        }
                    } catch {}
                }
            })
            .catch(() => {})
    }, [])

    const handleDeliveryChange = (field, value) => setDelivery(prev => ({ ...prev, [field]: value }))
    const handleCardChange = (field, value) => setCardData(prev => ({ ...prev, [field]: value }))

    const deliveryValid = delivery.cep && delivery.endereco && delivery.numero && delivery.bairro && delivery.cidade && delivery.estado

    async function applyCoupon() {
        if (!couponCode.trim()) return
        setValidatingCoupon(true)
        setCouponError('')
        try {
            const { data } = await validateCoupon(couponCode.trim())
            setAppliedCoupon(data.coupon)
        } catch (err) {
            setCouponError(err.response?.data?.error || 'Cupom inválido')
            setAppliedCoupon(null)
        } finally {
            setValidatingCoupon(false)
        }
    }

    function validateCard() {
        const errs = {}
        if (!luhn(cardData.numero)) errs.numero = 'Número de cartão inválido'
        if (!cardData.nome.trim())  errs.nome    = 'Informe o nome do titular'
        const [mm, aa] = (cardData.validade || '').split('/')
        const now = new Date()
        const exp = new Date(2000 + parseInt(aa || '0'), parseInt(mm || '0') - 1)
        if (!mm || !aa || isNaN(exp) || exp < now) errs.validade = 'Validade inválida'
        if (cardData.cvv.length < 3) errs.cvv = 'CVV inválido'
        return Object.keys(errs).length ? errs : null
    }

    async function finalizarPedido() {
        setSubmitting(true)
        try {
            const { data } = await createOrder({
                metodo_pagamento: paymentMethod,
                cep:          delivery.cep,
                rua:          delivery.endereco,
                numero:       delivery.numero,
                complemento:  delivery.complemento || null,
                bairro:       delivery.bairro,
                cidade:       delivery.cidade,
                estado:       delivery.estado,
                codigo_cupom: appliedCoupon?.codigo || undefined,
            })
            localStorage.removeItem('cart_cache')
            window.dispatchEvent(new CustomEvent('cart:updated'))
            if (paymentMethod === 'pix') {
                setPixPedido(data.pedido)
            } else {
                navigate('/pedido/confirmado', { state: { pedido: data.pedido } })
            }
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao finalizar pedido', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const next = () => {
        if (step === 1 && !deliveryValid) {
            setToast({ message: 'Preencha todos os campos de endereço', type: 'error' })
            return
        }
        if (step === 2) {
            if (paymentMethod === 'cartao_credito') {
                const errs = validateCard()
                if (errs) { setCardErrors(errs); return }
            }
            setCardErrors(null)
            finalizarPedido()
            return
        }
        setStep(s => s + 1)
    }
    const back = () => setStep(s => Math.max(s - 1, 1))

    return (
        <main className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

                <section className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <StepIndicator step={step} />

                    {step === 1 && <DeliveryStep data={delivery} onChange={handleDeliveryChange} />}
                    {step === 2 && <PaymentStep
                        method={paymentMethod} setMethod={setPaymentMethod}
                        cardData={cardData} onCardChange={handleCardChange} cardErrors={cardErrors}
                        coupon={appliedCoupon} couponCode={couponCode} setCouponCode={setCouponCode}
                        onApplyCoupon={applyCoupon} onRemoveCoupon={() => { setAppliedCoupon(null); setCouponCode('') }}
                        couponError={couponError} validatingCoupon={validatingCoupon}
                    />}

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button onClick={back} disabled={submitting}
                                className="flex items-center gap-2 text-gray-500 border border-gray-200 px-6 py-3 rounded-full hover:border-gray-400 transition-all cursor-pointer disabled:opacity-50">
                                <FiChevronLeft /> Voltar
                            </button>
                        ) : (
                            <Link to="/carrinho" className="flex items-center gap-2 text-gray-500 border border-gray-200 px-6 py-3 rounded-full hover:border-gray-400 transition-all">
                                <FiChevronLeft /> Carrinho
                            </Link>
                        )}

                        <button onClick={next} disabled={submitting || loadingCart}
                            className="flex items-center gap-2 bg-verde-escuro text-white px-8 py-3 rounded-full transition-all hover:bg-verde-claro hover:text-verde-escuro font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {step === 2 ? (submitting ? 'Finalizando...' : 'Finalizar pedido') : 'Continuar'} {!submitting && <FiChevronRight />}
                        </button>
                    </div>
                </section>

                <aside className="w-full lg:w-80 shrink-0">
                    <OrderSummary itens={itens} loading={loadingCart} estado={delivery.estado} coupon={appliedCoupon} />
                </aside>

            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {pixPedido && (
                <PixModal
                    pedido={pixPedido}
                    onConfirm={() => navigate('/pedido/confirmado', { state: { pedido: pixPedido } })}
                />
            )}
        </main>
    )
}

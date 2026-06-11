import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  PackagePlus,
  QrCode,
  ReceiptText,
  RefreshCcw,
  Scale,
  ScanLine,
  ShoppingCart,
  Trash2,
  Wifi,
  X,
} from 'lucide-react'
import { QRCode } from 'react-qr-code'
import logo from '../assets/smartcart-logo-transparente.png'
import { gerarPixPayload } from '../lib/pix'

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const DEMO_DATA_URL = '/data/smartcart-demo.json'
const DISPLAY_STORAGE_KEY = 'smartcart-display-demo-state'

const EMPTY_PAYMENT = {
  method: 'pix',
  cardName: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: '',
  pixReady: false,
  copied: false,
  transactionId: '',
}

function luhn(num) {
  const digits = num.replace(/\D/g, '')
  let sum = 0
  let odd = true
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = parseInt(digits[i], 10)
    if (!odd) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    odd = !odd
  }
  return digits.length >= 13 && sum % 10 === 0
}

function maskCard(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function maskExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

function createTransactionId() {
  return `SC-DEMO-${Date.now().toString(36).toUpperCase()}`
}

function normalizeProduct(product) {
  const soldByWeight = Boolean(product.soldByWeight || product.unit === 'kg')
  const quantity = Number(product.quantity) || (soldByWeight ? 0.1 : 1)

  return {
    ...product,
    price: Number(product.price) || 0,
    unit: product.unit || 'un',
    soldByWeight,
    quantity: soldByWeight ? Math.max(0.05, quantity) : Math.max(1, quantity),
  }
}

function formatQuantity(product) {
  if (product.soldByWeight) return `${product.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
  return `${product.quantity}x`
}

function formatUnitPrice(product) {
  return product.soldByWeight ? `${BRL.format(product.price)}/kg` : `${BRL.format(product.price)} un.`
}

function readStoredDisplayState() {
  try {
    const raw = localStorage.getItem(DISPLAY_STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.cartProducts)) return null

    const storedScreen = parsed.activeScreen || 'cart'
    const activeScreen = ['login', 'register', 'account'].includes(storedScreen) ? 'payment' : storedScreen

    return {
      cartProducts: parsed.cartProducts.map(normalizeProduct),
      finalized: Boolean(parsed.finalized),
      activeScreen,
      payment: { ...EMPTY_PAYMENT, ...(parsed.payment || {}) },
    }
  } catch (error) {
    console.error('Erro ao ler dados salvos da demonstracao SmartCart:', error)
    return null
  }
}

function saveDisplayState({ cartProducts, finalized, activeScreen, payment }) {
  try {
    localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify({
      cartProducts,
      finalized,
      activeScreen,
      payment,
    }))
  } catch (error) {
    console.error('Erro ao salvar dados da demonstracao SmartCart:', error)
  }
}

function DemoSkeleton() {
  return (
    <div className="mx-auto max-w-[860px] rounded-[32px] bg-[#0d2415] p-5 shadow-2xl animate-pulse">
      <div className="rounded-[26px] border border-white/10 bg-[#12381f] p-5">
        <div className="h-12 rounded-2xl bg-white/10 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 rounded-2xl bg-white/10" />
          ))}
        </div>
        <div className="h-28 rounded-2xl bg-white/10 mt-4" />
      </div>
    </div>
  )
}

function CartItem({ product, onRemove, disabled }) {
  const subtotal = product.price * product.quantity

  return (
    <li className="grid grid-cols-[56px_1fr] sm:grid-cols-[58px_1fr_auto] gap-3 rounded-2xl bg-white p-3 shadow-[0_16px_30px_-24px_rgba(0,0,0,0.75)] transition-all motion-safe:duration-300 hover:-translate-y-0.5">
      <img
        src={product.image}
        alt={`Produto ${product.name}`}
        className="h-14 w-14 rounded-2xl object-cover bg-[#e8f5e9]"
        loading="lazy"
      />

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#2d7a3a]">{product.category}</p>
        <h3 className="text-[15px] font-extrabold text-gray-900 truncate">{product.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-gray-500">
          <span>{formatUnitPrice(product)}</span>
          <span className="font-bold text-[#18572C]">{BRL.format(subtotal)}</span>
        </div>
      </div>

      <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
        <span
          className="inline-flex h-10 min-w-20 items-center justify-center rounded-full border border-[#dce8d8] bg-[#f8fbf5] px-3 text-sm font-extrabold text-gray-900"
          aria-label={`Quantidade ${formatQuantity(product)}`}
        >
          {formatQuantity(product)}
        </span>
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          disabled={disabled}
          className="grid h-10 w-10 place-items-center rounded-full border border-red-100 bg-red-50 text-red-600 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={`Remover ${product.name}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  )
}

function ProductSelector({ products, onOpenSensor, onOpenWeighted, disabled }) {
  const sensorProducts = products.filter((product) => !product.soldByWeight)
  const weightedProducts = products.filter((product) => product.soldByWeight)

  return (
    <div className="grid gap-3 rounded-2xl border border-white/12 bg-white/8 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold text-white">Entrada de produtos</h3>
        <ScanLine size={18} className="text-[#D4E84A]" aria-hidden="true" />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#D4E84A]">Sensor automatico</p>
        <button
          type="button"
          onClick={onOpenSensor}
          disabled={disabled || sensorProducts.length === 0}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-extrabold text-[#12381f] transition-colors hover:bg-[#D4E84A] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <PackagePlus size={15} />
          Adicionar produto por sensor
        </button>
      </div>

      {weightedProducts.length > 0 && (
        <div className="rounded-2xl border border-[#D4E84A]/25 bg-[#D4E84A]/10 p-3">
          <div className="mb-3 flex items-center gap-2 text-[#D4E84A]">
            <div className="flex items-center gap-2">
              <Scale size={17} aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-wide">Hortifruti na balanca</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenWeighted}
            disabled={disabled}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-extrabold text-[#12381f] transition-colors hover:bg-[#D4E84A] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Scale size={15} />
            Adicionar produto por peso
          </button>
        </div>
      )}
    </div>
  )
}

function DisplayOverlay({ titleId, eyebrow, title, onClose, children }) {
  return (
    <div
      className="absolute inset-0 z-40 flex rounded-[28px] bg-black/65 p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="flex h-full max-h-full w-full flex-col rounded-[24px] border border-white/12 bg-[#12381f] p-4 shadow-2xl">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#D4E84A]">{eyebrow}</p>
            <h4 id={titleId} className="mt-1 text-lg font-extrabold text-white">
              {title}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A]"
            aria-label={`Fechar ${title.toLowerCase()}`}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SensorProductsOverlay({ products, cartProducts, onAdd, onClose, disabled }) {
  return (
    <DisplayOverlay
      titleId="sensor-products-title"
      eyebrow="Sensor automatico"
      title="Produtos por sensor"
      onClose={onClose}
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 content-start gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2 scrollbar-hide">
        {products.map((product) => {
          const cartProduct = cartProducts.find((item) => item.id === product.id)
          const addedQuantity = cartProduct?.quantity ?? 0
          const status = addedQuantity > 0
            ? `${addedQuantity} ${addedQuantity === 1 ? 'produto adicionado' : 'produtos adicionados'}`
            : product.category

          return (
            <button
              key={product.id}
              type="button"
              aria-label={`Simular sensor para ${product.name}`}
              onClick={() => onAdd(product)}
              disabled={disabled}
              className="flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-2.5 text-left text-white transition-all hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <img src={product.image} alt="" className="h-11 w-11 rounded-xl bg-white object-cover" loading="lazy" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-extrabold">{product.name}</span>
                <span className="block text-[11px] font-bold text-[#D4E84A]">{BRL.format(product.price)}</span>
                <span className="block text-[11px] text-white/60">{status}</span>
              </span>
              <PackagePlus size={16} className="shrink-0 text-[#D4E84A]" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </DisplayOverlay>
  )
}

function WeightedProductsOverlay({
  products,
  selectedProduct,
  selectedProductId,
  weight,
  weightedSubtotal,
  validWeight,
  disabled,
  onSelectProduct,
  onWeightChange,
  onSubmit,
  onClose,
}) {
  return (
    <DisplayOverlay
      titleId="weighted-products-title"
      eyebrow="Hortifruti na balanca"
      title="Produtos por peso"
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 scrollbar-hide">
          <div className="grid grid-cols-1 gap-3 pb-3">
            <div>
              <p className="mb-2 text-[12px] font-bold text-white">Selecione o item pesado</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {products.map((product) => {
                  const selected = selectedProductId === product.id

                  return (
                    <button
                      key={product.id}
                      type="button"
                      aria-label={`Selecionar ${product.name} por ${BRL.format(product.price)} por kg`}
                      aria-pressed={selected}
                      onClick={() => onSelectProduct(product.id)}
                      disabled={disabled}
                      className={`flex min-h-16 items-center gap-3 rounded-xl border p-2 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A] disabled:cursor-not-allowed disabled:opacity-45 ${
                        selected
                          ? 'border-[#D4E84A] bg-white text-[#12381f] shadow-sm'
                          : 'border-white/10 bg-white/10 text-white hover:bg-white/16'
                      }`}
                    >
                      <img src={product.image} alt="" className="h-11 w-11 rounded-xl bg-white object-cover" loading="lazy" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-extrabold">{product.name}</span>
                        <span className={`block text-[11px] font-bold ${selected ? 'text-[#18572C]' : 'text-[#D4E84A]'}`}>
                          {BRL.format(product.price)}/kg
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-3">
              <label className="grid gap-1.5 text-[12px] font-bold text-white">
                Peso detectado
                <div className="relative">
                  <input
                    aria-label="Peso detectado"
                    value={weight}
                    onChange={(event) => onWeightChange(event.target.value)}
                    inputMode="decimal"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white px-3 pr-9 text-sm text-gray-900 outline-none focus:border-[#D4E84A]"
                    placeholder="0,65"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">kg</span>
                </div>
              </label>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-white">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#D4E84A]">Subtotal estimado</p>
                <p className="mt-1 text-lg font-extrabold">{BRL.format(weightedSubtotal)}</p>
                <p className="mt-0.5 text-[11px] text-white/60">
                  {selectedProduct ? `${selectedProduct.name} - ${BRL.format(selectedProduct.price)}/kg` : 'Selecione um produto'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || !selectedProduct || !validWeight}
          className="mt-3 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#D4E84A] px-4 text-xs font-extrabold text-[#12381f] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Scale size={15} />
          Confirmar pesagem
        </button>
      </form>
    </DisplayOverlay>
  )
}

function DisplayTab({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[12px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A] ${
        active ? 'bg-[#D4E84A] text-[#12381f]' : 'bg-white/10 text-white hover:bg-white/16'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function DemoField({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-white">
      {label}
      {children}
    </label>
  )
}

export default function SmartCartDemo({ dataUrl = DEMO_DATA_URL }) {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [initialProducts, setInitialProducts] = useState([])
  const [availableProducts, setAvailableProducts] = useState([])
  const [cartProducts, setCartProducts] = useState([])
  const [finalized, setFinalized] = useState(false)
  const [activeScreen, setActiveScreen] = useState('cart')
  const [payment, setPayment] = useState(EMPTY_PAYMENT)
  const [cardErrors, setCardErrors] = useState(null)
  const [showSensorModal, setShowSensorModal] = useState(false)
  const [showWeightedModal, setShowWeightedModal] = useState(false)
  const [selectedWeightedId, setSelectedWeightedId] = useState('')
  const [weight, setWeight] = useState('0.65')

  const applyDemoData = useCallback((data) => {
    const cartItems = (data.cart?.products ?? []).map(normalizeProduct)
    const catalogItems = (data.availableProducts ?? cartItems).map(normalizeProduct)
    const storedState = readStoredDisplayState()
    const nextCartProducts = storedState?.cartProducts ?? cartItems

    setInitialProducts(cartItems)
    setAvailableProducts(catalogItems)
    setCartProducts(nextCartProducts)
    setFinalized(storedState?.finalized ?? false)
    setActiveScreen(storedState?.activeScreen ?? 'cart')
    setPayment(storedState?.payment ?? EMPTY_PAYMENT)
    setLoadError(false)
  }, [])

  useEffect(() => {
    let active = true

    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Demo JSON returned ${response.status}`)
        return response.json()
      })
      .then((data) => {
        if (!active) return
        applyDemoData(data)
        setLoading(false)
      })
      .catch((error) => {
        if (!active) return
        console.error('Erro ao carregar a demonstracao do SmartCart:', error)
        setLoadError(true)
        setInitialProducts([])
        setAvailableProducts([])
        setCartProducts([])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [applyDemoData, dataUrl])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setLoadError(false)
    setFinalized(false)

    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(`Demo JSON returned ${response.status}`)
        return response.json()
      })
      .then(applyDemoData)
      .catch((error) => {
        console.error('Erro ao recarregar a demonstracao do SmartCart:', error)
        setLoadError(true)
        setInitialProducts([])
        setAvailableProducts([])
        setCartProducts([])
      })
      .finally(() => setLoading(false))
  }, [applyDemoData, dataUrl])

  const totals = useMemo(() => {
    return cartProducts.reduce(
      (acc, product) => ({
        items: acc.items + (product.soldByWeight ? 1 : product.quantity),
        total: acc.total + product.price * product.quantity,
      }),
      { items: 0, total: 0 }
    )
  }, [cartProducts])
  const sensorProducts = useMemo(() => availableProducts.filter((product) => !product.soldByWeight), [availableProducts])
  const weightedProducts = useMemo(() => availableProducts.filter((product) => product.soldByWeight), [availableProducts])
  const selectedWeighted = weightedProducts.find((product) => product.id === Number(selectedWeightedId)) ?? weightedProducts[0]
  const parsedWeight = Number(String(weight).replace(',', '.'))
  const validWeight = Number.isFinite(parsedWeight) && parsedWeight > 0
  const weightedSubtotal = selectedWeighted && validWeight ? selectedWeighted.price * parsedWeight : 0
  const pixPayload = useMemo(() => (
    gerarPixPayload(totals.total, payment.transactionId || 'SC-DEMO-PENDING')
  ), [payment.transactionId, totals.total])

  useEffect(() => {
    if (loading || loadError) return
    saveDisplayState({ cartProducts, finalized, activeScreen, payment })
  }, [activeScreen, cartProducts, finalized, loadError, loading, payment])

  function updateActiveScreen(screen) {
    setActiveScreen(screen)
  }

  function handleRemove(productId) {
    setFinalized(false)
    setCartProducts((products) => {
      const nextProducts = products.filter((product) => product.id !== productId)
      return nextProducts
    })
  }

  function handleAdd(product) {
    setFinalized(false)
    setCartProducts((products) => {
      const existing = products.find((item) => item.id === product.id)
      if (existing) {
        const nextProducts = products.map((item) => (
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ))
        return nextProducts
      }
      const nextProducts = [...products, { ...product, quantity: 1 }]
      return nextProducts
    })
  }

  function handleAddWeighted(product, weight) {
    setFinalized(false)
    setCartProducts((products) => {
      const existing = products.find((item) => item.id === product.id)
      const normalizedWeight = Number(weight.toFixed(2))
      if (existing) {
        return products.map((item) => (
          item.id === product.id
            ? { ...item, quantity: Number((item.quantity + normalizedWeight).toFixed(2)) }
            : item
        ))
      }
      return [...products, { ...product, quantity: normalizedWeight }]
    })
  }

  function handleWeightedSubmit(event) {
    event.preventDefault()
    if (!selectedWeighted || !validWeight) return
    handleAddWeighted(selectedWeighted, parsedWeight)
    setShowWeightedModal(false)
  }

  function handleReset() {
    setFinalized(false)
    setActiveScreen('cart')
    setCartProducts(initialProducts)
    setPayment(EMPTY_PAYMENT)
  }

  function handleGoToPayment() {
    if (!cartProducts.length) return
    setFinalized(false)
    setActiveScreen('payment')
  }

  function updatePayment(field, value) {
    setPayment((current) => ({ ...current, [field]: value, pixReady: field === 'method' ? false : current.pixReady }))
  }

  function validateCard() {
    const errors = {}
    if (!luhn(payment.cardNumber)) errors.cardNumber = 'Numero de cartao invalido'
    if (!payment.cardName.trim()) errors.cardName = 'Informe o nome do titular'

    const [month, year] = payment.cardExpiry.split('/')
    const exp = new Date(2000 + parseInt(year || '0', 10), parseInt(month || '0', 10) - 1)
    if (!month || !year || Number.isNaN(exp.getTime()) || exp < new Date()) {
      errors.cardExpiry = 'Validade invalida'
    }
    if (payment.cardCvv.length < 3) errors.cardCvv = 'CVV invalido'

    return Object.keys(errors).length ? errors : null
  }

  function handleConfirmPayment(event) {
    event.preventDefault()
    if (!cartProducts.length) return

    if (payment.method === 'card') {
      const errors = validateCard()
      if (errors) {
        setCardErrors(errors)
        return
      }
      setCardErrors(null)
      setFinalized(true)
      setActiveScreen('confirmation')
      return
    }

    setPayment((current) => ({
      ...current,
      pixReady: true,
      transactionId: current.transactionId || createTransactionId(),
    }))
  }

  function handlePixPaid() {
    setFinalized(true)
    setActiveScreen('confirmation')
  }

  function handleCopyPix(payload) {
    navigator.clipboard?.writeText(payload)
    setPayment((current) => ({ ...current, copied: true }))
    window.setTimeout(() => {
      setPayment((current) => ({ ...current, copied: false }))
    }, 1600)
  }

  return (
    <section className="py-24 bg-[#F5F5F5]" id="demo-display">
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="reveal max-w-[760px] mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5e9] px-4 py-2 text-[13px] font-bold text-[#18572C]">
            <Wifi size={15} aria-hidden="true" />
            Demo interativa do display
          </span>
          <h2 className="mt-5 font-extrabold tracking-tight leading-[1.12]" style={{ fontSize: 'clamp(28px, 3.6vw, 42px)', color: '#1a1a1a' }}>
            A compra acontecendo em tempo real no{' '}
            <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: '#2d7a3a' }}>
              carrinho inteligente
            </span>
          </h2>
          <p className="mt-3.5 text-[17px] text-[#555] leading-relaxed">
            Simule sensores detectando produtos embalados automaticamente e a balanca
            adicionando hortifruti pelo peso antes do pagamento direto no display.
          </p>
        </div>

        {loading ? (
          <DemoSkeleton />
        ) : loadError ? (
          <div className="rounded-[28px] border border-red-100 bg-white p-8 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Nao foi possivel carregar a demonstracao</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
                  O display continua protegido. Tente carregar os dados locais novamente em instantes.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18572C] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2d7a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A]"
              >
                <RefreshCcw size={16} />
                Tentar novamente
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[760px] rounded-[34px] bg-[#0d2415] p-3 sm:p-4 shadow-[0_34px_80px_-35px_rgba(0,0,0,0.8)]">
            <div className="relative flex h-[720px] max-h-[calc(100vh-150px)] min-h-[560px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#12381f] p-4 sm:p-5">
                <header className="mb-4 shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="SmartCart" className="h-9 w-9 rounded-xl bg-white object-contain p-1" />
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-wide text-[#D4E84A]">SmartCart</p>
                      <h3 className="text-xl font-extrabold text-white">Display interativo</h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[12px] font-bold text-white">
                    {finalized ? <CheckCircle2 size={15} className="text-[#D4E84A]" /> : <ShoppingCart size={15} className="text-[#D4E84A]" />}
                    {finalized ? 'Compra finalizada' : 'Compra sem cadastro'}
                  </span>
                </header>

                <nav className="mb-4 shrink-0 flex flex-wrap gap-2" aria-label="Paginas da demonstracao do display">
                  <DisplayTab
                    active={activeScreen === 'cart'}
                    icon={<ShoppingCart size={15} />}
                    label="Carrinho"
                    onClick={() => updateActiveScreen('cart')}
                  />
                  <DisplayTab
                    active={activeScreen === 'payment' || activeScreen === 'confirmation'}
                    icon={<CreditCard size={15} />}
                    label="Pagamento"
                    onClick={handleGoToPayment}
                  />
                </nav>

                {finalized && (
                  <div className="mb-4 rounded-2xl border border-[#D4E84A]/40 bg-[#D4E84A]/12 p-4 text-white" role="status" aria-live="polite">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-[#D4E84A]" />
                      <div>
                        <p className="font-extrabold">Pagamento simulado aprovado</p>
                        <p className="mt-1 text-sm text-white/75">Sua compra foi registrada no display do carrinho.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-hide">
                  {activeScreen === 'cart' && (
                    <div className="grid gap-4">
                    <div className="min-h-[220px]">
                      {cartProducts.length ? (
                        <ul className="space-y-3" aria-label="Produtos adicionados ao carrinho">
                          {cartProducts.map((product) => (
                            <CartItem
                              key={product.id}
                              product={product}
                              onRemove={handleRemove}
                              disabled={false}
                            />
                          ))}
                        </ul>
                      ) : (
                        <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-white/20 bg-white/6 p-8 text-center" role="status">
                          <div>
                            <ShoppingCart size={38} className="mx-auto text-[#D4E84A]" />
                            <h3 className="mt-4 text-lg font-extrabold text-white">Carrinho vazio</h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/65">
                              Adicione um produto disponivel para continuar a demonstracao.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_230px] gap-4">
                      <ProductSelector
                        products={availableProducts}
                        onOpenSensor={() => setShowSensorModal(true)}
                        onOpenWeighted={() => setShowWeightedModal(true)}
                        disabled={false}
                      />

                      <aside className="rounded-2xl bg-white p-4">
                        <div className="mb-4 flex items-center gap-2 text-[#18572C]">
                          <ReceiptText size={18} aria-hidden="true" />
                          <h3 className="text-sm font-extrabold">Resumo</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between gap-3 text-gray-500">
                            <span>Itens</span>
                            <strong className="text-gray-900">{totals.items}</strong>
                          </div>
                          <div className="border-t border-gray-100 pt-3">
                            <div className="flex items-end justify-between gap-3">
                              <span className="text-sm font-bold text-gray-600">Total</span>
                              <strong className="text-xl font-extrabold text-[#18572C]">{BRL.format(totals.total)}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2">
                          <button
                            type="button"
                            onClick={handleGoToPayment}
                            disabled={!cartProducts.length}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#18572C] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2d7a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A] disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            <CreditCard size={16} />
                            Ir para pagamento
                          </button>
                          <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#18572C] px-4 py-2.5 text-sm font-bold text-[#18572C] transition-colors hover:bg-[#e8f5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A]"
                          >
                            <RefreshCcw size={16} />
                            Reiniciar demo
                          </button>
                        </div>
                      </aside>
                    </div>
                    </div>
                  )}

                  {activeScreen === 'payment' && (
                  <form onSubmit={handleConfirmPayment} className="grid gap-4">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_230px] gap-4">
                          <div className="rounded-2xl bg-white/8 p-4">
                            <h3 className="text-xl font-extrabold text-white">Forma de pagamento</h3>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              {[
                                ['pix', 'PIX', <QrCode key="pix" size={18} />],
                                ['card', 'Cartao', <CreditCard key="card" size={18} />],
                              ].map(([method, label, icon]) => (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => updatePayment('method', method)}
                                  className={`flex min-h-14 items-center justify-center gap-2 rounded-2xl border text-sm font-extrabold ${
                                    payment.method === method ? 'border-[#D4E84A] bg-[#D4E84A] text-[#12381f]' : 'border-white/10 bg-white/10 text-white'
                                  }`}
                                >
                                  {icon}
                                  {label}
                                </button>
                              ))}
                            </div>
                            {payment.method === 'pix' ? (
                              payment.pixReady ? (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 rounded-2xl border border-teal-200 bg-white p-4 text-gray-800">
                                  <div className="rounded-2xl border-2 border-gray-100 bg-white p-3">
                                    <QRCode value={pixPayload} size={150} className="h-auto w-full" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-extrabold text-[#18572C]">Pague com PIX</p>
                                    <p className="mt-1 text-xs text-gray-500">Escaneie o QR Code ou copie o codigo abaixo.</p>
                                    <div className="mt-3 max-h-20 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2 text-[10px] leading-relaxed text-gray-500">
                                      {pixPayload}
                                    </div>
                                    <div className="mt-3 grid gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleCopyPix(pixPayload)}
                                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-gray-200 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                      >
                                        {payment.copied ? <Check size={14} /> : <Copy size={14} />}
                                        {payment.copied ? 'Copiado' : 'Copiar PIX'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handlePixPaid}
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#18572C] px-4 text-sm font-extrabold leading-tight text-white shadow-sm transition-colors hover:bg-[#2d7a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4E84A]"
                                      >
                                        <CheckCircle2 size={16} className="shrink-0" />
                                        Ja realizei o pagamento
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
                                  <QrCode size={34} className="text-teal-700" />
                                  <p className="mt-3 leading-relaxed">
                                    Ao confirmar, o display gera um QR Code PIX local para pagar <strong>{BRL.format(totals.total)}</strong>.
                                  </p>
                                </div>
                              )
                            ) : (
                              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <DemoField label="Nome no cartao">
                                  <input required value={payment.cardName} onChange={(event) => updatePayment('cardName', event.target.value.toUpperCase())} className={`h-12 rounded-xl border bg-white px-4 text-gray-900 outline-none focus:border-[#D4E84A] ${cardErrors?.cardName ? 'border-red-400' : 'border-white/10'}`} placeholder="NOME SOBRENOME" />
                                  {cardErrors?.cardName && <span className="text-xs text-red-200">{cardErrors.cardName}</span>}
                                </DemoField>
                                <DemoField label="Numero">
                                  <input required value={payment.cardNumber} onChange={(event) => updatePayment('cardNumber', maskCard(event.target.value))} className={`h-12 rounded-xl border bg-white px-4 font-mono text-gray-900 outline-none focus:border-[#D4E84A] ${cardErrors?.cardNumber ? 'border-red-400' : 'border-white/10'}`} placeholder="0000 0000 0000 0000" />
                                  {cardErrors?.cardNumber && <span className="text-xs text-red-200">{cardErrors.cardNumber}</span>}
                                </DemoField>
                                <DemoField label="Validade">
                                  <input required value={payment.cardExpiry} onChange={(event) => updatePayment('cardExpiry', maskExpiry(event.target.value))} className={`h-12 rounded-xl border bg-white px-4 font-mono text-gray-900 outline-none focus:border-[#D4E84A] ${cardErrors?.cardExpiry ? 'border-red-400' : 'border-white/10'}`} placeholder="MM/AA" />
                                  {cardErrors?.cardExpiry && <span className="text-xs text-red-200">{cardErrors.cardExpiry}</span>}
                                </DemoField>
                                <DemoField label="CVV">
                                  <input required value={payment.cardCvv} onChange={(event) => updatePayment('cardCvv', event.target.value.replace(/\D/g, '').slice(0, 4))} className={`h-12 rounded-xl border bg-white px-4 font-mono text-gray-900 outline-none focus:border-[#D4E84A] ${cardErrors?.cardCvv ? 'border-red-400' : 'border-white/10'}`} placeholder="000" />
                                  {cardErrors?.cardCvv && <span className="text-xs text-red-200">{cardErrors.cardCvv}</span>}
                                </DemoField>
                              </div>
                            )}
                          </div>

                          <aside className="rounded-2xl bg-white p-4">
                            <p className="text-sm font-extrabold text-[#18572C]">Resumo</p>
                            <div className="mt-3 space-y-2 text-sm">
                              <div className="flex justify-between text-gray-500"><span>Itens</span><strong className="text-gray-900">{totals.items}</strong></div>
                              <div className="flex justify-between border-t border-gray-100 pt-3 text-gray-500"><span>Total</span><strong className="text-xl text-[#18572C]">{BRL.format(totals.total)}</strong></div>
                            </div>
                            {!payment.pixReady && (
                              <button type="submit" disabled={!cartProducts.length} className="mt-4 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-full bg-[#18572C] px-4 py-2.5 text-sm font-bold text-white disabled:bg-gray-300">
                                <CheckCircle2 size={16} />
                                {payment.method === 'pix' ? 'Gerar QR Code PIX' : 'Finalizar pedido'}
                              </button>
                            )}
                          </aside>
                        </div>
                  </form>
                  )}

                  {activeScreen === 'confirmation' && (
                  <div className="grid min-h-[320px] place-items-center rounded-2xl border border-[#D4E84A]/35 bg-[#D4E84A]/10 p-8 text-center text-white">
                    <div>
                      <CheckCircle2 size={54} className="mx-auto text-[#D4E84A]" />
                      <h3 className="mt-5 text-2xl font-extrabold">Compra concluida</h3>
                      <p className="mt-2 text-sm text-white/70">
                        Pagamento de {BRL.format(totals.total)} aprovado no display.
                      </p>
                      <button type="button" onClick={handleReset} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#D4E84A] px-5 py-2.5 text-sm font-extrabold text-[#12381f]">
                        <RefreshCcw size={16} />
                        Nova demonstracao
                      </button>
                    </div>
                  </div>
                  )}
                </div>
                {showSensorModal && (
                  <SensorProductsOverlay
                    products={sensorProducts}
                    cartProducts={cartProducts}
                    onAdd={handleAdd}
                    onClose={() => setShowSensorModal(false)}
                    disabled={false}
                  />
                )}
                {showWeightedModal && (
                  <WeightedProductsOverlay
                    products={weightedProducts}
                    selectedProduct={selectedWeighted}
                    selectedProductId={selectedWeighted?.id}
                    weight={weight}
                    weightedSubtotal={weightedSubtotal}
                    validWeight={validWeight}
                    disabled={false}
                    onSelectProduct={(productId) => setSelectedWeightedId(String(productId))}
                    onWeightChange={setWeight}
                    onSubmit={handleWeightedSubmit}
                    onClose={() => setShowWeightedModal(false)}
                  />
                )}
              </div>
          </div>
        )}
      </div>
    </section>
  )
}

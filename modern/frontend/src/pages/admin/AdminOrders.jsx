import { useState, useRef, useEffect, useMemo } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Search, Eye, X, SlidersHorizontal, FileText, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import Toast from '../../components/Toast'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { getAdminOrders, getAdminOrderById, updateOrderStatus, getOrderAnalytics } from '../../lib/api/adminOrders'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const MIN = 0
const MAX = 50000
const PER_PAGE = 10

const STATUS_LABEL = {
    aguardando: 'Aguardando',
    pago:       'Pago',
    enviado:    'Enviado',
    entregue:   'Entregue',
    cancelado:  'Cancelado',
}

const STATUS_STYLE = {
    aguardando: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/25 dark:text-yellow-300',
    pago:       'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',
    enviado:    'bg-purple-100 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300',
    entregue:   'bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-300',
    cancelado:  'bg-red-100 text-red-700 dark:bg-red-500/25 dark:text-red-300',
}

const PAYMENT_LABEL = {
    pix:            'PIX',
    cartao_credito: 'Cartão de crédito',
}

const STATUS_STEPS = ['aguardando', 'pago', 'enviado', 'entregue']

function parseDate(created_at) {
    if (!created_at) return { date: '—', hour: '—', iso: '' }
    const [datePart, timePart = ''] = created_at.split(' ')
    const [y, m, d] = datePart.split('-')
    return { date: `${d}/${m}/${y}`, hour: timePart.slice(0, 5), iso: datePart }
}

function fmt(v) {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function DualRangeSlider({ valueMin, valueMax, onChange }) {
    const pct = v => ((v - MIN) / (MAX - MIN)) * 100
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium text-verde-escuro">
                <span>R${valueMin}</span>
                <span>R${valueMax}</span>
            </div>
            <div className="relative h-4 flex items-center">
                <div className="absolute w-full h-1 bg-gray-200 rounded-full" />
                <div
                    className="absolute h-1 bg-verde-escuro rounded-full"
                    style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
                />
                <input
                    type="range" min={MIN} max={MAX} step={50}
                    value={valueMin}
                    onChange={e => onChange(Math.min(Number(e.target.value), valueMax - 50), valueMax)}
                    className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-verde-escuro [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
                />
                <input
                    type="range" min={MIN} max={MAX} step={50}
                    value={valueMax}
                    onChange={e => onChange(valueMin, Math.max(Number(e.target.value), valueMin + 50))}
                    className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-verde-escuro [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow"
                />
            </div>
        </div>
    )
}

function TableSkeleton() {
    return Array.from({ length: 6 }, (_, i) => (
        <tr key={i} className="border-b border-gray-50 dark:border-(--admin-border)">
            {[70, 110, 60, 90, 120, 90, 70, 32].map((w, j) => (
                <td key={j} className="py-3 pr-4">
                    <div className="h-3.5 bg-gray-100 dark:bg-(--admin-border) rounded animate-pulse" style={{ width: w }} />
                </td>
            ))}
        </tr>
    ))
}

export default function AdminOrders() {
    const [orders, setOrders]               = useState([])
    const [loading, setLoading]             = useState(true)
    const [toast, setToast]                 = useState(null)
    const [search, setSearch]               = useState('')
    const [showFilters, setShowFilters]     = useState(false)
    const [filters, setFilters]             = useState({ status: 'todos', payment: 'todos', valueMin: 0, valueMax: 50000, dateFrom: '', dateTo: '' })
    const filterRef                         = useRef(null)

    const [detailId, setDetailId]           = useState(null)
    const [detailOrder, setDetailOrder]     = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [pendingStatus, setPendingStatus]   = useState(null)
    const [confirmCancel, setConfirmCancel] = useState(false)

    const [analytics, setAnalytics]         = useState([])
    const [page, setPage]                   = useState(1)

    useEffect(() => {
        loadOrders()
        loadAnalytics()
    }, [])

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (detailId === null) { setDetailOrder(null); return }
        setDetailLoading(true)
        setDetailOrder(null)
        getAdminOrderById(detailId)
            .then(({ data }) => setDetailOrder(data.order))
            .catch(() => setToast({ message: 'Erro ao carregar detalhes do pedido', type: 'error' }))
            .finally(() => setDetailLoading(false))
    }, [detailId])

    async function loadOrders() {
        setLoading(true)
        try {
            const { data } = await getAdminOrders()
            setOrders(data.orders ?? [])
        } catch {
            setToast({ message: 'Erro ao carregar pedidos', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    async function loadAnalytics() {
        try {
            const { data } = await getOrderAnalytics()
            setAnalytics(data.analytics ?? [])
        } catch {}
    }

    async function handleStatusChange(newStatus) {
        if (!detailOrder || updatingStatus) return
        setUpdatingStatus(true)
        setPendingStatus(newStatus)
        try {
            await updateOrderStatus(detailOrder.id, { status: newStatus })
            setDetailOrder(prev => ({ ...prev, status: newStatus }))
            setOrders(prev => prev.map(o => o.id === detailOrder.id ? { ...o, status: newStatus } : o))
        } catch {
            setToast({ message: 'Erro ao atualizar status', type: 'error' })
        } finally {
            setUpdatingStatus(false)
            setPendingStatus(null)
        }
    }

    useEffect(() => { setPage(1) }, [search, filters])

    const activeFiltersCount = [
        filters.status !== 'todos',
        filters.payment !== 'todos',
        filters.valueMin > 0 || filters.valueMax < 3000,
        filters.dateFrom !== '',
        filters.dateTo !== '',
    ].filter(Boolean).length

    const filtered = orders.filter(o => {
        const matchSearch =
            String(o.id).includes(search) ||
            (o.cliente ?? '').toLowerCase().includes(search.toLowerCase())
        const matchStatus  = filters.status === 'todos' || o.status === filters.status
        const matchPayment = filters.payment === 'todos' || o.metodo_pagamento === filters.payment
        const matchValue   = Number(o.total) >= filters.valueMin && Number(o.total) <= filters.valueMax
        const matchDate    = (() => {
            if (!filters.dateFrom && !filters.dateTo) return true
            const { iso } = parseDate(o.created_at)
            if (filters.dateFrom && iso < filters.dateFrom) return false
            if (filters.dateTo   && iso > filters.dateTo)   return false
            return true
        })()
        return matchSearch && matchStatus && matchPayment && matchValue && matchDate
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    const stats = {
        total:     orders.length,
        aguardando: orders.filter(o => o.status === 'aguardando' || o.status === 'pago').length,
        enviados:  orders.filter(o => o.status === 'enviado').length,
        entregues: orders.filter(o => o.status === 'entregue').length,
    }

    const chartData = useMemo(() => {
        const now = new Date()
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const counts = {}
        analytics.forEach(a => { counts[Number(a.dia)] = Number(a.pedidos) })
        const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
        const data   = labels.map((_, i) => counts[i + 1] || 0)
        return {
            labels,
            datasets: [{
                label: 'Pedidos',
                data,
                backgroundColor: 'rgba(22, 163, 74, 0.15)',
                borderColor: '#16a34a',
                borderWidth: 2,
                borderRadius: 6,
            }]
        }
    }, [analytics])

    function generateInvoice(order, itens) {
        const { date, hour } = parseDate(order.created_at)
        const total        = Number(order.total).toFixed(2).replace('.', ',')
        const statusLabel  = STATUS_LABEL[order.status]  ?? order.status
        const paymentLabel = PAYMENT_LABEL[order.metodo_pagamento] ?? order.metodo_pagamento
        const orderId      = `#${String(order.id).padStart(5, '0')}`

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <title>Nota Fiscal - ${orderId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: bold; color: #16a34a; }
        .brand span { font-size: 13px; font-weight: normal; color: #666; display: block; margin-top: 2px; }
        .invoice-info { text-align: right; font-size: 13px; color: #555; }
        .invoice-info strong { font-size: 18px; color: #1a1a1a; display: block; margin-bottom: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 11px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 8px; }
        .info-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .info-row span:first-child { color: #666; }
        .info-row span:last-child { font-weight: 500; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead tr { background: #f9fafb; }
        th { text-align: left; padding: 10px 12px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
        .total-row td { font-weight: bold; font-size: 15px; border-bottom: none; border-top: 2px solid #16a34a; color: #16a34a; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">SmartCart<span>Loja Inteligente</span></div>
        <div class="invoice-info">
            <strong>NOTA FISCAL</strong>
            Pedido: ${orderId}<br/>
            Data: ${date} às ${hour}<br/>
            Status: ${statusLabel}
        </div>
    </div>
    <div class="section">
        <div class="section-title">Dados do cliente</div>
        <div class="info-row"><span>Nome</span><span>${order.nome}</span></div>
        <div class="info-row"><span>Pagamento</span><span>${paymentLabel}</span></div>
    </div>
    <div class="section">
        <div class="section-title">Itens do pedido</div>
        <table>
            <thead><tr>
                <th>Produto</th><th>Qtd.</th><th>Preço unit.</th><th>Total</th>
            </tr></thead>
            <tbody>
                ${(itens ?? []).map(item => `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${Number(item.preco_unitario_historico).toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}</td>
                </tr>`).join('')}
                <tr class="total-row"><td colspan="3">Total</td><td>R$ ${total}</td></tr>
            </tbody>
        </table>
    </div>
    <div class="footer">
        Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — SmartCart © ${new Date().getFullYear()}
    </div>
    <script>window.onload = () => window.print()</script>
</body>
</html>`

        const win = window.open('', '_blank')
        win.document.write(html)
        win.document.close()
    }

    return (
        <main>
            <AdminHeader title="Pedidos" description="Acompanhe e gerencie todos os pedidos da loja." />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                {[
                    { label: 'Total',      valor: stats.total,      cor: 'text-gray-800 dark:text-(--admin-text)' },
                    { label: 'Aguardando', valor: stats.aguardando,  cor: 'text-yellow-600'                        },
                    { label: 'Enviados',   valor: stats.enviados,    cor: 'text-purple-600'                        },
                    { label: 'Entregues',  valor: stats.entregues,   cor: 'text-green-600'                         },
                ].map(({ label, valor, cor }) => (
                    <div key={label} className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                        <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                        <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por ID ou cliente..."
                            className="outline-none dark:bg-(--admin-card) dark:text-(--admin-text) text-sm w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilters(prev => !prev)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${activeFiltersCount > 0 ? 'border-verde-escuro text-verde-escuro bg-green-50' : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}
                        >
                            <SlidersHorizontal size={15} />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-verde-escuro text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>
                            )}
                        </button>

                        {showFilters && (
                            <div className="absolute top-11 left-0 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-xl shadow-lg dark:shadow-black/40 p-4 z-20 w-56 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Status</label>
                                    {[{ val: 'todos', label: 'Todos' }, ...Object.entries(STATUS_LABEL).map(([val, label]) => ({ val, label }))].map(opt => (
                                        <button key={opt.val} onClick={() => setFilters(prev => ({ ...prev, status: opt.val }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.status === opt.val ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Pagamento</label>
                                    {[{ val: 'todos', label: 'Todos' }, { val: 'pix', label: 'PIX' }, { val: 'cartao_credito', label: 'Cartão de crédito' }].map(opt => (
                                        <button key={opt.val} onClick={() => setFilters(prev => ({ ...prev, payment: opt.val }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.payment === opt.val ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Valor</label>
                                    <DualRangeSlider
                                        valueMin={filters.valueMin}
                                        valueMax={filters.valueMax}
                                        onChange={(min, max) => setFilters(prev => ({ ...prev, valueMin: min, valueMax: max }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Período</label>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-400 dark:text-(--admin-text-muted)">De</label>
                                        <input type="date" value={filters.dateFrom}
                                            onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                            className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-2 py-1.5 text-xs outline-none focus:border-verde-escuro transition-all" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Até</label>
                                        <input type="date" value={filters.dateTo} min={filters.dateFrom}
                                            onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                            className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-2 py-1.5 text-xs outline-none focus:border-verde-escuro transition-all" />
                                    </div>
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button onClick={() => setFilters({ status: 'todos', payment: 'todos', valueMin: 0, valueMax: 50000, dateFrom: '', dateTo: '' })}
                                        className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted) ml-auto">{filtered.length} pedido(s)</span>
                </div>

                <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full min-w-200 text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                                <th className="pb-3 font-medium">Pedido</th>
                                <th className="pb-3 font-medium">Cliente</th>
                                <th className="pb-3 font-medium">Itens</th>
                                <th className="pb-3 font-medium">Valor</th>
                                <th className="pb-3 font-medium">Data e hora</th>
                                <th className="pb-3 font-medium">Pagamento</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <TableSkeleton /> : paginated.map(order => {
                                const { date, hour } = parseDate(order.created_at)
                                return (
                                    <tr key={order.id} className="border-b border-gray-50 dark:border-(--admin-border) last:border-0">
                                        <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">
                                            #{String(order.id).padStart(5, '0')}
                                        </td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.cliente}</td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.qtd_itens} item(s)</td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)">{fmt(order.total)}</td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)">{date} — {hour}</td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)">
                                            {PAYMENT_LABEL[order.metodo_pagamento] ?? order.metodo_pagamento}
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[order.status] ?? ''}`}>
                                                {STATUS_LABEL[order.status] ?? order.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => setDetailId(order.id)}
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">
                                        Nenhum pedido encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-(--admin-border)">
                        <span className="text-xs text-gray-400 dark:text-(--admin-text-muted)">
                            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} pedidos
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-(--admin-border) hover:bg-gray-100 dark:hover:bg-(--admin-hover) disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 dark:text-(--admin-text-muted)"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce((acc, p, i, arr) => {
                                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, i) => p === '...'
                                    ? <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
                                    : <button key={p} onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === p ? 'bg-verde-escuro text-white' : 'hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-500 dark:text-(--admin-text-muted)'}`}>
                                        {p}
                                      </button>
                                )
                            }
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-(--admin-border) hover:bg-gray-100 dark:hover:bg-(--admin-hover) disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-500 dark:text-(--admin-text-muted)"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">
                    Pedidos em {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][new Date().getMonth()]}
                </h2>
                <div className="h-52">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
                </div>
            </div>

            {/* Detail Modal */}
            {detailId !== null && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-lg shadow-xl dark:shadow-black/40 max-h-[90vh] overflow-y-auto">

                        {detailLoading || !detailOrder ? (
                            <div className="flex flex-col gap-4 animate-pulse">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-2">
                                        <div className="h-5 w-36 bg-gray-200 dark:bg-(--admin-border) rounded" />
                                        <div className="h-3 w-24 bg-gray-100 dark:bg-(--admin-hover) rounded" />
                                    </div>
                                    <div className="h-8 w-8 bg-gray-100 dark:bg-(--admin-hover) rounded-md" />
                                </div>
                                <div className="h-28 bg-gray-100 dark:bg-(--admin-hover) rounded-xl" />
                                <div className="h-48 bg-gray-100 dark:bg-(--admin-hover) rounded-xl" />
                                <div className="h-10 bg-gray-100 dark:bg-(--admin-hover) rounded-lg" />
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">
                                            Pedido #{String(detailOrder.id).padStart(5, '0')}
                                        </h2>
                                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) mt-0.5">
                                            {parseDate(detailOrder.created_at).date} às {parseDate(detailOrder.created_at).hour}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setDetailId(null)}
                                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted) cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Timeline */}
                                {detailOrder.status !== 'cancelado' ? (
                                    <div className="mb-6 bg-gray-50 dark:bg-(--admin-bg) rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-4">
                                            Progresso do pedido
                                        </p>
                                        <div className="flex items-center">
                                            {STATUS_STEPS.map((step, i) => {
                                                const currentIdx = STATUS_STEPS.indexOf(detailOrder.status)
                                                const done       = i <= currentIdx
                                                const active     = i === currentIdx
                                                const lineActive = i < currentIdx
                                                return (
                                                    <div key={step} className="flex items-center flex-1 last:flex-none">
                                                        <button
                                                            disabled={updatingStatus}
                                                            onClick={() => handleStatusChange(step)}
                                                            className={`flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 disabled:cursor-not-allowed transition-opacity ${updatingStatus && pendingStatus !== step ? 'opacity-40' : ''}`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                                                ${done
                                                                    ? 'bg-verde-escuro border-verde-escuro dark:bg-(--admin-accent) dark:border-(--admin-accent)'
                                                                    : 'bg-white dark:bg-(--admin-card) border-gray-200 dark:border-(--admin-border) group-hover:border-verde-escuro'}`}>
                                                                {pendingStatus === step
                                                                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                    : done
                                                                        ? <Check size={13} className="text-white" />
                                                                        : <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-(--admin-border)" />
                                                                }
                                                            </div>
                                                            <div className="text-center">
                                                                <p className={`text-xs font-bold whitespace-nowrap ${active ? 'text-verde-escuro dark:text-(--admin-accent)' : done ? 'text-gray-600 dark:text-(--admin-text)' : 'text-gray-400 dark:text-(--admin-text-muted)'}`}>
                                                                    {STATUS_LABEL[step]}
                                                                </p>
                                                            </div>
                                                        </button>
                                                        {i < STATUS_STEPS.length - 1 && (
                                                            <div className="flex-1 h-0.5 mx-2 mb-4 bg-gray-200 dark:bg-(--admin-border) overflow-hidden rounded-full">
                                                                <div className={`h-full bg-verde-escuro dark:bg-(--admin-accent) transition-all duration-500 ${lineActive ? 'w-full' : 'w-0'}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-(--admin-text-muted) text-center mt-2">
                                            Clique em uma etapa para atualizar o status
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mb-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                                            <X size={16} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400">Pedido cancelado</p>
                                            <p className="text-xs text-red-400 dark:text-red-500">Este pedido foi cancelado e não pode ser processado.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Details */}
                                <div className="flex flex-col gap-3 text-sm bg-gray-50 dark:bg-(--admin-bg) rounded-xl p-4 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 dark:text-(--admin-text-muted)">Cliente</span>
                                        <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detailOrder.nome}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 dark:text-(--admin-text-muted)">Pagamento</span>
                                        <span className="font-medium text-gray-700 dark:text-(--admin-text)">
                                            {PAYMENT_LABEL[detailOrder.metodo_pagamento] ?? detailOrder.metodo_pagamento}
                                        </span>
                                    </div>
                                    {detailOrder.codigo_rastreio && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 dark:text-(--admin-text-muted)">Rastreio</span>
                                            <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detailOrder.codigo_rastreio}</span>
                                        </div>
                                    )}
                                    {detailOrder.cupom_codigo && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400 dark:text-(--admin-text-muted)">Cupom</span>
                                            <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detailOrder.cupom_codigo}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 dark:border-(--admin-border) pt-3 flex flex-col gap-1">
                                        <span className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-1">Endereço de entrega</span>
                                        <p className="text-sm text-gray-600 dark:text-(--admin-text)">
                                            {detailOrder.rua}, {detailOrder.numero}
                                            {detailOrder.complemento && ` — ${detailOrder.complemento}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-(--admin-text)">{detailOrder.bairro}</p>
                                        <p className="text-sm text-gray-600 dark:text-(--admin-text)">{detailOrder.cidade} — {detailOrder.estado}</p>
                                        <p className="text-sm text-gray-600 dark:text-(--admin-text)">CEP: {detailOrder.cep}</p>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-(--admin-border) pt-3 flex flex-col gap-2">
                                        <span className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider">Itens do pedido</span>
                                        {(detailOrder.itens ?? []).map((item, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-700 dark:text-(--admin-text)">{item.nome}</p>
                                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Qtd: {item.quantidade}</p>
                                                </div>
                                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">{fmt(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between border-t border-gray-200 dark:border-(--admin-border) pt-2 font-bold">
                                        <span className="text-gray-700 dark:text-(--admin-text)">Total</span>
                                        <span className="text-gray-700 dark:text-(--admin-text)">{fmt(detailOrder.total)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => generateInvoice(detailOrder, detailOrder.itens)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-verde-escuro text-verde-escuro dark:text-(--admin-accent) dark:border-(--admin-accent) text-sm font-medium hover:bg-green-50 dark:hover:bg-(--admin-hover) transition-all cursor-pointer"
                                    >
                                        <FileText size={15} /> Gerar Nota Fiscal
                                    </button>
                                    {detailOrder.status !== 'cancelado' && (
                                        <button
                                            onClick={() => setConfirmCancel(true)}
                                            disabled={updatingStatus}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {pendingStatus === 'cancelado'
                                                ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                                : <X size={15} />
                                            }
                                            Cancelar pedido
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {confirmCancel && detailOrder && (
                <ConfirmDialog
                    title="Cancelar pedido"
                    message={`Tem certeza que deseja cancelar o pedido #${String(detailOrder.id).padStart(5, '0')}? Essa ação não pode ser desfeita.`}
                    confirmLabel="Sim, cancelar"
                    cancelLabel="Voltar"
                    variant="danger"
                    onConfirm={() => {
                        setConfirmCancel(false)
                        handleStatusChange('cancelado')
                    }}
                    onCancel={() => setConfirmCancel(false)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}

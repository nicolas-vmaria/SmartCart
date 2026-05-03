import { useState, useRef, useEffect, useMemo } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Search, Trash2, Eye, X, SlidersHorizontal, FileText } from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const MIN = 0
const MAX = 3000

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

const initialOrders = [
    { id: '#1042', client: 'João Silva', product: 'Smart Cart Pro', quantity: 2, value: 2598.00, date: '02/05/2026', hour: '13:12', payment: 'Cartão de crédito', status: 'Entregue' },
    { id: '#1041', client: 'Maria Santos', product: 'Smart Cart Air', quantity: 1, value: 899.00, date: '01/05/2026', hour: '09:45', payment: 'Pix', status: 'Em trânsito' },
    { id: '#1040', client: 'Pedro Oliveira', product: 'Cabo de Recarga', quantity: 3, value: 267.00, date: '30/04/2026', hour: '17:30', payment: 'Boleto', status: 'Pendente' },
    { id: '#1039', client: 'Ana Costa', product: 'Smart Basket Pro', quantity: 1, value: 2199.00, date: '29/04/2026', hour: '11:08', payment: 'Cartão de débito', status: 'Entregue' },
    { id: '#1038', client: 'Carlos Mendes', product: 'Smart Cart Pro', quantity: 1, value: 1299.00, date: '28/04/2026', hour: '14:55', payment: 'Pix', status: 'Cancelado' },
    { id: '#1037', client: 'Lucas Ferreira', product: 'Suporte de Bateria', quantity: 4, value: 596.00, date: '27/04/2026', hour: '08:20', payment: 'Cartão de crédito', status: 'Pendente' },
    { id: '#1036', client: 'Beatriz Lima', product: 'Smart Cart Air', quantity: 2, value: 1798.00, date: '26/04/2026', hour: '16:03', payment: 'Boleto', status: 'Em trânsito' },
]

const statusStyle = {
    'Entregue':    'bg-green-100 text-green-700',
    'Em trânsito': 'bg-blue-100 text-blue-700',
    'Pendente':    'bg-yellow-100 text-yellow-700',
    'Cancelado':   'bg-red-100 text-red-700',
}

export default function AdminOrders() {
    const [orders, setOrders] = useState(initialOrders)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({ status: 'Todos', payment: 'Todos', valueMin: 0, valueMax: 3000, dateFrom: '', dateTo: '' })
    const [detail, setDetail] = useState(null)
    const filterRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setShowFilters(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const activeFiltersCount = [
        filters.status !== 'Todos',
        filters.payment !== 'Todos',
        filters.valueMin > 0 || filters.valueMax < 3000,
        filters.dateFrom !== '',
        filters.dateTo !== '',
    ].filter(Boolean).length

    const chartData = useMemo(() => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const counts = {}
        orders.forEach(o => {
            const [day, m, y] = o.date.split('/').map(Number)
            if (m - 1 === month && y === year) counts[day] = (counts[day] || 0) + o.quantity
        })

        const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'))
        const data = labels.map((_, i) => counts[i + 1] || 0)

        return {
            labels,
            datasets: [{
                label: 'Produtos pedidos',
                data,
                backgroundColor: 'rgba(22, 163, 74, 0.15)',
                borderColor: '#16a34a',
                borderWidth: 2,
                borderRadius: 6,
            }]
        }
    }, [orders])

    const filtered = orders.filter(o => {
        const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.client.toLowerCase().includes(search.toLowerCase()) ||
            o.product.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filters.status === 'Todos' || o.status === filters.status
        const matchPayment = filters.payment === 'Todos' || o.payment === filters.payment
        const matchValue = o.value >= filters.valueMin && o.value <= filters.valueMax

        const matchDate = (() => {
            if (!filters.dateFrom && !filters.dateTo) return true
            const [day, month, year] = o.date.split('/').map(Number)
            const orderDate = new Date(year, month - 1, day)
            if (filters.dateFrom && orderDate < new Date(filters.dateFrom)) return false
            if (filters.dateTo && orderDate > new Date(filters.dateTo)) return false
            return true
        })()

        return matchSearch && matchStatus && matchPayment && matchValue && matchDate
    })

    const allSelected = filtered.length > 0 && filtered.every(o => selected.includes(o.id))

    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    function toggleAll() {
        if (allSelected) {
            setSelected(prev => prev.filter(id => !filtered.map(o => o.id).includes(id)))
        } else {
            setSelected(prev => [...new Set([...prev, ...filtered.map(o => o.id)])])
        }
    }

    function deleteSelected() {
        setOrders(prev => prev.filter(o => !selected.includes(o.id)))
        setSelected([])
    }

    function generateInvoice(order) {
        const unitPrice = (order.value / order.quantity).toFixed(2).replace('.', ',')
        const total = order.value.toFixed(2).replace('.', ',')

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <title>Nota Fiscal - ${order.id}</title>
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
        .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
            background: ${order.status === 'Entregue' ? '#dcfce7' : order.status === 'Cancelado' ? '#fee2e2' : order.status === 'Em trânsito' ? '#dbeafe' : '#fef9c3'};
            color: ${order.status === 'Entregue' ? '#15803d' : order.status === 'Cancelado' ? '#dc2626' : order.status === 'Em trânsito' ? '#1d4ed8' : '#a16207'};
        }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
        @media print { body { padding: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="brand">SmartCart<span>Loja Inteligente</span></div>
        <div class="invoice-info">
            <strong>NOTA FISCAL</strong>
            Pedido: ${order.id}<br/>
            Data: ${order.date} às ${order.hour}<br/>
            Status: <span class="status">${order.status}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Dados do cliente</div>
        <div class="info-row"><span>Nome</span><span>${order.client}</span></div>
        <div class="info-row"><span>Pagamento</span><span>${order.payment}</span></div>
    </div>

    <div class="section">
        <div class="section-title">Itens do pedido</div>
        <table>
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Qtd.</th>
                    <th>Preço unit.</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${order.product}</td>
                    <td>${order.quantity}</td>
                    <td>R$ ${unitPrice}</td>
                    <td>R$ ${total}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3">Total</td>
                    <td>R$ ${total}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — SmartCart &copy; ${new Date().getFullYear()}
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

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por pedido, cliente ou produto..."
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
                                    {['Todos', 'Pendente', 'Em trânsito', 'Entregue', 'Cancelado'].map(opt => (
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, status: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.status === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Pagamento</label>
                                    {['Todos', 'Pix', 'Cartão de crédito', 'Cartão de débito', 'Boleto'].map(opt => (
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, payment: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.payment === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt}
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
                                        <input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={e => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                                            className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-2 py-1.5 text-xs outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Até</label>
                                        <input
                                            type="date"
                                            value={filters.dateTo}
                                            min={filters.dateFrom}
                                            onChange={e => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                                            className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-2 py-1.5 text-xs outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                        />
                                    </div>
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button onClick={() => setFilters({ status: 'Todos', payment: 'Todos', valueMin: 0, valueMax: 3000, dateFrom: '', dateTo: '' })}
                                        className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button onClick={deleteSelected}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all">
                            <Trash2 size={15} />
                            Excluir {selected.length} selecionado(s)
                        </button>
                    )}

                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted) ml-auto">{filtered.length} pedido(s)</span>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 pr-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                            </th>
                            <th className="pb-3 font-medium">Pedido</th>
                            <th className="pb-3 font-medium">Cliente</th>
                            <th className="pb-3 font-medium">Produto</th>
                            <th className="pb-3 font-medium">Qtd.</th>
                            <th className="pb-3 font-medium">Valor</th>
                            <th className="pb-3 font-medium">Data e hora</th>
                            <th className="pb-3 font-medium">Pagamento</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <tr key={order.id} className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 ${selected.includes(order.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                <td className="py-3 pr-3">
                                    <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleOne(order.id)} className="cursor-pointer" />
                                </td>
                                <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{order.id}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.client}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.product}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.quantity}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">R${order.value.toFixed(2).replace('.', ',')}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{`${order.date} - ${order.hour}`}</td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.payment}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <button onClick={() => setDetail(order)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                        <Eye size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">Nenhum pedido encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">
                    Pedidos em {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][new Date().getMonth()]}
                </h2>
                <div className="h-52">
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
                </div>
            </div>

            {detail && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-sm shadow-xl dark:shadow-black/40">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">Pedido {detail.id}</h2>
                            <button onClick={() => setDetail(null)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Cliente</span>
                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detail.client}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Produto</span>
                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detail.product}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Quantidade</span>
                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detail.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Valor</span>
                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">R${detail.value.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Pagamento</span>
                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">{detail.payment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Data</span>
                                <span className="font-medium text-gray-700 dark:text-(--admin-text)">{`${detail.date} - ${detail.hour}`}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 dark:text-(--admin-text-muted)">Status</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[detail.status]}`}>{detail.status}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => generateInvoice(detail)}
                            className="mt-5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-verde-escuro text-verde-escuro dark:text-(--admin-accent) dark:border-(--admin-accent) text-sm font-medium hover:bg-green-50 dark:hover:bg-(--admin-hover) transition-all"
                        >
                            <FileText size={15} />
                            Gerar Nota Fiscal
                        </button>

                        <div className="mt-4 flex flex-col gap-2">
                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Alterar status</p>
                            <div className="flex flex-wrap gap-2">
                                {['Pendente', 'Em trânsito', 'Entregue', 'Cancelado'].map(s => (
                                    <button key={s}
                                        onClick={() => {
                                            setOrders(prev => prev.map(o => o.id === detail.id ? { ...o, status: s } : o))
                                            setDetail(prev => ({ ...prev, status: s }))
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${detail.status === s ? statusStyle[s] + ' border-transparent' : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

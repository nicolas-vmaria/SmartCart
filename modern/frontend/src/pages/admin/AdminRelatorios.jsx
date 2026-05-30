import { useState, useEffect, useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, BarElement, Tooltip, Legend
} from 'chart.js'
import { useTheme } from '../../context/ThemeContext'
import AdminHeader from '../../components/admin/AdminHeader'
import { Banknote, ShoppingCart, TrendingUp, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { getOrderAnalytics } from '../../lib/api/adminOrders'
import { getHighlights } from '../../lib/api/products'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function fmt(value) {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function KpiCard({ icon: Icon, title, value, sub }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border) flex flex-col gap-3">
            <div className="flex items-center gap-2 text-verde-escuro dark:text-(--admin-accent)">
                <Icon size={20} />
                <span className="text-sm font-medium">{title}</span>
            </div>
            <p className="text-3xl font-bold truncate text-gray-800 dark:text-(--admin-text)">{value}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{sub}</p>}
        </div>
    )
}

function KpiSkeleton() {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border) flex flex-col gap-3 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 dark:bg-(--admin-hover) rounded" />
            <div className="h-9 w-40 bg-gray-200 dark:bg-(--admin-hover) rounded" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-(--admin-hover) rounded" />
        </div>
    )
}

export default function AdminRelatorios() {
    const now = new Date()
    const [mes, setMes]           = useState(now.getMonth() + 1)
    const [ano, setAno]           = useState(now.getFullYear())
    const [analytics, setAnalytics] = useState([])
    const [topProdutos, setTopProdutos] = useState([])
    const [loading, setLoading]   = useState(true)
    const [loadingTop, setLoadingTop] = useState(true)
    const { dark } = useTheme()

    useEffect(() => {
        setLoading(true)
        getOrderAnalytics(mes, ano)
            .then(res => setAnalytics(res.data.analytics ?? []))
            .catch(() => setAnalytics([]))
            .finally(() => setLoading(false))
    }, [mes, ano])

    useEffect(() => {
        getHighlights()
            .then(res => setTopProdutos(res.data.best_sellers ?? []))
            .catch(() => setTopProdutos([]))
            .finally(() => setLoadingTop(false))
    }, [])

    function navMes(delta) {
        let m = mes + delta
        let a = ano
        if (m < 1)  { m = 12; a -= 1 }
        if (m > 12) { m = 1;  a += 1 }
        if (a > now.getFullYear() || (a === now.getFullYear() && m > now.getMonth() + 1)) return
        setMes(m)
        setAno(a)
    }

    const isFuturo = ano === now.getFullYear() && mes === now.getMonth() + 1

    const totalFaturamento = useMemo(() => analytics.reduce((acc, d) => acc + Number(d.valor), 0), [analytics])
    const totalPedidos     = useMemo(() => analytics.reduce((acc, d) => acc + Number(d.pedidos), 0), [analytics])
    const ticketMedio      = totalPedidos ? totalFaturamento / totalPedidos : 0

    const diasNoMes = new Date(ano, mes, 0).getDate()
    const labels    = Array.from({ length: diasNoMes }, (_, i) => String(i + 1))

    const faturamentoData = labels.map(dia => {
        const entry = analytics.find(d => Number(d.dia) === Number(dia))
        return entry ? Number(entry.valor) : 0
    })
    const pedidosData = labels.map(dia => {
        const entry = analytics.find(d => Number(d.dia) === Number(dia))
        return entry ? Number(entry.pedidos) : 0
    })

    const gridColor = dark ? '#242424' : '#f3f4f6'
    const tickColor = dark ? '#666666' : '#9ca3af'
    const baseScales = {
        x: { grid: { color: gridColor }, ticks: { color: tickColor, maxTicksLimit: 10 }, border: { color: gridColor } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor }, border: { color: gridColor } },
    }

    const lineData = {
        labels,
        datasets: [{
            label: 'Faturamento (R$)',
            data: faturamentoData,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
        }],
    }

    const barData = {
        labels,
        datasets: [{
            label: 'Pedidos',
            data: pedidosData,
            backgroundColor: 'rgba(22,163,74,0.7)',
            borderRadius: 4,
        }],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: baseScales,
    }

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: dark ? '#e8e8e8' : '#374151', font: { size: 12 }, padding: 12 },
            },
        },
        scales: baseScales,
    }

    function exportCSV() {
        const rows = [
            ['Dia', 'Pedidos', 'Faturamento (R$)'],
            ...labels.map((dia, i) => [dia, pedidosData[i], faturamentoData[i].toFixed(2)]),
            [],
            ['Total', totalPedidos, totalFaturamento.toFixed(2)],
            ['Ticket Médio', '', ticketMedio.toFixed(2)],
            [],
            ['Produtos mais vendidos'],
            ['#', 'Produto', 'Unid. vendidas'],
            ...topProdutos.map((p, i) => [i + 1, p.nome, Number(p.total_vendido)]),
        ]
        const csv  = rows.map(r => r.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `relatorio_${MESES[mes - 1]}_${ano}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const totalFatTop = topProdutos.reduce((acc, p) => acc + (Number(p.total_vendido) || 0), 0)

    return (
        <main>
            <div className="flex items-start justify-between flex-wrap gap-3">
                <AdminHeader title="Relatórios" description="Análise de faturamento e pedidos por período." />
                <button onClick={exportCSV}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all mt-1">
                    <Download size={15} />
                    Exportar CSV
                </button>
            </div>

            {/* Seletor mês/ano */}
            <div className="mt-5 flex items-center gap-3">
                <button onClick={() => navMes(-1)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-(--admin-border) hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-500 dark:text-(--admin-text-muted)">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-gray-700 dark:text-(--admin-text) min-w-36 text-center">
                    {MESES[mes - 1]} {ano}
                </span>
                <button onClick={() => navMes(1)} disabled={isFuturo}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-(--admin-border) hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-500 dark:text-(--admin-text-muted) disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* KPI cards */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {loading ? (
                    <><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></>
                ) : (
                    <>
                        <KpiCard icon={Banknote}     title="Faturamento"       value={fmt(totalFaturamento)} sub={`${totalPedidos} pedidos no mês`} />
                        <KpiCard icon={ShoppingCart} title="Total de pedidos"  value={totalPedidos}           sub={`em ${MESES[mes - 1]} ${ano}`} />
                        <KpiCard icon={TrendingUp}   title="Ticket médio"      value={fmt(ticketMedio)}       sub="por pedido" />
                    </>
                )}
            </div>

            {/* Gráficos */}
            <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
                    <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-lg mb-4">Faturamento diário</h2>
                    <div className="h-64">
                        {loading
                            ? <div className="h-full bg-gray-100 dark:bg-(--admin-hover) rounded-xl animate-pulse" />
                            : <Line data={lineData} options={chartOptions} />
                        }
                    </div>
                </div>

                <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
                    <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-lg mb-4">Pedidos por dia</h2>
                    <div className="h-64">
                        {loading
                            ? <div className="h-full bg-gray-100 dark:bg-(--admin-hover) rounded-xl animate-pulse" />
                            : <Bar data={barData} options={barOptions} />
                        }
                    </div>
                </div>
            </div>

            {/* Top produtos */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
                <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-lg mb-4">Produtos mais vendidos</h2>
                {loadingTop ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-10 bg-gray-100 dark:bg-(--admin-hover) rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : topProdutos.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Nenhum dado disponível.</p>
                ) : (
                    <div className="overflow-x-auto -mx-5 px-5">
                        <table className="w-full min-w-120 text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                                    <th className="pb-3 font-medium">#</th>
                                    <th className="pb-3 font-medium">Produto</th>
                                    <th className="pb-3 font-medium">Unid. vendidas</th>
                                    <th className="pb-3 font-medium">Share</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProdutos.map((produto, i) => {
                                    const share = totalFatTop > 0
                                        ? ((Number(produto.total_vendido) / totalFatTop) * 100).toFixed(1)
                                        : '0.0'
                                    return (
                                        <tr key={produto.id} className="border-b border-gray-50 dark:border-(--admin-border) last:border-0">
                                            <td className="py-3 text-gray-400 dark:text-(--admin-text-muted) font-medium">{i + 1}</td>
                                            <td className="py-3 font-medium text-gray-700 dark:text-(--admin-text)">{produto.nome}</td>
                                            <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{Number(produto.total_vendido).toLocaleString('pt-BR')}</td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-(--admin-hover) rounded-full overflow-hidden">
                                                        <div className="h-full bg-verde-escuro dark:bg-(--admin-accent) rounded-full" style={{ width: `${share}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-400 dark:text-(--admin-text-muted) w-10 text-right">{share}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}

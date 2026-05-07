import { useState, useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, BarElement, Tooltip, Legend
} from 'chart.js'
import { useTheme } from '../../context/ThemeContext'
import AdminHeader from '../../components/admin/AdminHeader'
import { Banknote, ShoppingCart, TrendingUp, XCircle, Download } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const periodos = ['7 dias', '30 dias', 'Este ano']

const mockData = {
    '7 dias': {
        labels: ['01/05', '02/05', '03/05', '04/05', '05/05', '06/05', '07/05'],
        faturamento: [4200, 3800, 5100, 6200, 4900, 7300, 5800],
        pedidos:     [12,   10,   14,   17,   13,   20,   16],
        cancelados:  [1,    0,    2,    1,    0,    1,    2],
    },
    '30 dias': {
        labels:      ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
        faturamento: [18500, 22300, 19800, 25100],
        pedidos:     [52, 61, 55, 70],
        cancelados:  [3, 4, 2, 5],
    },
    'Este ano': {
        labels:      ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
        faturamento: [12000,19000,15000,25000,22000,30000,12000,19000,15000,25000,22000,30000],
        pedidos:     [34,52,41,68,60,82,34,52,41,68,60,82],
        cancelados:  [2,3,2,4,3,5,2,3,2,4,3,5],
    },
}

const topProdutos = [
    { name: 'Smart Cart Pro',    vendas: 340, faturamento: 441660 },
    { name: 'Smart Basket Pro',  vendas: 210, faturamento: 461790 },
    { name: 'Smart Cart Air',    vendas: 180, faturamento: 161820 },
    { name: 'Acessórios',        vendas: 95,  faturamento: 14725  },
    { name: 'Outros',            vendas: 60,  faturamento: 8940   },
]

function fmt(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function KpiCard({ icon: Icon, title, value, sub, highlight }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border) flex flex-col gap-3">
            <div className={`flex items-center gap-2 ${highlight ? 'text-red-500' : 'text-verde-escuro dark:text-(--admin-accent)'}`}>
                <Icon size={20} />
                <span className="text-sm font-medium">{title}</span>
            </div>
            <p className={`text-3xl font-bold truncate ${highlight ? 'text-red-500' : 'text-gray-800 dark:text-(--admin-text)'}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{sub}</p>}
        </div>
    )
}

export default function AdminRelatorios() {
    const [periodo, setPeriodo] = useState('Este ano')
    const { dark } = useTheme()

    const d = mockData[periodo]

    const totalFaturamento = useMemo(() => d.faturamento.reduce((a, b) => a + b, 0), [d])
    const totalPedidos     = useMemo(() => d.pedidos.reduce((a, b) => a + b, 0), [d])
    const totalCancelados  = useMemo(() => d.cancelados.reduce((a, b) => a + b, 0), [d])
    const ticketMedio      = totalPedidos ? totalFaturamento / totalPedidos : 0
    const taxaCancelamento = totalPedidos ? (totalCancelados / totalPedidos) * 100 : 0

    const gridColor = dark ? '#242424' : '#f3f4f6'
    const tickColor = dark ? '#666666' : '#9ca3af'

    const baseScales = {
        x: { grid: { color: gridColor }, ticks: { color: tickColor }, border: { color: gridColor } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor }, border: { color: gridColor } },
    }

    const lineData = {
        labels: d.labels,
        datasets: [{
            label: 'Faturamento (R$)',
            data: d.faturamento,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22,163,74,0.1)',
            fill: true,
            tension: 0.4,
        }],
    }

    const barData = {
        labels: d.labels,
        datasets: [
            {
                label: 'Pedidos',
                data: d.pedidos,
                backgroundColor: 'rgba(22,163,74,0.7)',
                borderRadius: 6,
            },
            {
                label: 'Cancelados',
                data: d.cancelados,
                backgroundColor: 'rgba(239,68,68,0.6)',
                borderRadius: 6,
            },
        ],
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
            ['Período', 'Faturamento (R$)', 'Pedidos', 'Cancelados'],
            ...d.labels.map((label, i) => [label, d.faturamento[i], d.pedidos[i], d.cancelados[i]]),
            [],
            ['Total', totalFaturamento, totalPedidos, totalCancelados],
            ['Ticket Médio', ticketMedio.toFixed(2), '', ''],
            ['Taxa Cancelamento (%)', taxaCancelamento.toFixed(1), '', ''],
        ]
        const csv = rows.map(r => r.join(';')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio_${periodo.replace(' ', '_')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <main>
            <div className="flex items-start justify-between flex-wrap gap-3">
                <AdminHeader title="Relatórios" description="Análise de faturamento, pedidos e desempenho." />
                <button onClick={exportCSV}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all mt-1">
                    <Download size={15} />
                    Exportar CSV
                </button>
            </div>

            {/* Period selector */}
            <div className="mt-5 flex gap-2">
                {periodos.map(p => (
                    <button key={p} onClick={() => setPeriodo(p)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            periodo === p
                                ? 'bg-verde-escuro text-white'
                                : 'bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:border-verde-escuro dark:hover:border-(--admin-accent)'
                        }`}>
                        {p}
                    </button>
                ))}
            </div>

            {/* KPI cards */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard icon={Banknote}    title="Faturamento"         value={fmt(totalFaturamento)} sub={`${totalPedidos} pedidos no período`} />
                <KpiCard icon={ShoppingCart} title="Total de pedidos"   value={totalPedidos}          sub={`${totalCancelados} cancelados`} />
                <KpiCard icon={TrendingUp}   title="Ticket médio"       value={fmt(ticketMedio)}      sub="por pedido concluído" />
                <KpiCard icon={XCircle}      title="Taxa de cancelamento" value={`${taxaCancelamento.toFixed(1)}%`} sub={`${totalCancelados} pedido(s) cancelado(s)`} highlight={taxaCancelamento > 10} />
            </div>

            {/* Charts */}
            <div className="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
                    <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-lg mb-4">Faturamento</h2>
                    <div className="h-64">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
                    <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-lg mb-4">Pedidos vs. Cancelados</h2>
                    <div className="h-64">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Top produtos */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
                <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-lg mb-4">Top produtos</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 font-medium">#</th>
                            <th className="pb-3 font-medium">Produto</th>
                            <th className="pb-3 font-medium">Vendas</th>
                            <th className="pb-3 font-medium">Faturamento</th>
                            <th className="pb-3 font-medium">Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topProdutos.map((produto, i) => {
                            const share = ((produto.faturamento / topProdutos.reduce((a, b) => a + b.faturamento, 0)) * 100).toFixed(1)
                            return (
                                <tr key={produto.name} className="border-b border-gray-50 dark:border-(--admin-border) last:border-0">
                                    <td className="py-3 text-gray-400 dark:text-(--admin-text-muted) font-medium">{i + 1}</td>
                                    <td className="py-3 font-medium text-gray-700 dark:text-(--admin-text)">{produto.name}</td>
                                    <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{produto.vendas}</td>
                                    <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{fmt(produto.faturamento)}</td>
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
        </main>
    )
}

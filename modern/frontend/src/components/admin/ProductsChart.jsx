import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7']

export default function ProductsChart({ data = [], loading = false }) {
    const { dark } = useTheme()

    const chartData = {
        labels: data.map(p => p.nome),
        datasets: [{
            data: data.map(p => Number(p.total_vendido)),
            backgroundColor: COLORS.slice(0, data.length),
            borderWidth: 0,
        }],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 16, font: { size: 12 }, color: dark ? '#e8e8e8' : '#374151' },
            },
        },
    }

    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">Produtos vendidos</h2>
            <div className="h-64 my-15 flex items-center justify-center">
                {loading
                    ? <div className="w-48 h-48 rounded-full bg-gray-100 dark:bg-(--admin-hover) animate-pulse" />
                    : data.length === 0
                        ? <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Nenhum produto vendido ainda.</p>
                        : <Doughnut data={chartData} options={options} />
                }
            </div>
        </div>
    )
}

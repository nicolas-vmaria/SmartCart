import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Graph({ data = [], loading = false }) {
    const { dark } = useTheme()

    const gridColor = dark ? '#242424' : '#f3f4f6'
    const tickColor = dark ? '#666666' : '#9ca3af'

    const chartData = {
        labels: MESES,
        datasets: [{
            label: 'Faturamento',
            data: data.length === 12 ? data.map(d => d.valor) : Array(12).fill(0),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            fill: true,
            tension: 0.4,
        }],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: gridColor }, ticks: { color: tickColor }, border: { color: gridColor } },
            y: { grid: { color: gridColor }, ticks: { color: tickColor }, border: { color: gridColor } },
        },
    }

    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">Faturamento mensal</h2>
            <div className="h-88">
                {loading
                    ? <div className="h-full bg-gray-100 dark:bg-(--admin-hover) rounded-xl animate-pulse" />
                    : <Line data={chartData} options={options} />
                }
            </div>
        </div>
    )
}

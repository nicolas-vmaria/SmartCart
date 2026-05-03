import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = {
    labels: ['Smart Cart Pro', 'Smart Basket Pro', 'Smart Cart Air', 'Acessórios', 'Outros'],
    datasets: [
        {
            data: [340, 210, 180, 95, 60],
            backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
            borderWidth: 0,
        },
    ],
}

export default function ProductsChart() {
    const { dark } = useTheme()

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 16,
                    font: { size: 12 },
                    color: dark ? '#e8e8e8' : '#374151',
                },
            },
        },
    }

    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">Produtos vendidos</h2>
            <div className="h-64 my-15">
                <Doughnut data={chartData} options={options} />
            </div>
        </div>
    )
}

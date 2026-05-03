const orders = [
    { id: '#1042', client: 'João Silva',     product: 'Smart Cart Pro',   value: 'R$1.299,00', status: 'Entregue' },
    { id: '#1041', client: 'Maria Santos',   product: 'Smart Cart Air',   value: 'R$899,00',   status: 'Em trânsito' },
    { id: '#1040', client: 'Pedro Oliveira', product: 'Acessórios',       value: 'R$149,00',   status: 'Pendente' },
    { id: '#1039', client: 'Ana Costa',      product: 'Smart Basket Pro', value: 'R$2.199,00', status: 'Entregue' },
    { id: '#1038', client: 'Carlos Mendes',  product: 'Smart Cart Pro',   value: 'R$1.299,00', status: 'Cancelado' },
]

const statusStyle = {
    'Entregue':    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Em trânsito': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Pendente':    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Cancelado':   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function RecentOrders() {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">Pedidos recentes</h2>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                        <th className="pb-3 font-medium">Pedido</th>
                        <th className="pb-3 font-medium">Cliente</th>
                        <th className="pb-3 font-medium">Produto</th>
                        <th className="pb-3 font-medium">Valor</th>
                        <th className="pb-3 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 dark:border-(--admin-border) last:border-0">
                            <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{order.id}</td>
                            <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.client}</td>
                            <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.product}</td>
                            <td className="py-3 text-gray-600 dark:text-(--admin-text)">{order.value}</td>
                            <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[order.status]}`}>
                                    {order.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

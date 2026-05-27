import { useState, useEffect } from 'react'
import { getAdminOrders } from '../../lib/api/adminOrders'

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

const fmt = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function SkeletonRow() {
    return (
        <tr className="border-b border-gray-50 dark:border-(--admin-border) animate-pulse">
            <td className="py-3 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-12" /></td>
            <td className="py-3 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-28" /></td>
            <td className="py-3 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-10" /></td>
            <td className="py-3 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-20" /></td>
            <td className="py-3"><div className="h-5 bg-gray-200 dark:bg-(--admin-border) rounded-full w-20" /></td>
        </tr>
    )
}

export default function RecentOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAdminOrders()
            .then(({ data }) => setOrders((data.orders ?? []).slice(0, 5)))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl mb-4">Pedidos recentes</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-125">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 font-medium">Pedido</th>
                            <th className="pb-3 font-medium">Cliente</th>
                            <th className="pb-3 font-medium">Itens</th>
                            <th className="pb-3 font-medium">Valor</th>
                            <th className="pb-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            : orders.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">
                                            Nenhum pedido encontrado.
                                        </td>
                                    </tr>
                                )
                                : orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-50 dark:border-(--admin-border) last:border-0">
                                        <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">#{order.id}</td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)  max-w-36 truncate">{order.cliente}</td>
                                        <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{order.qtd_itens}</td>
                                        <td className="py-3 text-gray-600 dark:text-(--admin-text)">{fmt(order.total)}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[order.status] ?? ''}`}>
                                                {STATUS_LABEL[order.status] ?? order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

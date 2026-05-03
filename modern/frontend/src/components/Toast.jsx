import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const config = {
    success: {
        container: 'bg-white border-l-4 border-l-green-500',
        icon: CheckCircle,
        iconClass: 'text-green-500',
        titleClass: 'text-gray-800',
    },
    error: {
        container: 'bg-white border-l-4 border-l-red-500',
        icon: AlertCircle,
        iconClass: 'text-red-500',
        titleClass: 'text-gray-800',
    },
    warning: {
        container: 'bg-white border-l-4 border-l-amber-400',
        icon: AlertTriangle,
        iconClass: 'text-amber-400',
        titleClass: 'text-gray-800',
    },
}

export default function Toast({ message, type = 'success', onClose }) {
    const { container, icon: Icon, iconClass, titleClass } = config[type] ?? config.success

    useEffect(() => {
        const t = setTimeout(onClose, 4000)
        return () => clearTimeout(t)
    }, [])

    return (
        <div className={`fixed bottom-6 right-6 flex items-start gap-3 ${container} rounded-xl px-5 py-4 shadow-2xl w-80`}>
            <Icon size={20} className={`${iconClass} shrink-0 mt-0.5`} />
            <p className={`text-sm font-medium flex-1 ${titleClass}`}>{message}</p>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer shrink-0 mt-0.5">
                <X size={16} />
            </button>
        </div>
    )
}

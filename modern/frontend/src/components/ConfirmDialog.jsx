import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', onConfirm, onCancel }) {
    const colors = {
        danger:  { btn: 'bg-red-500 hover:bg-red-600 text-white', icon: 'bg-red-100 text-red-500' },
        warning: { btn: 'bg-amber-500 hover:bg-amber-600 text-white', icon: 'bg-amber-100 text-amber-500' },
    }
    const c = colors[variant] ?? colors.danger

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">

                <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${c.icon}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{message}</p>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${c.btn}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

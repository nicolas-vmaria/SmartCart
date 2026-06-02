import { useState, useEffect } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Moon, Sun, Monitor, Bell, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { getAdminConfiguracoes, updateConfiguracoes } from '../../lib/api/adminConfiguracoes'
import Toast from '../../components/Toast'

function Section({ title, children }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
            <h2 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{title}</h2>
            {children}
        </div>
    )
}

function Row({ icon: Icon, label, description, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 dark:text-(--admin-text-muted) shrink-0">
                    <Icon size={16} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-(--admin-text)">{label}</p>
                    {description && <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{description}</p>}
                </div>
            </div>
            <div className="sm:shrink-0">{children}</div>
        </div>
    )
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-verde-escuro dark:bg-(--admin-accent)' : 'bg-gray-200 dark:bg-(--admin-border)'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    )
}

const themeOptions = [
    { value: 'light',  label: 'Claro',   icon: Sun },
    { value: 'dark',   label: 'Escuro',  icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
]

export default function AdminSettings() {
    const { dark, setDark } = useTheme()
    const [themeMode, setThemeMode] = useState(() => {
        const saved = localStorage.getItem('themeMode')
        return saved || (dark ? 'dark' : 'light')
    })
    const [notifications, setNotifications] = useState({
        newOrders:    true,
        lowStock:     true,
        newClients:   false,
        systemAlerts: true,
    })
    const [loading, setLoading]   = useState(true)
    const [saving, setSaving]     = useState(false)
    const [toast, setToast]       = useState(null)

    useEffect(() => {
        let cancelled = false
        getAdminConfiguracoes()
            .then(res => {
                if (cancelled) return
                const cfg = res.data.configuracoes ?? {}
                setNotifications({
                    newOrders:    cfg.notify_novos_pedidos   !== '0',
                    lowStock:     cfg.notify_estoque_baixo   !== '0',
                    newClients:   cfg.notify_novos_curriculos  !== '0',
                    systemAlerts: cfg.notify_alertas_sistema !== '0',
                })
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    function handleThemeChange(value) {
        setThemeMode(value)
        localStorage.setItem('themeMode', value)
        if (value === 'dark') {
            setDark(true)
        } else if (value === 'light') {
            setDark(false)
        } else {
            setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
        }
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        try {
            await updateConfiguracoes({
                notify_novos_pedidos:   notifications.newOrders    ? '1' : '0',
                notify_estoque_baixo:   notifications.lowStock     ? '1' : '0',
                notify_novos_curriculos:  notifications.newClients   ? '1' : '0',
                notify_alertas_sistema: notifications.systemAlerts ? '1' : '0',
            })
            window.dispatchEvent(new CustomEvent('config:updated'))
            setToast({ message: 'Configurações salvas com sucesso.', type: 'success' })
        } catch {
            setToast({ message: 'Erro ao salvar configurações.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <AdminHeader title="Configurações" description="Personalize o sistema conforme suas preferências." />

            <form onSubmit={handleSave} className="mt-5 flex flex-col gap-5">

                <Section title="Aparência">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Tema</p>
                        <div className="grid grid-cols-3 gap-3">
                            {themeOptions.map(opt => {
                                const Icon = opt.icon
                                const active = themeMode === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleThemeChange(opt.value)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                            active
                                                ? 'border-verde-escuro dark:border-(--admin-accent) bg-green-50 dark:bg-(--admin-accent-soft)'
                                                : 'border-gray-200 dark:border-(--admin-border) hover:border-gray-300 dark:hover:border-(--admin-text-muted)'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            active
                                                ? 'bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black'
                                                : 'bg-gray-100 dark:bg-(--admin-hover) text-gray-400 dark:text-(--admin-text-muted)'
                                        }`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className={`text-sm font-medium ${active ? 'text-verde-escuro dark:text-(--admin-accent)' : 'text-gray-500 dark:text-(--admin-text-muted)'}`}>
                                            {opt.label}
                                        </span>
                                        {active && (
                                            <span className="flex items-center gap-1 text-xs text-verde-escuro dark:text-(--admin-accent) font-medium">
                                                <Check size={11} /> Ativo
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </Section>

                <Section title="Notificações">
                    {loading ? (
                        <div className="flex flex-col gap-4 animate-pulse">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-(--admin-hover)" />
                                        <div className="flex flex-col gap-1.5">
                                            <div className="h-3 w-32 bg-gray-200 dark:bg-(--admin-hover) rounded" />
                                            <div className="h-2.5 w-48 bg-gray-100 dark:bg-(--admin-hover) rounded" />
                                        </div>
                                    </div>
                                    <div className="w-11 h-6 rounded-full bg-gray-200 dark:bg-(--admin-hover)" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <Row icon={Bell} label="Novos pedidos" description="Notificar quando um novo pedido for realizado">
                                <Toggle checked={notifications.newOrders} onChange={v => setNotifications(p => ({ ...p, newOrders: v }))} />
                            </Row>
                            <Row icon={Bell} label="Estoque baixo" description="Notificar quando um produto tiver estoque abaixo de 10">
                                <Toggle checked={notifications.lowStock} onChange={v => setNotifications(p => ({ ...p, lowStock: v }))} />
                            </Row>
                            <Row icon={Bell} label="Novos currículos" description="Notificar quando um novo currículo for enviado">
                                <Toggle checked={notifications.newClients} onChange={v => setNotifications(p => ({ ...p, newClients: v }))} />
                            </Row>
                            <Row icon={Bell} label="Alertas do sistema" description="Erros e avisos críticos do sistema">
                                <Toggle checked={notifications.systemAlerts} onChange={v => setNotifications(p => ({ ...p, systemAlerts: v }))} />
                            </Row>
                        </>
                    )}
                </Section>

                <div className="flex justify-end">
                    <button type="submit" disabled={saving || loading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin dark:border-black dark:border-t-transparent" />}
                        {saving ? 'Salvando...' : 'Salvar configurações'}
                    </button>
                </div>
            </form>
        </main>
    )
}

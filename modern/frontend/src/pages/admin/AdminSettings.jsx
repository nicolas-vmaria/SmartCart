import { useState } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Moon, Sun, Monitor, Bell, Store, Globe, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

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
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 dark:text-(--admin-text-muted) shrink-0">
                    <Icon size={16} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-(--admin-text)">{label}</p>
                    {description && <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{description}</p>}
                </div>
            </div>
            <div className="shrink-0">{children}</div>
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

const inputClass = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-1.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all w-52"

export default function AdminSettings() {
    const { dark, setDark } = useTheme()
    const [themeMode, setThemeMode] = useState(() => {
        const saved = localStorage.getItem('themeMode')
        return saved || (dark ? 'dark' : 'light')
    })
    const [notifications, setNotifications] = useState({
        newOrders: true,
        lowStock: true,
        newClients: false,
        systemAlerts: true,
    })
    const [storeInfo, setStoreInfo] = useState({
        name: 'SmartCart',
        email: 'contato@smartcart.com',
        phone: '(11) 99999-9999',
        address: 'Rua Exemplo, 123 – São Paulo, SP',
    })
    const [saved, setSaved] = useState(false)

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

    function handleSave(e) {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <main>
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
                    <Row icon={Bell} label="Novos pedidos" description="Notificar quando um novo pedido for realizado">
                        <Toggle checked={notifications.newOrders} onChange={v => setNotifications(p => ({ ...p, newOrders: v }))} />
                    </Row>
                    <Row icon={Bell} label="Estoque baixo" description="Notificar quando um produto tiver estoque abaixo de 10">
                        <Toggle checked={notifications.lowStock} onChange={v => setNotifications(p => ({ ...p, lowStock: v }))} />
                    </Row>
                    <Row icon={Bell} label="Novos clientes" description="Notificar quando um cliente novo se cadastrar">
                        <Toggle checked={notifications.newClients} onChange={v => setNotifications(p => ({ ...p, newClients: v }))} />
                    </Row>
                    <Row icon={Bell} label="Alertas do sistema" description="Erros e avisos críticos do sistema">
                        <Toggle checked={notifications.systemAlerts} onChange={v => setNotifications(p => ({ ...p, systemAlerts: v }))} />
                    </Row>
                </Section>

                <Section title="Informações da loja">
                    <Row icon={Store} label="Nome da loja" description="Exibido em notas fiscais e relatórios">
                        <input type="text" value={storeInfo.name} onChange={e => setStoreInfo(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                    </Row>
                    <Row icon={Globe} label="Email de contato">
                        <input type="email" value={storeInfo.email} onChange={e => setStoreInfo(p => ({ ...p, email: e.target.value }))} className={inputClass} />
                    </Row>
                    <Row icon={Store} label="Telefone">
                        <input type="text" value={storeInfo.phone} onChange={e => setStoreInfo(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
                    </Row>
                    <Row icon={Store} label="Endereço">
                        <input type="text" value={storeInfo.address} onChange={e => setStoreInfo(p => ({ ...p, address: e.target.value }))} className={inputClass} />
                    </Row>
                </Section>

                <div className="flex justify-end">
                    <button type="submit"
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-green-100 dark:bg-(--admin-accent-soft) text-verde-escuro dark:text-(--admin-accent)' : 'bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black hover:opacity-90'}`}>
                        {saved ? <><Check size={15} /> Salvo!</> : 'Salvar configurações'}
                    </button>
                </div>
            </form>
        </main>
    )
}

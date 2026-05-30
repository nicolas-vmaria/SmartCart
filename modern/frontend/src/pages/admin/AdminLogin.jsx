import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Toast from '../../components/Toast'
import logoPadrao from '../../assets/smartcart-logo-transparente.png'
import logoPreto from '../../assets/smartcart-logo-transparente-preto.png'
import { useTheme } from '../../context/ThemeContext'
import { loginAdmin } from '../../lib'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [showSenha, setShowSenha] = useState(false)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const navigate = useNavigate()
    const { dark } = useTheme()

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const { data } = await loginAdmin(email, senha)

            localStorage.setItem('admin_token', data.token)
            localStorage.setItem('admin_user', JSON.stringify(data.user))
            navigate('/admin')
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao conectar com o servidor.'
            setToast({ message: msg, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className={`${dark ? 'dark' : ''} min-h-screen bg-gray-100 dark:bg-(--admin-bg) flex items-center justify-center px-4`}>

            {/* Logo */}
            <Link to="/" className="absolute top-6 left-8">
                <img src={dark ? logoPadrao : logoPreto} alt="SmartCart" className="w-36 h-auto" />
            </Link>

            <div className="w-full max-w-md">

                {/* Badge */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2 bg-verde-escuro/10 border border-verde-escuro/30 text-verde-escuro dark:bg-(--admin-accent-soft) dark:border-(--admin-accent)/30 dark:text-(--admin-accent) text-xs font-bold px-4 py-1.5 rounded-full">
                        <ShieldCheck size={13} />
                        Área Administrativa
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-8 shadow-xl dark:shadow-black/40">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-(--admin-text)">Acesso restrito</h1>
                        <p className="text-gray-500 dark:text-(--admin-text-muted) text-sm mt-1">Entre com suas credenciais de administrador</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-600 dark:text-(--admin-text-muted)">E-mail</label>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-(--admin-input) border border-gray-200 dark:border-(--admin-border) rounded-xl px-4 h-12 focus-within:border-verde-escuro dark:focus-within:border-(--admin-accent)/60 transition-colors">
                                <Mail size={16} className="text-gray-400 dark:text-(--admin-text-muted) shrink-0" />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@smartcart.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-transparent text-gray-900 dark:text-(--admin-text) text-sm outline-none w-full placeholder:text-gray-400 dark:placeholder:text-(--admin-text-muted)/50"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-600 dark:text-(--admin-text-muted)">Senha</label>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-(--admin-input) border border-gray-200 dark:border-(--admin-border) rounded-xl px-4 h-12 focus-within:border-verde-escuro dark:focus-within:border-(--admin-accent)/60 transition-colors">
                                <Lock size={16} className="text-gray-400 dark:text-(--admin-text-muted) shrink-0" />
                                <input
                                    type={showSenha ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    className="bg-transparent text-gray-900 dark:text-(--admin-text) text-sm outline-none w-full placeholder:text-gray-400 dark:placeholder:text-(--admin-text-muted)/50 flex-1"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSenha(v => !v)}
                                    className="text-gray-400 dark:text-(--admin-text-muted) hover:text-gray-600 dark:hover:text-(--admin-text) transition-colors cursor-pointer shrink-0"
                                >
                                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 h-12 bg-verde-escuro dark:bg-(--admin-accent) text-verde-claro dark:text-black font-bold rounded-xl hover:opacity-90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-verde-escuro/20 dark:hover:shadow-(--admin-accent)/20 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-(--admin-border) text-center">
                        <Link to="/" className="text-xs text-gray-400 dark:text-(--admin-text-muted) hover:text-gray-600 dark:hover:text-(--admin-text) transition-colors">
                            ← Voltar ao site
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-(--admin-text-muted)/50 mt-4">
                    Acesso monitorado. Use apenas credenciais autorizadas.
                </p>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, Lock, Mail, Phone, User, MapPin, Package, ChevronRight, LogOut } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import { getProfile, updateProfile, updateAddress, updatePassword } from '../lib/api/profile'

const inputCls = "border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro transition-colors w-full"

function maskTel(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2)  return digits.replace(/(\d{0,2})/, '($1')
    if (digits.length <= 7)  return digits.replace(/(\d{2})(\d{1,5})/, '($1) $2')
    if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3')
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}
const labelCls = "text-sm font-bold text-gray-600 mb-1 block"

const STATUS_LABEL = {
    aguardando: 'Aguardando',
    pago: 'Pago',
    enviado: 'Em trânsito',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
}
const STATUS_COLOR = {
    aguardando: 'bg-yellow-100 text-yellow-700',
    pago:       'bg-blue-100 text-blue-700',
    enviado:    'bg-blue-100 text-blue-700',
    entregue:   'bg-green-100 text-green-700',
    cancelado:  'bg-red-100 text-red-700',
}

function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
            {children}
        </div>
    )
}

function SectionTitle({ children }) {
    return <h2 className="font-bold text-verde-escuro text-base mb-4">{children}</h2>
}

function ProfileSkeleton() {
    return (
        <main className="min-h-screen bg-gray-50 animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="max-w-5xl mx-auto px-6 pb-16">
                <div className="flex items-end gap-6 -mt-14 mb-8">
                    <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 shrink-0 shadow-lg" />
                    <div className="mb-2 flex flex-col gap-2">
                        <div className="h-6 bg-gray-200 rounded w-48" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-20" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl border border-gray-200 h-60" />
                        <div className="bg-white rounded-2xl border border-gray-200 h-60" />
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-200 h-60" />
                </div>
            </div>
        </main>
    )
}

export default function UserProfile() {
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [orders, setOrders] = useState([])
    const [toast, setToast] = useState(null)
    const [confirmLogout, setConfirmLogout] = useState(false)
    const [info, setInfo] = useState({ nome: '', tel: '' })
    const [savingInfo, setSavingInfo] = useState(false)
    const [savedInfo, setSavedInfo] = useState(false)

    const [endereco, setEndereco] = useState({ cep: '', rua: '', numero: '', complemento: '', cidade: '', estado: '' })
    const [savingEnd, setSavingEnd] = useState(false)
    const [savedEnd, setSavedEnd] = useState(false)

    const [passwords, setPasswords] = useState({ senha_atual: '', nova_senha: '', confirmar_senha: '' })
    const [savingPass, setSavingPass] = useState(false)
    const [savedPass, setSavedPass] = useState(false)
    const [showPass, setShowPass] = useState({ senha_atual: false, nova_senha: false, confirmar_senha: false })

    const navigate = useNavigate()

    useEffect(() => {
        getProfile()
            .then(res => {
                const p = res.data.profile
                setProfile(p)
                setOrders(res.data.orders ?? [])
                setInfo({ nome: p.nome ?? '', tel: p.tel ?? '' })
                setEndereco({
                    cep:         p.cep          ?? '',
                    rua:         p.rua          ?? '',
                    numero:      p.numero       ?? '',
                    complemento: p.complemento  ?? '',
                    cidade:      p.cidade       ?? '',
                    estado:      p.estado       ?? '',
                })
            })
            .catch(() => setToast({ message: 'Erro ao carregar perfil', type: 'error' }))
            .finally(() => setLoading(false))
    }, [])

    async function handleSaveInfo(e) {
        e.preventDefault()
        setSavingInfo(true)
        try {
            await updateProfile({ nome: info.nome, tel: info.tel })
            setProfile(p => ({ ...p, nome: info.nome, tel: info.tel }))
            localStorage.setItem('user_nome', info.nome)
            window.dispatchEvent(new Event('storage'))
            setSavedInfo(true)
            setTimeout(() => setSavedInfo(false), 2000)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao salvar', type: 'error' })
        } finally {
            setSavingInfo(false)
        }
    }

    async function handleSaveAddress(e) {
        e.preventDefault()
        setSavingEnd(true)
        try {
            await updateAddress(endereco)
            setSavedEnd(true)
            setTimeout(() => setSavedEnd(false), 2000)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao salvar endereço', type: 'error' })
        } finally {
            setSavingEnd(false)
        }
    }

    async function handleSavePassword(e) {
        e.preventDefault()
        setSavingPass(true)
        try {
            await updatePassword(passwords)
            setPasswords({ senha_atual: '', nova_senha: '', confirmar_senha: '' })
            setSavedPass(true)
            setTimeout(() => setSavedPass(false), 2000)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao alterar senha', type: 'error' })
        } finally {
            setSavingPass(false)
        }
    }

    function handleLogout() {
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_nome')
        window.dispatchEvent(new Event('storage'))
        navigate('/')
    }

    if (loading) return <ProfileSkeleton />

    const initials = (profile?.nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    const totalGasto = Number(profile?.total_gasto ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const membroDesde = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        : '—'

    return (
        <main className="min-h-screen bg-gray-50">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Banner */}
            <div className="h-44 bg-linear-65 from-verde-escuro to-green-700 relative">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-16">

                {/* Avatar + nome */}
                <div className="relative z-10 flex items-end gap-6 -mt-14 mb-8">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-verde-escuro flex items-center justify-center shrink-0">
                        <span className="text-verde-claro text-3xl font-bold">{initials}</span>
                    </div>

                    <div className="mb-2">
                        <h1 className="text-2xl font-bold text-gray-800">{profile?.nome}</h1>
                        <p className="text-gray-500 text-sm">{profile?.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Pedidos realizados', value: profile?.total_pedidos ?? 0 },
                        { label: 'Total gasto',        value: totalGasto },
                        { label: 'Membro desde',       value: membroDesde },
                    ].map(({ label, value }) => (
                        <Card key={label} className="text-center">
                            <p className="text-2xl font-bold text-verde-escuro">{value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Coluna principal */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Dados pessoais */}
                        <Card>
                            <SectionTitle>Dados pessoais</SectionTitle>
                            <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>
                                            <span className="flex items-center gap-1.5"><User size={13} /> Nome completo</span>
                                        </label>
                                        <input className={inputCls} value={info.nome} onChange={e => setInfo(p => ({ ...p, nome: e.target.value }))} required />
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            <span className="flex items-center gap-1.5"><Mail size={13} /> E-mail</span>
                                        </label>
                                        <input type="email" className={`${inputCls} bg-gray-50 cursor-not-allowed`} value={profile?.email ?? ''} readOnly />
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            <span className="flex items-center gap-1.5"><Phone size={13} /> Telefone</span>
                                        </label>
                                        <input className={inputCls} value={info.tel} onChange={e => setInfo(p => ({ ...p, tel: maskTel(e.target.value) }))} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={savingInfo}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60
                                            ${savedInfo ? 'bg-green-100 text-verde-escuro' : 'bg-verde-escuro text-white hover:opacity-90'}`}>
                                        {savingInfo && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {savedInfo ? <><Check size={14} /> Salvo!</> : 'Salvar alterações'}
                                    </button>
                                </div>
                            </form>
                        </Card>

                        {/* Endereço */}
                        <Card>
                            <SectionTitle><span className="flex items-center gap-2"><MapPin size={15} /> Endereço de entrega</span></SectionTitle>
                            <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>CEP</label>
                                        <input className={inputCls} value={endereco.cep} onChange={e => setEndereco(p => ({ ...p, cep: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Rua / Avenida</label>
                                        <input className={inputCls} value={endereco.rua} onChange={e => setEndereco(p => ({ ...p, rua: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Número</label>
                                        <input className={inputCls} value={endereco.numero} onChange={e => setEndereco(p => ({ ...p, numero: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Complemento</label>
                                        <input className={inputCls} value={endereco.complemento} onChange={e => setEndereco(p => ({ ...p, complemento: e.target.value }))} placeholder="Apto, sala, bloco..." />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Cidade</label>
                                        <input className={inputCls} value={endereco.cidade} onChange={e => setEndereco(p => ({ ...p, cidade: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Estado</label>
                                        <input className={inputCls} value={endereco.estado} onChange={e => setEndereco(p => ({ ...p, estado: e.target.value }))} maxLength={2} placeholder="SP" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={savingEnd}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60
                                            ${savedEnd ? 'bg-green-100 text-verde-escuro' : 'bg-verde-escuro text-white hover:opacity-90'}`}>
                                        {savingEnd && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {savedEnd ? <><Check size={14} /> Salvo!</> : 'Salvar endereço'}
                                    </button>
                                </div>
                            </form>
                        </Card>

                        {/* Alterar senha */}
                        <Card>
                            <SectionTitle><span className="flex items-center gap-2"><Lock size={15} /> Segurança</span></SectionTitle>
                            <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
                                {[
                                    { field: 'senha_atual',      label: 'Senha atual' },
                                    { field: 'nova_senha',       label: 'Nova senha' },
                                    { field: 'confirmar_senha',  label: 'Confirmar nova senha' },
                                ].map(({ field, label }) => (
                                    <div key={field}>
                                        <label className={labelCls}>{label}</label>
                                        <div className="relative">
                                            <input
                                                type={showPass[field] ? 'text' : 'password'}
                                                value={passwords[field]}
                                                onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                                                className={`${inputCls} pr-10`}
                                                placeholder="••••••••"
                                            />
                                            <button type="button"
                                                onClick={() => setShowPass(p => ({ ...p, [field]: !p[field] }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                                {showPass[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end">
                                    <button type="submit" disabled={savingPass}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60
                                            ${savedPass ? 'bg-green-100 text-verde-escuro' : 'bg-verde-escuro text-white hover:opacity-90'}`}>
                                        {savingPass && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {savedPass ? <><Check size={14} /> Senha alterada!</> : <><Lock size={14} /> Alterar senha</>}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Sidebar direita */}
                    <div className="flex flex-col gap-6">

                        {/* Pedidos recentes */}
                        <Card>
                            <SectionTitle><span className="flex items-center gap-2"><Package size={15} /> Pedidos recentes</span></SectionTitle>
                            <div className="flex flex-col gap-3">
                                {orders.length === 0
                                    ? <p className="text-sm text-gray-400">Nenhum pedido ainda.</p>
                                    : orders.map(order => (
                                        <div key={order.id} className="flex flex-col gap-1 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400">#{String(order.id).padStart(5, '0')}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {STATUS_LABEL[order.status] ?? order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{order.qtd_itens} {order.qtd_itens === 1 ? 'item' : 'itens'}</p>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                                                <span className="font-bold text-gray-600">
                                                    {Number(order.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <Link to="/meus-pedidos" className="flex items-center justify-center gap-1 mt-4 text-sm text-verde-escuro font-bold hover:underline">
                                Ver todos os pedidos <ChevronRight size={14} />
                            </Link>
                        </Card>

                        {/* Ações rápidas */}
                        <Card>
                            <SectionTitle>Ações rápidas</SectionTitle>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: 'Ir para produtos', to: '/produtos' },
                                    { label: 'Ver carrinho',     to: '/carrinho' },
                                    { label: 'Fale conosco',     to: '/contato'  },
                                ].map(({ label, to }) => (
                                    <Link key={to} to={to}
                                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-verde-escuro hover:bg-verde-escuro/5 transition-all text-sm font-bold text-gray-700">
                                        {label} <ChevronRight size={14} className="text-gray-400" />
                                    </Link>
                                ))}
                                <button onClick={() => setConfirmLogout(true)}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50 transition-all text-sm font-bold text-red-500">
                                    Sair da conta <LogOut size={14} />
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {confirmLogout && (
                <ConfirmDialog
                    title="Sair da conta"
                    message="Tem certeza que deseja sair da sua conta?"
                    confirmLabel="Sair"
                    onConfirm={handleLogout}
                    onCancel={() => setConfirmLogout(false)}
                />
            )}
        </main>
    )
}

import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Check, Eye, EyeOff, Lock, Mail, Phone, User, MapPin, Package, ChevronRight, LogOut } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'

const inputCls = "border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro transition-colors w-full"
const labelCls = "text-sm font-bold text-gray-600 mb-1 block"

const pedidos = [
    { id: '#SC-00042', produto: 'SmartCart Pro',  data: '28/04/2026', status: 'Entregue',   valor: 'R$ 920,99' },
    { id: '#SC-00031', produto: 'SmartCart Lite', data: '10/03/2026', status: 'Em trânsito', valor: 'R$ 540,00' },
    { id: '#SC-00018', produto: 'Kit Acessórios',  data: '02/01/2026', status: 'Entregue',   valor: 'R$ 189,90' },
]

const statusColor = {
    'Entregue':    'bg-green-100 text-green-700',
    'Em trânsito': 'bg-blue-100 text-blue-700',
    'Pendente':    'bg-yellow-100 text-yellow-700',
    'Cancelado':   'bg-red-100 text-red-700',
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

export default function UserProfile() {
    const [avatar, setAvatar] = useState(null)
    const [saved, setSaved] = useState(false)
    const [savedPass, setSavedPass] = useState(false)
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
    const [passError, setPassError] = useState('')
    const fileRef = useRef(null)
    const navigate = useNavigate()
    const [confirmLogout, setConfirmLogout] = useState(false)

    function handleLogout() {
        localStorage.removeItem('user_token')
        localStorage.removeItem('user_nome')
        navigate('/')
    }

    const [info, setInfo] = useState({
        nome: 'Felipe Barbosa',
        email: 'felipe@email.com',
        telefone: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90',
    })

    const [endereco, setEndereco] = useState({
        cep: '01310-100',
        rua: 'Av. Paulista',
        numero: '1000',
        complemento: 'Sala 12',
        cidade: 'São Paulo',
        estado: 'SP',
    })

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    const initials = info.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

    function handleAvatar(e) {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = ev => setAvatar(ev.target.result)
        reader.readAsDataURL(file)
    }

    function handleSave(e) {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    function handlePasswordSave(e) {
        e.preventDefault()
        setPassError('')
        if (!passwords.current) return setPassError('Informe a senha atual.')
        if (passwords.new.length < 6) return setPassError('A nova senha precisa ter ao menos 6 caracteres.')
        if (passwords.new !== passwords.confirm) return setPassError('As senhas não coincidem.')
        setPasswords({ current: '', new: '', confirm: '' })
        setSavedPass(true)
        setTimeout(() => setSavedPass(false), 2000)
    }

    return (
        <main className="min-h-screen bg-gray-50">

            {/* Banner */}
            <div className="h-44 bg-linear-65 from-verde-escuro to-green-700 relative">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-16">

                {/* Avatar + nome */}
                <div className="flex items-end gap-6 -mt-14 mb-8">
                    <div className="relative shrink-0">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-verde-escuro flex items-center justify-center">
                            {avatar
                                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                                : <span className="text-verde-claro text-3xl font-bold">{initials}</span>
                            }
                        </div>
                        <button
                            onClick={() => fileRef.current.click()}
                            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-verde-escuro text-white flex items-center justify-center hover:opacity-90 transition-all shadow-md"
                        >
                            <Camera size={14} />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                    </div>

                    <div className="mb-2">
                        <h1 className="text-2xl font-bold text-gray-800">{info.nome}</h1>
                        <p className="text-gray-500 text-sm">{info.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Pedidos realizados', value: '3' },
                        { label: 'Total gasto',        value: 'R$ 1.650,89' },
                        { label: 'Membro desde',       value: 'Jan 2026' },
                    ].map(({ label, value }) => (
                        <Card key={label} className="text-center">
                            <p className="text-2xl font-bold text-verde-escuro">{value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6">

                    {/* Coluna principal */}
                    <div className="col-span-2 flex flex-col gap-6">

                        {/* Dados pessoais */}
                        <Card>
                            <SectionTitle>Dados pessoais</SectionTitle>
                            <form onSubmit={handleSave} className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>
                                            <span className="flex items-center gap-1.5"><User size={13} /> Nome completo</span>
                                        </label>
                                        <input className={inputCls} value={info.nome} onChange={e => setInfo(p => ({ ...p, nome: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            <span className="flex items-center gap-1.5"><Mail size={13} /> E-mail</span>
                                        </label>
                                        <input type="email" className={inputCls} value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>
                                            <span className="flex items-center gap-1.5"><Phone size={13} /> Telefone</span>
                                        </label>
                                        <input className={inputCls} value={info.telefone} onChange={e => setInfo(p => ({ ...p, telefone: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>CNPJ</label>
                                        <input className={inputCls} value={info.cnpj} onChange={e => setInfo(p => ({ ...p, cnpj: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit"
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                                            ${saved ? 'bg-green-100 text-verde-escuro' : 'bg-verde-escuro text-white hover:opacity-90'}`}>
                                        {saved ? <><Check size={14} /> Salvo!</> : 'Salvar alterações'}
                                    </button>
                                </div>
                            </form>
                        </Card>

                        {/* Endereço */}
                        <Card>
                            <SectionTitle><span className="flex items-center gap-2"><MapPin size={15} /> Endereço de entrega</span></SectionTitle>
                            <div className="grid grid-cols-2 gap-4">
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
                                    <input className={inputCls} value={endereco.complemento} onChange={e => setEndereco(p => ({ ...p, complemento: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>Cidade</label>
                                    <input className={inputCls} value={endereco.cidade} onChange={e => setEndereco(p => ({ ...p, cidade: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>Estado</label>
                                    <input className={inputCls} value={endereco.estado} onChange={e => setEndereco(p => ({ ...p, estado: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button onClick={handleSave}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                                        ${saved ? 'bg-green-100 text-verde-escuro' : 'bg-verde-escuro text-white hover:opacity-90'}`}>
                                    {saved ? <><Check size={14} /> Salvo!</> : 'Salvar endereço'}
                                </button>
                            </div>
                        </Card>

                        {/* Alterar senha */}
                        <Card>
                            <SectionTitle><span className="flex items-center gap-2"><Lock size={15} /> Segurança</span></SectionTitle>
                            <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
                                {[
                                    { field: 'current', label: 'Senha atual' },
                                    { field: 'new',     label: 'Nova senha' },
                                    { field: 'confirm', label: 'Confirmar nova senha' },
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

                                {passError && <p className="text-sm text-red-500">{passError}</p>}

                                <div className="flex justify-end">
                                    <button type="submit"
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                                            ${savedPass ? 'bg-green-100 text-verde-escuro' : 'bg-verde-escuro text-white hover:opacity-90'}`}>
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
                                {pedidos.map(({ id, produto, data, status, valor }) => (
                                    <div key={id} className="flex flex-col gap-1 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400">{id}</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[status]}`}>{status}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">{produto}</p>
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>{data}</span>
                                            <span className="font-bold text-gray-600">{valor}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/produtos" className="flex items-center justify-center gap-1 mt-4 text-sm text-verde-escuro font-bold hover:underline">
                                Ver todos os pedidos <ChevronRight size={14} />
                            </Link>
                        </Card>

                        {/* Ações rápidas */}
                        <Card>
                            <SectionTitle>Ações rápidas</SectionTitle>
                            <div className="flex flex-col gap-2">
                                {[
                                    { label: 'Ir para produtos',  to: '/produtos' },
                                    { label: 'Ver carrinho',      to: '/carrinho' },
                                    { label: 'Fale conosco',      to: '/contato'  },
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

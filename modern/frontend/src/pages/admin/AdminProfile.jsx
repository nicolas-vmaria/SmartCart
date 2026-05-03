import { useState, useRef } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Camera, Check, Eye, EyeOff, Lock, Mail, Phone, User, Briefcase, FileText } from 'lucide-react'

const inputClass = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all w-full"
const labelClass = "text-sm text-gray-500 dark:text-(--admin-text-muted) mb-1 block"

function Section({ title, children }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
            <h2 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{title}</h2>
            {children}
        </div>
    )
}

export default function AdminProfile() {
    const [avatar, setAvatar] = useState(null)
    const [saved, setSaved] = useState(false)
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
    const fileRef = useRef(null)

    const [info, setInfo] = useState({
        name: 'Ciclano da Silva',
        email: 'ciclano@smartcart.com',
        phone: '(11) 99999-9999',
        role: 'Administrador',
        bio: '',
    })

    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
    const [passError, setPassError] = useState('')

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
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    function toggleShow(field) {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const initials = info.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

    return (
        <main>
            <AdminHeader title="Meu Perfil" description="Gerencie suas informações pessoais e de acesso." />

            <div className="mt-5 flex flex-col gap-5">

                {/* Avatar */}
                <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-verde-escuro dark:bg-(--admin-accent-soft) flex items-center justify-center">
                                {avatar
                                    ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                                    : <span className="text-white dark:text-(--admin-accent) text-2xl font-bold">{initials}</span>
                                }
                            </div>
                            <button
                                onClick={() => fileRef.current.click()}
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black flex items-center justify-center hover:opacity-90 transition-all shadow-md"
                            >
                                <Camera size={14} />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-(--admin-text)">{info.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-(--admin-text-muted)">{info.role}</p>
                            <p className="text-sm text-gray-400 dark:text-(--admin-text-muted) mt-0.5">{info.email}</p>
                            <button
                                onClick={() => fileRef.current.click()}
                                className="mt-3 text-xs text-verde-escuro dark:text-(--admin-accent) hover:underline transition-all"
                            >
                                Alterar foto
                            </button>
                        </div>
                    </div>
                </div>

                {/* Informações pessoais */}
                <Section title="Informações pessoais">
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><User size={13} /> Nome completo</span>
                                </label>
                                <input type="text" value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Briefcase size={13} /> Cargo</span>
                                </label>
                                <input type="text" value={info.role} onChange={e => setInfo(p => ({ ...p, role: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Mail size={13} /> Email</span>
                                </label>
                                <input type="email" value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Phone size={13} /> Telefone</span>
                                </label>
                                <input type="text" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                <span className="flex items-center gap-1.5"><FileText size={13} /> Bio</span>
                            </label>
                            <textarea
                                value={info.bio}
                                onChange={e => setInfo(p => ({ ...p, bio: e.target.value }))}
                                rows={3}
                                placeholder="Conte um pouco sobre você..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit"
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-green-100 dark:bg-(--admin-accent-soft) text-verde-escuro dark:text-(--admin-accent)' : 'bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black hover:opacity-90'}`}>
                                {saved ? <><Check size={15} /> Salvo!</> : 'Salvar alterações'}
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Alterar senha */}
                <Section title="Alterar senha">
                    <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
                        {[
                            { field: 'current', label: 'Senha atual' },
                            { field: 'new',     label: 'Nova senha' },
                            { field: 'confirm', label: 'Confirmar nova senha' },
                        ].map(({ field, label }) => (
                            <div key={field}>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Lock size={13} /> {label}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass[field] ? 'text' : 'password'}
                                        value={passwords[field]}
                                        onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                                        className={`${inputClass} pr-10`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow(field)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-(--admin-text-muted) hover:text-gray-600 dark:hover:text-(--admin-text) transition-all"
                                    >
                                        {showPass[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {passError && (
                            <p className="text-sm text-red-500 dark:text-red-400">{passError}</p>
                        )}

                        <div className="flex justify-end">
                            <button type="submit"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-medium hover:opacity-90 transition-all">
                                <Lock size={14} />
                                Alterar senha
                            </button>
                        </div>
                    </form>
                </Section>

            </div>
        </main>
    )
}

import { useEffect, useState } from "react"
import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/smartcart-logo-transparente.png'
import boxedWater from '../assets/boxed-water-is-better.webp'
import { registerUser } from "../lib"
import { googleLogin } from "../lib/api/authUser"
import Toast from "../components/Toast"
import { loadGsi } from '../lib/googleGsi'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Register() {
    useDocumentTitle('Criar conta')

    const navigate = useNavigate()

    useEffect(() => {
        loadGsi().catch(() => {})
    }, [])

    const [checked, setChecked] = useState(false)
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [tel, setTel] = useState('')
    const [senha, setSenha] = useState('')
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleGoogleClick = () => {
        if (!window.google) return
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: 'openid email profile',
            callback: async (tokenResponse) => {
                if (tokenResponse.error) return
                setLoading(true)
                try {
                    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    })
                    const userInfo = await userRes.json()
                    const { data } = await googleLogin(tokenResponse.access_token, userInfo)
                    localStorage.setItem('user_token', data.token)
                    localStorage.setItem('user_nome', data.user.nome)
                    sessionStorage.setItem('show_welcome_popup', '1')
                    navigate('/')
                } catch (err) {
                    setToast({ message: err.response?.data?.error || 'Falha ao conectar com Google', type: 'error' })
                } finally {
                    setLoading(false)
                }
            },
        })
        client.requestAccessToken({ prompt: 'select_account' })
    }

    function maskPhone(val) {
        const d = val.replace(/\D/g, '').slice(0, 11)
        if (d.length <= 2) return d
        if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
        return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    }

    const checkSVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m4.5 12.75 6 6 9-13.5'/%3E%3C%2Fsvg%3E")`

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            await registerUser(nome, email, senha, tel.replace(/\D/g, ''))
            navigate('/cadastro-confirmado', { state: { email } })
        } catch(err){
            setToast({ message: err.response?.data?.error || "Erro ao conectar no servidor", type: 'error'})
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen bg-gray-100">

            <Link to={"/"}><img src={logo} alt="SmartCart Logo" className='w-40 h-auto absolute right-10 top-0 z-10' /></Link>

            <section className="flex flex-col justify-center w-full md:w-200 min-h-screen overflow-y-auto bg-white px-8 md:px-16 py-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <h1 className="text-3xl text-red mb-4">Crie sua conta hoje mesmo!</h1>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm ml-1 font-bold">Nome:</label>
                        <input type="text" onChange={(e) => setNome(e.target.value)} className="bg-white h-12 border border-gray-200 rounded-xl px-4 box-border" placeholder="Insira seu nome:" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm ml-1 font-bold">E-mail:</label>
                        <input type="email" onChange={(e) => setEmail(e.target.value)} className="bg-white h-12 border border-gray-200 rounded-xl px-4 box-border" placeholder="Insira seu email:" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm ml-1 font-bold">Telefone:</label>
                        <input type="text" value={tel} onChange={(e) => setTel(maskPhone(e.target.value))} className="bg-white h-12 border border-gray-200 rounded-xl px-4 box-border" placeholder="(11) 99999-9999" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm ml-1 font-bold">Senha:</label>
                        <input type="password" onChange={(e) => setSenha(e.target.value)} className="bg-white h-12 border border-gray-200 rounded-xl px-4 box-border" placeholder="Insira sua senha:" required />
                    </div>

                    <div className="flex gap-3 items-start">
                        <input
                            type="checkbox"
                            checked={checked}
                            required
                            onChange={() => setChecked(!checked)}
                            style={{ backgroundImage: checked ? checkSVG : 'none' }}
                            className="appearance-none shrink-0 w-5 h-5 mt-0.5 border-2 border-gray-300 rounded cursor-pointer checked:bg-verde-escuro checked:border-red bg-size-[18px_18px]"
                        />
                        <p className="text-sm">Li e concordo com os <Link to={'/'} className="font-bold text-red cursor-pointer hover:underline">Termos de Uso</Link> e <Link to={'/'} className="font-bold text-red cursor-pointer hover:underline">Política de Privacidade.</Link></p>
                    </div>

                    <button disabled={loading} className='bg-verde-escuro text-white h-12 rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:bg-verde-claro active:text-verde-escuro cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2'>
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Cadastrando...' : 'Cadastre-se'}
                    </button>
                </form>

                <p className="pt-4 text-sm">Já possui uma conta? <Link to={'/login'} className="font-bold hover:text-red cursor-pointer hover:underline">Faça o login!</Link></p>

                <div className='flex w-full justify-center items-center py-4'>
                    <hr className='border border-gray-400 w-full' />
                    <p className='mx-4 text-gray-400 text-sm'>ou</p>
                    <hr className='border border-gray-400 w-full' />
                </div>

                <button onClick={handleGoogleClick} type="button" className='border border-gray-200 h-10 rounded-full w-full cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-50 transition-all'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                    Conectar com Google
                </button>
            </section>

            <section className="relative flex-1 w-full bg-verde-escuro">
                <img src={boxedWater} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-verde-escuro/60" />
            </section>

            {toast && <Toast message={toast.message} type={toast.type}/>}
        </main>
    )
}

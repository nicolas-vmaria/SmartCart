import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import logo from '../assets/smartcart-logo-transparente-preto.png'
import Toast from '../components/Toast'
import { loginUser, googleLogin } from '../lib/api/authUser'
import { getRateLimitMessage } from '../lib/rateLimitMessage'

export default function Login() {
    const [toast, setToast] = useState(null)
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try{
            const { data } = await loginUser(email, senha)
            localStorage.setItem('user_token', data.token)
            localStorage.setItem('user_nome', data.user.nome)
            navigate('/')

        } catch (err){
            setToast({ message: getRateLimitMessage(err, 'Falha ao conectar com servidor'), type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex justify-center items-center h-screen bg-gray-50">

            <Link to={"/"}><img src={logo} alt="Peccato Logo" className='w-40 h-auto absolute left-10 top-0' /></Link>
            <div className="flex flex-col items-center justify-center bg-white w-150 rounded-3xl p-15 shadow-xl">
                <div className='flex flex-col items-center p-10'>
                    <h1 className='text-3xl'>Bem-vindo de volta!</h1>
                    <p className='text-gray-500'>Faça login na sua Conta</p>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col gap-5 w-full '>
                    <div>
                        <label htmlFor="" className='text-[13pt] font-bold ml-1'>E-mail:</label>
                        <input type="email" placeholder='Digite seu e-mail' onChange={(e) => setEmail(e.target.value)} required className='bg-white w-full h-15 p-5 box-border rounded-xl border-1  border-gray-200' />
                    </div>
                    <div>
                        <label htmlFor="" className='text-[13pt] font-bold ml-1 mr-1'>Senha:</label>
                        <input type="password" onChange={(e) => setSenha(e.target.value)} placeholder='Digite sua senha' required className='bg-white w-full h-15 p-5 box-border rounded-xl border-1  border-gray-200' />
                        <Link to={"/forgot-password"} className='text-[13pt] hover:underline'>Esqueceu a senha?</Link>
                    </div>

                    <button disabled={loading} className='bg-verde-escuro text-white h-15 rounded-xl transition-all duration-100 hover:-translate-y-2 hover:shadow-xl active:translate-y-0 active:bg-verde-claro active:text-verde-escuro cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2'>
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Entrando...' : 'Login'}
                    </button>

                    <p className='text-[13pt]'>Não tem uma conta? <Link to={'/register'} className='font-bold hover:underline hover:text-red cursor-pointer'>Cadastre-se</Link></p>
                </form>

                <div className='flex w-full justify-center items-center m-5'>
                    <hr className='border-1 border-gray-400 w-full ' />
                    <p className='mr-5 ml-5 text-gray-400'>ou</p>
                    <hr className='border-1 border-gray-400 w-full ' />
                </div>

                <button onClick={handleGoogleClick} className='border-1 border-gray-200 h-10 rounded-4xl w-full cursor-pointer flex items-center justify-center gap-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                        <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                    Conectar com Google
                </button>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        </main>
    )
}

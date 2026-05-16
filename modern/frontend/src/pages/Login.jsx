import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import logo from '../assets/smartcart-logo-transparente-preto.png'
import Toast from '../components/Toast'
import { loginUser } from '../lib/api/authUser'

export default function Login() {
    const [toast, setToast] = useState(null)
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try{
            const { data } = await loginUser(email, senha)
            localStorage.setItem('user_token', data.token)
            navigate('/')

        } catch (err){
            setToast({ message: err.response?.data?.error || 'Falha ao conectar com servidor', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex justify-center items-center h-screen bg-gray-50  ">

            <Link to={"/"}><img src={logo} alt="Peccato Logo" className='w-40 h-auto absolute left-10 top-0' /></Link>
            <div className="flex flex-col  items-center justify-center bg-white w-150 rounded-3xl p-15 shadow-xl">
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

                <div className='flex flex-col gap-2 justify-center w-full'>
                    <button className='border-1 border-gray-200 h-10 rounded-4xl w-full'>Conectar com Google</button>
                    <button className='border-1 border-gray-200 h-10 rounded-4xl w-full'>Conectar com Apple</button>

                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
        </main>
    )
}
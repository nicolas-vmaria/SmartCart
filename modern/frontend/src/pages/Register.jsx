import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom'

import logo from '../assets/smartcart-logo-transparente.png'
import { registerUser } from "../lib"
import Toast from "../components/Toast"

export default function Register() {

    const navigate = useNavigate()

    const [checked, setChecked] = useState(false)
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false)

    const checkSVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m4.5 12.75 6 6 9-13.5'/%3E%3C%2Fsvg%3E")`

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await registerUser(nome, email, senha)
            localStorage.setItem('user_token', data.token)
            localStorage.setItem('user_nome', data.user.nome)
            navigate("/")
        } catch(err){
            setToast({ message: err.response?.data?.error || "Erro ao conectar no servidor", type: 'error'})
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex bg-gray-100">

            <Link to={"/"}><img src={logo} alt="SmartCart Logo" className='w-40 h-auto absolute right-10 top-0' /></Link>

            <section className="flex flex-col justify-center w-[800px] h-screen bg-white p-20 ">
                <form onSubmit={handleSubmit} className="flex flex-col gap-10 ">
                    <h1 className="text-3xl self-start text-red py-10 ">Crie sua conta hoje mesmo!</h1>

                    <div className="flex flex-col">
                        <label className="text-[13pt] ml-1 font-bold">Nome:</label>
                        <input type="text" onChange={(e) => setNome(e.target.value)} className="bg-white h-15 border-1 border-gray-200 rounded-xl p-5 box-border" placeholder="Insira seu nome:" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[13pt] ml-1 font-bold">E-mail:</label>
                        <input type="email" onChange={(e) => setEmail(e.target.value)} className="bg-white h-15 border-1 border-gray-200 rounded-xl p-5 box-border" placeholder="Insira seu email:" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[13pt] ml-1 font-bold">Senha:</label>
                        <input type="password" onChange={(e) => setSenha(e.target.value)} className="bg-white h-15 border-1 border-gray-200 rounded-xl p-5 box-border" placeholder="Insira sua senha:" required />
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="checkbox"
                            checked={checked}
                            required
                            onChange={() => setChecked(!checked)}
                            style={{ backgroundImage: checked ? checkSVG : 'none' }}
                            className="appearance-none w-6 h-6 border-2 border-gray-300 rounded cursor-pointer checked:bg-verde-escuro checked:border-red  bg-[length:20px_20px]"
                        />

                        <p>Li e concordo com os <Link to={'/'} className="font-bold text-red cursor-pointer hover:underline">Termos de Uso</Link> e <Link to={'/'} className="font-bold text-red cursor-pointer hover:underline">Política de Privacidade.</Link></p>
                    </div>

                    <button disabled={loading} className='bg-verde-escuro text-white h-15 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl active:translate-y-0 active:bg-verde-claro active:text-verde-escuro cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2'>
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {loading ? 'Cadastrando...' : 'Cadastre-se'}
                    </button>
                </form>

                <p className="pt-5">Já possui uma conta? <Link to={'/login'} className="font-bold hover:text-red cursor-pointer hover:underline">Faça o login!</Link></p>

                <div className='flex w-full justify-center items-center py-5'>
                    <hr className='border-1 border-gray-400 w-full ' />
                    <p className='mr-5 ml-5 text-gray-400'>ou</p>
                    <hr className='border-1 border-gray-400 w-full ' />
                </div>

                <div className='flex flex-col gap-2 justify-center w-full'>
                    <button className='border-1 border-gray-200 h-10 rounded-4xl '>Conectar com Google</button>
                    <button className='border-1 border-gray-200 h-10 rounded-4xl '>Conectar com Google</button>

                </div>
            </section>
            <section className="flex-1 w-full bg-verde-escuro bg-cover bg-center bg-no-repeat">

            </section>

            {toast && <Toast message={toast.message} type={toast.type}/>}
        </main>
    )
}
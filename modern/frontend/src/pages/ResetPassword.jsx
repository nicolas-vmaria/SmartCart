import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import logo from '../assets/smartcart-logo-transparente-preto.png'
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react'
import Toast from '../components/Toast'
import { resetPasswordUser } from '../lib/api/authUser'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()

    const [senha, setSenha] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [concluido, setConcluido] = useState(false)
    const [toast, setToast] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()

        if (senha !== confirmar) {
            setToast({ message: 'As senhas não coincidem.', type: 'error' })
            return
        }

        try{
            const { data } = await resetPasswordUser(token, senha)
            setConcluido(true)
        }catch(err){
            setToast({message: err.response?.data?.error || 'Erro ao conectar com servidor', type: 'error'})
        }
    }

    if (concluido) {
        return (
            <main className="flex justify-center items-center h-screen bg-gray-50">
                <Link to="/"><img src={logo} alt="SmartCart" className="w-40 h-auto absolute left-10 top-5" /></Link>
                <div className="flex flex-col items-center bg-white w-150 rounded-3xl p-15 shadow-xl gap-5 text-center">
                    <div className="w-16 h-16 rounded-full bg-verde-escuro/10 flex items-center justify-center">
                        <CheckCircle className="text-verde-escuro" size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Senha redefinida!</h1>
                        <p className="text-gray-500 mt-2 text-sm">Sua senha foi atualizada com sucesso.</p>
                    </div>
                    <Link to="/login" className="bg-verde-escuro text-white px-8 py-3 rounded-xl font-bold hover:-translate-y-1 transition-all hover:shadow-xl">
                        Fazer login
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="flex justify-center items-center h-screen bg-gray-50">

            <Link to="/"><img src={logo} alt="SmartCart" className="w-40 h-auto absolute left-10 top-5" /></Link>

            <div className="flex flex-col items-center bg-white w-150 rounded-3xl p-15 shadow-xl">

                <div className="flex flex-col items-center gap-2 mb-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-verde-escuro/10 flex items-center justify-center mb-2">
                        <KeyRound className="text-verde-escuro" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold">Nova senha</h1>
                    <p className="text-gray-500 text-sm max-w-xs">Digite e confirme sua nova senha abaixo.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                    <div>
                        <label className="text-[13pt] font-bold ml-1">Nova senha:</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            placeholder="Digite sua nova senha"
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            className="bg-white w-full h-15 p-5 box-border rounded-xl border-1 border-gray-200 mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-[13pt] font-bold ml-1">Confirmar senha:</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            placeholder="Confirme sua nova senha"
                            value={confirmar}
                            onChange={e => setConfirmar(e.target.value)}
                            className="bg-white w-full h-15 p-5 box-border rounded-xl border-1 border-gray-200 mt-1"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-verde-escuro text-white h-15 rounded-xl transition-all duration-100 hover:-translate-y-2 hover:shadow-xl active:translate-y-0 active:bg-verde-claro active:text-verde-escuro cursor-pointer font-bold"
                    >
                        Redefinir senha
                    </button>
                </form>

                <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-6">
                    <ArrowLeft size={14} /> Voltar ao login
                </Link>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}

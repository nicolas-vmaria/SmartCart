import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/smartcart-logo-transparente-preto.png'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { forgotUser } from '../lib/api/authUser'
import Toast from '../components/Toast'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [toast, setToast] = useState(null)
    const [enviado, setEnviado] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try{
            const { data } = await forgotUser(email)
            setEnviado(true)
            

        }catch(err){
            setToast({ message: err.response?.data?.error || 'Erro ao conectar com o servidor', type: 'error'})
            setLoading(false)
        }
        
        
    }

    return (
        <main className="flex justify-center items-center h-screen bg-gray-50">

            <Link to="/"><img src={logo} alt="SmartCart" className="w-40 h-auto absolute left-10 top-5" /></Link>

            <div className="flex flex-col items-center bg-white w-150 rounded-3xl p-15 shadow-xl">

                {enviado ? (
                    <div className="flex flex-col items-center gap-5 text-center py-5">
                        <div className="w-16 h-16 rounded-full bg-verde-escuro/10 flex items-center justify-center">
                            <CheckCircle className="text-verde-escuro" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">E-mail enviado!</h1>
                            <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-xs">
                                Enviamos as instruções de redefinição para <strong>{email}</strong>. Verifique sua caixa de entrada.
                            </p>
                        </div>
                        <p className="text-xs text-gray-400">Não recebeu? Verifique o spam ou <button onClick={() => setEnviado(false)} className="text-verde-escuro font-bold hover:underline cursor-pointer">tente novamente</button>.</p>
                        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2">
                            <ArrowLeft size={14} /> Voltar ao login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-2 mb-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-verde-escuro/10 flex items-center justify-center mb-2">
                                <Mail className="text-verde-escuro" size={24} />
                            </div>
                            <h1 className="text-3xl font-bold">Esqueceu a senha?</h1>
                            <p className="text-gray-500 text-sm max-w-xs">Informe seu e-mail e enviaremos um link para você redefinir sua senha.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                            <div>
                                <label className="text-[13pt] font-bold ml-1">E-mail:</label>
                                <input
                                    type="email"
                                    required
                                    disabled={loading}
                                    placeholder="Digite seu e-mail"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-white w-full h-15 p-5 box-border rounded-xl border-1 border-gray-200 mt-1"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-verde-escuro text-white h-15 rounded-xl transition-all duration-100 hover:-translate-y-2 hover:shadow-xl active:translate-y-0 active:bg-verde-claro active:text-verde-escuro cursor-pointer font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enviar link de redefinição'}
                            </button>
                        </form>

                        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-6">
                            <ArrowLeft size={14} /> Voltar ao login
                        </Link>
                    </>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}

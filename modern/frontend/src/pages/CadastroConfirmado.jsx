import { Link, useLocation } from "react-router-dom"
import { Mail } from "lucide-react"
import logo from '../assets/smartcart-logo-transparente-preto.png'

export default function CadastroConfirmado() {
    const { state } = useLocation()
    const email = state?.email ?? ''

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center flex flex-col items-center gap-5">
                <Link to="/"><img src={logo} alt="SmartCart" className="w-28 h-auto" /></Link>

                <div className="bg-green-50 rounded-full p-4">
                    <Mail size={40} className="text-verde-escuro" />
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold text-gray-800">Confirme seu e-mail</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Enviamos um link de confirmação para{' '}
                        {email && <span className="font-semibold text-gray-700">{email}</span>}.
                        {' '}Clique no link para ativar sua conta.
                    </p>
                </div>

                <p className="text-xs text-gray-400">
                    Não recebeu? Verifique a caixa de spam.
                </p>

                <Link
                    to="/login"
                    className="bg-verde-escuro text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all"
                >
                    Ir para o login
                </Link>
            </div>
        </div>
    )
}

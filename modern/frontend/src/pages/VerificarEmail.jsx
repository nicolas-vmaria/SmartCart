import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { verifyEmail } from "../lib/api/authUser"

export default function VerificarEmail() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") ?? ""

    const [status, setStatus] = useState("loading")

    useEffect(() => {
        if (!token) { setStatus("error"); return }
        verifyEmail(token)
            .then(() => setStatus("success"))
            .catch(() => setStatus("error"))
    }, [token])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center flex flex-col items-center gap-5">
                {status === "loading" && (
                    <>
                        <Loader2 size={48} className="text-verde-escuro animate-spin" />
                        <p className="text-gray-500">Verificando seu e-mail...</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <CheckCircle size={48} className="text-green-500" />
                        <h1 className="text-xl font-bold text-gray-800">E-mail confirmado!</h1>
                        <p className="text-gray-500 text-sm">Sua conta está ativa. Você já pode fazer login.</p>
                        <Link
                            to="/login"
                            className="bg-verde-escuro text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all"
                        >
                            Fazer login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <XCircle size={48} className="text-red-400" />
                        <h1 className="text-xl font-bold text-gray-800">Link inválido</h1>
                        <p className="text-gray-500 text-sm">Este link de verificação é inválido ou já foi utilizado.</p>
                        <Link
                            to="/register"
                            className="text-verde-escuro text-sm font-medium hover:underline"
                        >
                            Criar nova conta
                        </Link>
                    </>
                )}
            </div>
        </div>
    )
}

import { Link } from "react-router-dom"

export default function NotFound() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-verde-escuro gap-6">
            <h1 className="text-[5rem] sm:text-[8rem] md:text-[10rem] font-black text-verde-claro leading-none">404</h1>
            <p className="text-2xl text-white">Página não encontrada.</p>
            <p className="text-verde-claro/60 text-center max-w-sm">
                O endereço que você acessou não existe ou foi removido.
            </p>
            <Link
                to="/"
                className="mt-4 border-2 border-verde-claro text-verde-claro px-8 py-3 rounded-full transition-all duration-300 hover:bg-verde-claro hover:text-verde-escuro"
            >
                Voltar para o início
            </Link>
        </main>
    )
}

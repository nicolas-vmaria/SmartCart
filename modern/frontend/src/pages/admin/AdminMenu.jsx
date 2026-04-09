import { LayoutDashboard } from 'lucide-react'

export default function AdminMenu() {
    return (
        <aside className="w-100 h-screen bg-verde-escuro  flex flex-col justify-between p-5 text-white">
            <div>
                <div className="flex items-center gap-2 ">
                    <div className="flex border-1 border-verde-claro aspect-square w-12 h-12 rounded-full justify-center items-center">
                        <p>user</p>
                    </div>

                    <div className="">
                        <h1 className="text-white font-bold text-xl">Ciclano da Silva</h1>
                        <p className="text-white">Admin</p>
                    </div>
                </div>

                <div>
                    <ul className="flex flex-col gap-2 py-5">
                        <h1 className="font-bold text-xl text-verde-escuro-escarlate">Geral</h1>
                        <div className='flex flex-col gap-4'>
                            <li className="cursor-pointer flex gap-2">
                                <LayoutDashboard />
                                Dashboard
                            </li>
                            <li className="cursor-pointer">Usuários</li>
                            <li className="cursor-pointer">Produtos</li>
                            <li className="cursor-pointer">Pedidos</li>
                        </div>

                    </ul>

                    <hr className="text-green-800" />

                    <ul className="py-5">
                        <h1 className="font-bold text-xl text-verde-escuro-escarlate">Admin</h1>
                        <li className="cursor-pointer">Gerenciar usuários</li>
                        <li className="cursor-pointer">Ajuda</li>
                        <li className="cursor-pointer">Configurações</li>
                    </ul>
                </div>

            </div>

            <div></div>
        </aside>
    )
}
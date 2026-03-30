import { IoIosStar } from "react-icons/io";
import { Link } from "react-router-dom";

export default function ProdutoCard() {
    return (
        <div className="flex flex-col bg-white border-1 border-gray-200 w-90 h-120 rounded-2xl shadow-xl/20 p-5 mx-5 my-10 cursor-pointer transition-all hover:scale-105">
            <Link to={'/produto/p'}>
                
                <div className="bg-gray-100 w-full h-85 rounded-xl">
                    <img src="" alt="" />
                </div>
                <div className="flex justify-between py-2">
                    <h1 className="text-xl font-bold w-40 truncate">Carrinho Maneiro</h1>
                    <div className="flex items-center gap-1">
                        <IoIosStar />
                        <h1>4.9</h1>
                    </div>
                </div>
                <div>
                    <h1>R$ 939,93</h1>
                </div>
            </Link>
        </div>
    )
}
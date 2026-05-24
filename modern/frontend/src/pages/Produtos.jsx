import { useEffect, useState } from "react";
import Carroussel from "../components/Carroussel";
import SwiperDisplay from "../components/SwiperDisplay";
import { getProducts } from "../lib/api/products";
import { FaTruck } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa6";

export default function Produtos(){
    const [produtos, setProdutos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProducts()
            .then(res => setProdutos(res.data.products))
            .finally(() => setLoading(false))
    }, [])

    return(
        <>
            <Carroussel />

            <BenefitsBar />

            <SwiperDisplay title="Mais Vendidos" produtos={produtos} loading={loading} />

            <SwiperDisplay title="Lançamentos" produtos={produtos} loading={loading} />
        </>
    )
}

function BenefitsBar(){
    return (
        <div className="flex flex-wrap gap-30 py-10 px-10 justify-center">
            <div className="flex items-center gap-5">
                <FaTruck className="text-6xl text-verde-escuro" />

                <div className="">
                    <h1 className="font-bold text-xl text-verde-escuro">Frete Grátis</h1>
                    <p className="text-gray-500">Para todo o Brasil!</p>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <FiClock className="text-6xl text-verde-escuro" />

                <div className="w-50">
                    <h1 className="font-bold text-xl text-verde-escuro">Garantia de 2 Anos</h1>
                    <p className="text-gray-500">Não se preocupe, nossos produtos duram</p>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <FaArrowsRotate className="text-6xl text-verde-escuro" />

                <div className="w-50">
                    <h1 className="font-bold text-xl text-verde-escuro">Devolução Grátis</h1>
                    <p className="text-gray-500">Você tem até 30 dias para devolver seu produto</p>
                </div>
            </div>
            <div className="flex items-center gap-5">
                <FaCreditCard className="text-6xl text-verde-escuro" />

                <div className="">
                    <h1 className="font-bold text-xl text-verde-escuro">Parcele em até 12x s/ juros</h1>
                    <p className="text-gray-500">Cabe para todo o bolso!</p>
                </div>
            </div>
        </div>
    )
}

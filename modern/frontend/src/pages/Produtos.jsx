import { useEffect, useState } from "react";
import Carroussel from "../components/Carroussel";
import SwiperDisplay from "../components/SwiperDisplay";
import { getProducts } from "../lib/api/products";
import { FaTruck } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa6";
import { useConfiguracoes } from "../hooks/useConfiguracoes";

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

function BenefitsBar() {
    const { config } = useConfiguracoes()

    const items = [
        { icon: FaTruck,       titulo: config.beneficio_1_titulo    || 'Frete Grátis',            descricao: config.beneficio_1_descricao || 'Para todo o Brasil!'                          },
        { icon: FiClock,       titulo: config.beneficio_2_titulo    || 'Garantia de 2 Anos',       descricao: config.beneficio_2_descricao || 'Não se preocupe, nossos produtos duram'       },
        { icon: FaArrowsRotate,titulo: config.beneficio_3_titulo    || 'Devolução Grátis',         descricao: config.beneficio_3_descricao || 'Você tem até 30 dias para devolver seu produto'},
        { icon: FaCreditCard,  titulo: config.beneficio_4_titulo    || 'Parcele em até 12x s/ juros', descricao: config.beneficio_4_descricao || 'Cabe para todo o bolso!'                  },
    ]

    return (
        <div className="flex flex-wrap gap-30 py-10 px-10 justify-center">
            {items.map(({ icon: Icon, titulo, descricao }) => (
                <div key={titulo} className="flex items-center gap-5">
                    <Icon className="text-6xl text-verde-escuro" />
                    <div>
                        <h1 className="font-bold text-xl text-verde-escuro">{titulo}</h1>
                        <p className="text-gray-500">{descricao}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Carroussel from "../components/Carroussel";
import SwiperDisplay from "../components/SwiperDisplay";
import ProdutoCard from "../components/ProdutoCard";
import { getHighlights, getProdutosDestaque } from "../lib/api/products";
import { getCategories } from "../lib/api/categories";
import { FaTruck } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa6";
import { Flame, Sparkles, Star, Tag } from "lucide-react";
import { useConfiguracoes } from "../hooks/useConfiguracoes";

export default function Produtos() {
    const [maisVendidos, setMaisVendidos] = useState([])
    const [lancamentos, setLancamentos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [destaques, setDestaques] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.allSettled([
            getHighlights(),
            getCategories(),
            getProdutosDestaque(),
        ]).then(([highlights, cats, dest]) => {
            if (highlights.status === 'fulfilled') {
                setMaisVendidos(highlights.value.data.best_sellers ?? [])
                setLancamentos(highlights.value.data.new_arrivals ?? [])
            }
            if (cats.status === 'fulfilled') {
                setCategorias(cats.value.data.data ?? [])
            }
            if (dest.status === 'fulfilled') {
                setDestaques(dest.value.data.products ?? [])
            }
        }).finally(() => setLoading(false))
    }, [])

    return (
        <>
            <Carroussel />

            <BenefitsBar />

            <CategoryNav categorias={categorias} loading={loading} />

            <div className="bg-gray-50">
                <SwiperDisplay
                    title="Mais Vendidos"
                    icon={<Flame className="text-orange-500" size={28} />}
                    subtitle="Os favoritos dos nossos clientes"
                    produtos={maisVendidos}
                    loading={loading}
                />
            </div>

            <DestaquesSection destaques={destaques} loading={loading} />

            <div className="bg-gray-50">
                <SwiperDisplay
                    title="Lançamentos"
                    icon={<Sparkles className="text-verde-escuro" size={28} />}
                    subtitle="Novidades que acabaram de chegar"
                    produtos={lancamentos}
                    loading={loading}
                />
            </div>
        </>
    )
}

function CategoryNav({ categorias, loading }) {
    return (
        <div className="bg-white border-y border-gray-100 py-6 px-5 md:px-10">
            <div className="flex items-center gap-2 mb-4">
                <Tag size={16} className="text-verde-escuro" />
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Categorias</span>
            </div>

            {loading ? (
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 w-28 bg-gray-200 rounded-full animate-pulse shrink-0" />
                    ))}
                </div>
            ) : (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {categorias.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/produtos/categoria/${cat.slug}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-verde-escuro/30 text-verde-escuro text-sm font-medium whitespace-nowrap hover:bg-verde-escuro hover:text-white transition-all duration-200 shrink-0"
                        >
                            {cat.nome}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function DestaqueCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-md animate-pulse">
            <div className="bg-gray-200 w-full h-60" />
            <div className="px-5 py-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    )
}

function DestaquesSection({ destaques, loading }) {
    if (!loading && destaques.length === 0) return null

    return (
        <div className="bg-white py-10 px-5 md:px-10">
            <div className="flex items-end gap-3 mb-1">
                <Star className="text-yellow-400 mb-1" size={28} fill="currentColor" />
                <h2 className="text-3xl font-bold text-gray-800">Em Destaque</h2>
            </div>
            <p className="text-gray-500 text-sm mb-4 ml-0.5">Seleção especial para você</p>
            <div className="w-12 h-1 bg-verde-escuro rounded-full mb-6" />

            {loading ? (
                <div className="flex flex-wrap justify-center gap-14">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <DestaqueCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-wrap justify-center gap-14">
                    {destaques.map(produto => (
                        <ProdutoCard key={produto.id} produto={produto} />
                    ))}
                </div>
            )}
        </div>
    )
}

function BenefitsBar() {
    const { config } = useConfiguracoes()

    const items = [
        { icon: FaTruck,        titulo: config.beneficio_1_titulo     || 'Frete Grátis',              descricao: config.beneficio_1_descricao || 'Para todo o Brasil!'                           },
        { icon: FiClock,        titulo: config.beneficio_2_titulo     || 'Garantia de 2 Anos',        descricao: config.beneficio_2_descricao || 'Não se preocupe, nossos produtos duram'        },
        { icon: FaArrowsRotate, titulo: config.beneficio_3_titulo     || 'Devolução Grátis',          descricao: config.beneficio_3_descricao || 'Você tem até 30 dias para devolver seu produto' },
        { icon: FaCreditCard,   titulo: config.beneficio_4_titulo     || 'Parcele em até 12x s/ juros', descricao: config.beneficio_4_descricao || 'Cabe para todo o bolso!'                   },
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

import { Link } from "react-router-dom";
import { imgUrl } from "../lib/cloudinaryUrl";

export default function ProdutoCard({ produto }) {
    if (!produto) return null

    const desconto = Number(produto.desconto_percentual) || 0
    const precoOriginal = Number(produto.preco)
    const precoFinal = desconto > 0 ? precoOriginal * (1 - desconto / 100) : precoOriginal

    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <Link
            to={`/produto/${produto.slug}`}
            className="group bg-white rounded-3xl w-75 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shrink-0 block"
        >
            <div className="relative bg-gray-100 w-full h-80 overflow-hidden">
                {produto.foto_url
                    ? <img
                        src={imgUrl(produto.foto_url, 600)}
                        alt={produto.nome}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    : <span className="text-verde-escuro/50 text-sm">Sem imagem</span>
                }
                {desconto > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{desconto}%
                    </span>
                )}
            </div>

            <div className="px-5 py-4">
                <h2 className="font-semibold text-gray-800 text-sm truncate">{produto.nome}</h2>
                {desconto > 0
                    ? <div className="flex items-baseline gap-2 mt-0.5">
                        <p className="text-verde-escuro font-bold text-xl">{fmt(precoFinal)}</p>
                        <p className="text-gray-400 text-sm line-through">{fmt(precoOriginal)}</p>
                      </div>
                    : <p className="text-verde-escuro font-bold text-xl mt-0.5">{fmt(precoOriginal)}</p>
                }
            </div>
        </Link>
    )
}

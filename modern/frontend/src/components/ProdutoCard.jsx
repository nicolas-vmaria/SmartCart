import { Link } from "react-router-dom";

export default function ProdutoCard({ produto }) {
    if (!produto) return null

    const preco = Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <Link
            to={`/produto/${produto.slug}`}
            className="group bg-white rounded-3xl w-75 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shrink-0 block"
        >
            <div className="bg-gray-100 w-full h-80 overflow-hidden">
                {produto.foto_url
                    ? <img
                        src={produto.foto_url}
                        alt={produto.nome}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    : <span className="text-verde-escuro/50 text-sm">Sem imagem</span>
                }
            </div>

            <div className="px-5 py-4">
                <h2 className="font-semibold text-gray-800 text-sm truncate">{produto.nome}</h2>
                <p className="text-verde-escuro font-bold text-xl mt-0.5">{preco}</p>
            </div>
        </Link>
    )
}

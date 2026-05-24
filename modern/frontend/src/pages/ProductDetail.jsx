import StarRating from "../components/StarRating";

import { FaBagShopping } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate, FaStar } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { ThumbsUp } from "lucide-react";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductBySlug } from "../lib/api/products";
import { addToCart } from "../lib/api/cart";
import Toast from "../components/Toast";

const reviews = [
    { id: 1, nome: 'João Silva',      avatar: 'JS', rating: 5, data: '28/04/2026', util: 14, comentario: 'Produto incrível! A tecnologia de reconhecimento de itens funciona perfeitamente. Transformou a experiência de compras na nossa loja. Recomendo muito.' },
    { id: 2, nome: 'Maria Santos',    avatar: 'MS', rating: 4, data: '21/04/2026', util: 8,  comentario: 'Muito bom! A tela touchscreen é super responsiva e intuitiva. Tirei uma estrela porque a bateria poderia durar um pouco mais, mas no geral superou as expectativas.' },
    { id: 3, nome: 'Pedro Oliveira',  avatar: 'PO', rating: 5, data: '15/04/2026', util: 21, comentario: 'Excelente custo-benefício para o nosso supermercado. A integração com o sistema de gestão foi tranquila e o suporte técnico é excelente.' },
    { id: 4, nome: 'Ana Costa',       avatar: 'AC', rating: 3, data: '10/04/2026', util: 3,  comentario: 'Produto bom, mas tivemos alguns problemas na calibração inicial do sensor de peso. Após o suporte técnico ajustar, ficou ótimo.' },
    { id: 5, nome: 'Lucas Ferreira',  avatar: 'LF', rating: 5, data: '02/04/2026', util: 17, comentario: 'Comprei para a minha rede de farmácias e foi a melhor decisão. Os clientes adoraram a praticidade do pagamento integrado.' },
]

const ratingGeral = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)

const distribuicao = [5, 4, 3, 2, 1].map(estrela => ({
    estrela,
    count: reviews.filter(r => r.rating === estrela).length,
    pct: Math.round((reviews.filter(r => r.rating === estrela).length / reviews.length) * 100),
}))

function FormReview({ onSubmit }) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comentario, setComentario] = useState('')
    const [enviado, setEnviado] = useState(false)

    function handleSubmit(e) {
        e.preventDefault()
        if (!rating) return
        onSubmit({ rating, comentario })
        setEnviado(true)
    }

    if (enviado) return (
        <div className="border border-verde-escuro/30 bg-verde-escuro/5 rounded-2xl p-6 flex items-center gap-4">
            <FaCheckCircle className="text-verde-escuro text-2xl shrink-0" />
            <div>
                <p className="font-bold text-verde-escuro">Avaliação enviada!</p>
                <p className="text-sm text-gray-500">Obrigado pelo seu feedback.</p>
            </div>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800">Deixe sua avaliação</h3>

            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="cursor-pointer transition-transform hover:scale-125"
                    >
                        <FaStar
                            size={28}
                            className={`transition-colors ${star <= (hover || rating) ? 'text-amber-400' : 'text-gray-200'}`}
                        />
                    </button>
                ))}
                {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-400">
                        {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][rating]}
                    </span>
                )}
            </div>

            <textarea
                required
                rows={4}
                placeholder="Conte sua experiência com o produto..."
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro transition-colors resize-none"
            />

            <button
                type="submit"
                disabled={!rating}
                className="self-end bg-verde-escuro text-verde-claro px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                Enviar avaliação
            </button>
        </form>
    )
}

function ReviewCard({ review }) {
    const [util, setUtil] = useState(review.util)
    const [votou, setVotou] = useState(false)

    function votar() {
        if (votou) return
        setUtil(u => u + 1)
        setVotou(true)
    }

    return (
        <div className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-verde-escuro text-verde-claro flex items-center justify-center text-sm font-bold shrink-0">
                        {review.avatar}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{review.nome}</p>
                        <p className="text-xs text-gray-400">{review.data}</p>
                    </div>
                </div>
                <StarRating rating={review.rating} />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{review.comentario}</p>

            <button
                onClick={votar}
                className={`flex items-center gap-1.5 text-xs mt-1 w-fit transition-colors cursor-pointer
                    ${votou ? 'text-verde-escuro font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <ThumbsUp size={13} />
                Útil ({util})
            </button>
        </div>
    )
}

export default function ProductDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()

    const [produto, setProduto] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [cont, setCont] = useState(1)
    const [listaReviews, setListaReviews] = useState(reviews)
    const [addingToCart, setAddingToCart] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        setLoading(true)
        getProductBySlug(slug)
            .then(res => setProduto(res.data.product))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [slug])

    function adicionarReview({ rating, comentario }) {
        setListaReviews(prev => [{
            id: Date.now(),
            nome: 'Você',
            avatar: 'VC',
            rating,
            data: new Date().toLocaleDateString('pt-BR'),
            util: 0,
            comentario,
        }, ...prev])
    }

    const minusCont = () => setCont(c => Math.max(1, c - 1))
    const plusCont  = () => setCont(c => Math.min(produto?.estoque ?? 99, c + 1))

    async function handleAddToCart() {
        if (!localStorage.getItem('user_token')) {
            navigate('/login')
            return
        }

        setAddingToCart(true)
        try {
            await addToCart(produto.slug, produto.id, cont)
            window.dispatchEvent(new CustomEvent('cart:updated'))
            setToast({ message: `${produto.nome} adicionado ao carrinho!`, type: 'success' })
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao adicionar ao carrinho'
            setToast({ message: msg, type: 'error' })
        } finally {
            setAddingToCart(false)
        }
    }


    if (loading) return (
        <main className="animate-pulse">
            <section className="flex items-center p-10 gap-10">
                <div className="bg-gray-200 aspect-square h-180 rounded-3xl shrink-0" />
                <div className="flex flex-col gap-5 py-10 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-10 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="h-9 bg-gray-200 rounded w-36" />
                    <div className="h-4 bg-gray-200 rounded w-28" />
                    <div className="flex gap-5">
                        <div className="h-12 bg-gray-200 rounded-full w-36" />
                        <div className="h-12 bg-gray-200 rounded-full flex-1" />
                    </div>
                </div>
            </section>
        </main>
    )

    if (notFound || !produto) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 gap-3">
            <FaCheckCircle size={40} className="text-gray-300" />
            <p className="text-lg">Produto não encontrado.</p>
        </div>
    )

    const preco = Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <main className="">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <section className="flex items-center p-10 gap-10">
                <div className="bg-gray-100 aspect-square h-180 rounded-3xl overflow-hidden shrink-0">
                    {produto.foto_url
                        ? <img src={produto.foto_url} alt={produto.nome} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-gray-400">Sem imagem</span></div>
                    }
                </div>
                <div className="flex flex-col gap-5 py-10 flex-1">
                    <p className="text-gray-400 text-sm">SKU: {produto.id}</p>
                    <h1 className="text-4xl font-bold">{produto.nome}</h1>
                    <div className="flex gap-2 items-center">
                        <StarRating rating={4} />
                        <p className="text-gray-500 text-sm">{listaReviews.length} avaliações</p>
                    </div>
                    <p className="text-3xl font-bold text-verde-escuro">{preco}</p>
                    <p className="text-sm text-gray-400">{produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Fora de estoque'}</p>
                    <div className="flex gap-5">
                        <div className="flex text-xl">
                            <button onClick={minusCont} className="flex justify-center items-center bg-white px-5 border rounded-l-full border-r-0 border-gray-200 cursor-pointer hover:bg-gray-100">-</button>
                            <div className="flex justify-center items-center bg-white border border-gray-200 px-5">{cont}</div>
                            <button onClick={plusCont} className="flex justify-center items-center bg-white px-5 border rounded-r-full border-l-0 border-gray-200 cursor-pointer hover:bg-gray-100">+</button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={produto.estoque === 0 || addingToCart}
                            className="flex items-center justify-center gap-2 cursor-pointer bg-verde-escuro text-verde-claro rounded-full flex-1 h-12 transition-all hover:bg-verde-claro hover:text-verde-escuro disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {addingToCart
                                ? <div className="w-5 h-5 border-2 border-verde-claro border-t-transparent rounded-full animate-spin" />
                                : <><FaBagShopping /> Adicionar ao Carrinho</>
                            }
                        </button>
                    </div>
                </div>
            </section>

            <section className="px-10 py-16 border-t border-gray-200">
                {produto.descricao && (
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-800 prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: produto.descricao }}
                    />
                )}

                <div className="flex gap-10 mt-16 border-t border-gray-200 pt-10">
                    <div className="flex items-center gap-4">
                        <FiClock className="text-4xl text-verde-escuro shrink-0" />
                        <div>
                            <p className="font-bold text-verde-escuro">Garantia de 2 anos</p>
                            <p className="text-gray-500 text-sm">Assistência técnica em todo o Brasil</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <FaArrowsRotate className="text-4xl text-verde-escuro shrink-0" />
                        <div>
                            <p className="font-bold text-verde-escuro">Devolução em 30 dias</p>
                            <p className="text-gray-500 text-sm">Sem burocracia, sem custo</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews */}
            <section className="px-10 py-16 border-t border-gray-200">
                <div className="mb-10">
                    <h2 className="text-4xl font-bold">Avaliações dos <span className="italic font-light">clientes</span></h2>
                    <p className="text-gray-500 mt-1">{reviews.length} avaliações verificadas</p>
                </div>

                <div className="flex gap-12">
                    {/* Resumo */}
                    <div className="flex flex-col items-center gap-4 shrink-0 w-48">
                        <p className="text-7xl font-bold text-gray-800">{ratingGeral}</p>
                        <StarRating rating={Math.round(ratingGeral)} />
                        <p className="text-sm text-gray-400">de 5 estrelas</p>

                        <div className="flex flex-col gap-2 w-full mt-2">
                            {distribuicao.map(({ estrela, count, pct }) => (
                                <div key={estrela} className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-4 text-right shrink-0">{estrela}</span>
                                    <FaStar className="text-amber-400 shrink-0" size={11} />
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-4 shrink-0">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="flex flex-col gap-4 flex-1">
                        <FormReview onSubmit={adicionarReview} />
                        {listaReviews.map(r => <ReviewCard key={r.id} review={r} />)}
                    </div>
                </div>
            </section>
        </main>
    )
}
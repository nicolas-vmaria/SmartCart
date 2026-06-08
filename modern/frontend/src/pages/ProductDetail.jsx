import StarRating from "../components/StarRating";
import { imgUrl } from "../lib/cloudinaryUrl";
import Breadcrumb from "../components/Breadcrumb";

import { FaBagShopping } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate, FaStar } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { ThumbsUp } from "lucide-react";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductBySlug } from "../lib/api/products";
import { addToCart } from "../lib/api/cart";
import { getReviews, createReview, markHelpful } from "../lib/api/reviews";
import { getCompraJunto } from "../lib/api/compraJunto";
import { summarizeReviews } from "../lib/IaAssistant";
import Toast from "../components/Toast";
import { Plus } from "lucide-react";

function getInitials(nome) {
    if (!nome) return '?'
    const parts = nome.trim().split(' ')
    return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : nome.slice(0, 2).toUpperCase()
}

function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('pt-BR')
}

function ReviewSkeleton() {
    return (
        <div className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-3 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-16 mt-1" />
        </div>
    )
}

function FormReview({ productId, onCreated }) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comentario, setComentario] = useState('')
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [erro, setErro] = useState(null)

    const navigate = useNavigate()
    const logado = !!localStorage.getItem('user_token')

    if (!logado) return (
        <div className="border border-gray-200 rounded-2xl p-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Faça login para deixar sua avaliação</p>
            <button
                onClick={() => navigate('/login')}
                className="shrink-0 bg-verde-escuro text-verde-claro px-5 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-all cursor-pointer"
            >
                Entrar
            </button>
        </div>
    )

    if (enviado) return (
        <div className="border border-verde-escuro/30 bg-verde-escuro/5 rounded-2xl p-6 flex items-center gap-4">
            <FaCheckCircle className="text-verde-escuro text-2xl shrink-0" />
            <div>
                <p className="font-bold text-verde-escuro">Avaliação enviada!</p>
                <p className="text-sm text-gray-500">Obrigado pelo seu feedback.</p>
            </div>
        </div>
    )

    async function handleSubmit(e) {
        e.preventDefault()
        if (!rating) return
        setErro(null)
        setLoading(true)
        try {
            const res = await createReview(productId, { nota: rating, descricao: comentario })
            onCreated(res.data.review)
            setEnviado(true)
        } catch (err) {
            setErro(err.response?.data?.error || 'Erro ao enviar avaliação')
        } finally {
            setLoading(false)
        }
    }

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

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <button
                type="submit"
                disabled={!rating || loading}
                className="self-end flex items-center gap-2 bg-verde-escuro text-verde-claro px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
                {loading && <span className="w-4 h-4 border-2 border-verde-claro border-t-transparent rounded-full animate-spin" />}
                Enviar avaliação
            </button>
        </form>
    )
}

function ReviewCard({ review }) {
    const [likes, setLikes] = useState(Number(review.qtd_likes))
    const [votou, setVotou] = useState(false)
    const [votando, setVotando] = useState(false)

    async function votar() {
        if (votou || votando) return
        setVotando(true)
        try {
            await markHelpful(review.id)
            setLikes(l => l + 1)
            setVotou(true)
        } catch {
            // silently ignore
        } finally {
            setVotando(false)
        }
    }

    const initials = getInitials(review.user_nome)

    return (
        <div className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-verde-escuro text-verde-claro flex items-center justify-center text-sm font-bold shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{review.user_nome}</p>
                        <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
                    </div>
                </div>
                <StarRating rating={Number(review.nota)} />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{review.descricao}</p>

            <button
                onClick={votar}
                disabled={votou || votando}
                className={`flex items-center gap-1.5 text-xs mt-1 w-fit transition-colors cursor-pointer disabled:cursor-default
                    ${votou ? 'text-verde-escuro font-bold' : 'text-gray-400 hover:text-gray-600'}`}
            >
                {votando
                    ? <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                    : <ThumbsUp size={13} />
                }
                Útil ({likes})
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
    const [reviews, setReviews] = useState([])
    const [addingToCart, setAddingToCart] = useState(false)
    const [toast, setToast] = useState(null)
    const [compraJunto, setCompraJunto] = useState(null)
    const [addingBoth, setAddingBoth] = useState(false)
    const [reviewSummary, setReviewSummary] = useState(null)
    const [summaryLoading, setSummaryLoading] = useState(false)

    useEffect(() => {
        if (reviews.length < 3) { setReviewSummary(null); return }
        setSummaryLoading(true)
        setReviewSummary(null)
        summarizeReviews(reviews)
            .then(setReviewSummary)
            .catch(() => {})
            .finally(() => setSummaryLoading(false))
    }, [reviews.length])

    useEffect(() => {
        setLoading(true)
        setReviews([])
        setReviewSummary(null)
        setCompraJunto(null)
        getProductBySlug(slug)
            .then(async res => {
                const product = res.data.product
                setProduto(product)
                const [reviews, cj] = await Promise.allSettled([
                    getReviews(product.id),
                    getCompraJunto(product.id),
                ])
                setReviews(reviews.status === 'fulfilled' ? (reviews.value.data.reviews ?? []) : [])
                setCompraJunto(cj.status === 'fulfilled' ? (cj.value.data.produto ?? null) : null)
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [slug])

    function handleReviewCreated(newReview) {
        const nome = localStorage.getItem('user_nome') || 'Você'
        setReviews(prev => [{
            ...newReview,
            user_nome: nome,
            created_at: new Date().toISOString(),
        }, ...prev])
    }

    const ratingGeral = reviews.length
        ? (reviews.reduce((acc, r) => acc + Number(r.nota), 0) / reviews.length).toFixed(1)
        : '0.0'

    const distribuicao = [5, 4, 3, 2, 1].map(estrela => ({
        estrela,
        count: reviews.filter(r => Number(r.nota) === estrela).length,
        pct: reviews.length
            ? Math.round((reviews.filter(r => Number(r.nota) === estrela).length / reviews.length) * 100)
            : 0,
    }))

    const minusCont = () => setCont(c => Math.max(1, c - 1))
    const plusCont  = () => setCont(c => Math.min(produto?.estoque ?? 99, c + 1))

    async function handleAddBoth() {
        if (!localStorage.getItem('user_token')) { navigate('/login'); return }
        setAddingBoth(true)
        try {
            await addToCart(produto.slug, produto.id, 1)
            await addToCart(compraJunto.slug, compraJunto.id, 1)
            window.dispatchEvent(new CustomEvent('cart:updated'))
            setToast({ message: 'Ambos os produtos adicionados!', type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao adicionar', type: 'error' })
        } finally {
            setAddingBoth(false)
        }
    }

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
            <section className="flex flex-col md:flex-row items-center p-5 md:p-10 gap-6 md:gap-10">
                <div className="bg-gray-200 aspect-square w-full md:w-auto md:h-180 rounded-3xl md:shrink-0" />
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

    const desconto = Number(produto.desconto_percentual) || 0
    const precoOriginal = Number(produto.preco)
    const precoFinal = desconto > 0 ? precoOriginal * (1 - desconto / 100) : precoOriginal
    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <main className="">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="px-5 md:px-10 pt-6">
                <Breadcrumb items={[
                    { label: 'Início', href: '/' },
                    { label: produto.categoria_nome || 'Produtos', href: produto.categoria_slug ? `/produtos/categoria/${produto.categoria_slug}` : '/produtos' },
                    { label: produto.nome },
                ]} />
            </div>
            <section className="flex flex-col md:flex-row items-center p-5 md:p-10 gap-6 md:gap-10">
                <div className="relative bg-gray-100 aspect-square w-full md:w-auto md:h-180 rounded-3xl overflow-hidden md:shrink-0">
                    {produto.foto_url
                        ? <img src={imgUrl(produto.foto_url, 1200)} alt={produto.nome} loading="lazy" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-gray-400">Sem imagem</span></div>
                    }
                    {desconto > 0 && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                            -{desconto}%
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-5 py-4 md:py-10 flex-1">
                    <p className="text-gray-400 text-sm">SKU: {produto.id}</p>
                    <h1 className="text-2xl md:text-4xl font-bold">{produto.nome}</h1>
                    <div className="flex gap-2 items-center">
                        <StarRating rating={Math.round(ratingGeral)} />
                        <p className="text-gray-500 text-sm">{reviews.length} avaliações</p>
                    </div>
                    {desconto > 0
                        ? <div className="flex items-baseline gap-3">
                            <p className="text-2xl md:text-3xl font-bold text-verde-escuro">{fmt(precoFinal)}</p>
                            <p className="text-lg md:text-xl text-gray-400 line-through">{fmt(precoOriginal)}</p>
                          </div>
                        : <p className="text-2xl md:text-3xl font-bold text-verde-escuro">{fmt(precoOriginal)}</p>
                    }
                    <p className="text-sm text-gray-400">{produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Fora de estoque'}</p>
                    <div className="flex gap-3 md:gap-5">
                        <div className="flex text-base md:text-xl">
                            <button onClick={minusCont} className="flex justify-center items-center bg-white px-4 md:px-5 border rounded-l-full border-r-0 border-gray-200 cursor-pointer hover:bg-gray-100">-</button>
                            <div className="flex justify-center items-center bg-white border border-gray-200 px-4 md:px-5">{cont}</div>
                            <button onClick={plusCont} className="flex justify-center items-center bg-white px-4 md:px-5 border rounded-r-full border-l-0 border-gray-200 cursor-pointer hover:bg-gray-100">+</button>
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

            <section className="px-5 md:px-10 py-10 md:py-16 border-t border-gray-200">
                {produto.descricao && (
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-800 prose-img:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: produto.descricao }}
                    />
                )}

                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mt-10 md:mt-16 border-t border-gray-200 pt-10">
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

            {/* Compre Junto */}
            {compraJunto && (
                <section className="px-5 md:px-10 py-10 border-t border-gray-200">
                    <h2 className="text-2xl font-bold mb-6">Compre <span className="italic font-light">Junto</span></h2>
                    <div className="flex flex-col sm:flex-row items-center gap-3 max-w-lg">
                        <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3 flex-1 w-full">
                            {produto.foto_url
                                ? <img src={imgUrl(produto.foto_url, 120)} loading="lazy" className="w-14 h-14 object-contain shrink-0" alt={produto.nome} />
                                : <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                            }
                            <div className="min-w-0">
                                <p className="text-sm font-medium line-clamp-2">{produto.nome}</p>
                                <p className="text-verde-escuro font-bold text-sm mt-0.5">{fmt(precoFinal)}</p>
                            </div>
                        </div>
                        <Plus size={20} className="text-gray-400 shrink-0" />
                        <Link to={`/produto/${compraJunto.slug}`}
                            className="border border-gray-200 hover:border-verde-escuro rounded-2xl p-4 flex items-center gap-3 flex-1 w-full transition-colors">
                            {compraJunto.foto_url
                                ? <img src={imgUrl(compraJunto.foto_url, 120)} loading="lazy" className="w-14 h-14 object-contain shrink-0" alt={compraJunto.nome} />
                                : <div className="w-14 h-14 bg-gray-100 rounded-xl shrink-0" />
                            }
                            <div className="min-w-0">
                                <p className="text-sm font-medium line-clamp-2">{compraJunto.nome}</p>
                                <p className="text-verde-escuro font-bold text-sm mt-0.5">{fmt(Number(compraJunto.preco))}</p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <p className="text-sm text-gray-500">
                            Total: <span className="font-bold text-gray-800">{fmt(precoFinal + Number(compraJunto.preco))}</span>
                        </p>
                        <button onClick={handleAddBoth} disabled={addingBoth || produto.estoque === 0}
                            className="flex items-center gap-2 bg-verde-escuro text-white px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer">
                            {addingBoth && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {addingBoth ? 'Adicionando...' : 'Adicionar ambos'}
                        </button>
                    </div>
                </section>
            )}

            {/* Reviews */}
            <section className="px-5 md:px-10 py-10 md:py-16 border-t border-gray-200">
                <div className="mb-10">
                    <h2 className="text-2xl md:text-4xl font-bold">Avaliações dos <span className="italic font-light">clientes</span></h2>
                    <p className="text-gray-500 mt-1">{reviews.length} avaliações verificadas</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Resumo */}
                    <div className="flex flex-col items-center gap-4 md:shrink-0 w-full md:w-48">
                        <p className="text-5xl md:text-7xl font-bold text-gray-800">{ratingGeral}</p>
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
                        {summaryLoading && (
                            <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                                <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                                </div>
                            </div>
                        )}
                        {reviewSummary && !summaryLoading && (
                            <div className="border border-verde-escuro/20 bg-green-50 rounded-2xl p-4 flex items-start gap-3">
                                <span className="text-verde-escuro shrink-0 mt-0.5">✦</span>
                                <p className="text-sm text-gray-700 leading-relaxed">{reviewSummary}</p>
                            </div>
                        )}
                        <FormReview productId={produto.id} onCreated={handleReviewCreated} />

                        {reviews.length === 0
                            ? <p className="text-gray-400 text-sm py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
                            : reviews.map(r => <ReviewCard key={r.id} review={r} />)
                        }
                    </div>
                </div>
            </section>
        </main>
    )
}

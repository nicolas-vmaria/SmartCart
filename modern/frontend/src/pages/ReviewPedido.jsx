import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { getOrderReviewItems, createReview } from '../lib/api/reviews'
import Toast from '../components/Toast'

function StarSelector({ value, onChange }) {
    const [hovered, setHovered] = useState(0)
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-colors"
                >
                    <Star
                        size={24}
                        className={
                            n <= (hovered || value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }
                    />
                </button>
            ))}
        </div>
    )
}

function ReviewCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
            <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-10 bg-gray-100 rounded mt-2" />
                    <div className="h-8 bg-gray-200 rounded w-32 mt-1" />
                </div>
            </div>
        </div>
    )
}

export default function ReviewPedido() {
    const { pedidoId } = useParams()
    const navigate = useNavigate()

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [forms, setForms] = useState({})
    const [submitting, setSubmitting] = useState({})
    const [toast, setToast] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('user_token')
        if (!token) {
            navigate(`/login?redirect=/review-pedido/${pedidoId}`)
            return
        }

        getOrderReviewItems(pedidoId)
            .then(({ data }) => {
                setItems(data.items)
                const initialForms = {}
                data.items.forEach(item => {
                    if (!item.review_id) {
                        initialForms[item.produto_id] = { nota: 0, descricao: '' }
                    }
                })
                setForms(initialForms)
            })
            .catch(err => {
                const msg = err.response?.data?.error || 'Erro ao carregar itens do pedido.'
                setError(msg)
            })
            .finally(() => setLoading(false))
    }, [pedidoId, navigate])

    function updateForm(produtoId, field, value) {
        setForms(prev => ({ ...prev, [produtoId]: { ...prev[produtoId], [field]: value } }))
    }

    async function handleSubmit(e, produtoId) {
        e.preventDefault()
        const form = forms[produtoId]
        if (!form?.nota) {
            setToast({ message: 'Selecione uma nota de 1 a 5.', type: 'error' })
            return
        }
        if (!form.descricao.trim()) {
            setToast({ message: 'Escreva um comentário.', type: 'error' })
            return
        }
        setSubmitting(prev => ({ ...prev, [produtoId]: true }))
        try {
            await createReview(produtoId, { nota: form.nota, descricao: form.descricao })
            setItems(prev => prev.map(item =>
                item.produto_id === produtoId
                    ? { ...item, review_id: true, nota: form.nota, review_descricao: form.descricao }
                    : item
            ))
            setToast({ message: 'Avaliação enviada com sucesso!', type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao enviar avaliação.', type: 'error' })
        } finally {
            setSubmitting(prev => ({ ...prev, [produtoId]: false }))
        }
    }

    return (
        <main className="min-h-screen px-6 sm:px-12 lg:px-32 xl:px-50 py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-verde-escuro mb-1">Avaliar Produtos</h1>
                <p className="text-gray-500 mb-8">
                    Pedido <strong>#{String(pedidoId).padStart(5, '0')}</strong> — conte o que achou de cada produto.
                </p>

                {loading && (
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 2 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-500">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="flex flex-col gap-4">
                        {items.map(item => (
                            <div key={item.produto_id}
                                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex gap-4 items-start">
                                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                        {item.foto_url
                                            ? <img src={item.foto_url} alt={item.nome} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-gray-200" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                            <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                                            {item.review_id && (
                                                <span className="text-xs bg-green-100 text-verde-escuro px-2 py-0.5 rounded-full font-medium">
                                                    Já avaliado
                                                </span>
                                            )}
                                        </div>

                                        {item.review_id ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(n => (
                                                        <Star key={n} size={18}
                                                            className={n <= item.nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{item.review_descricao}</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={e => handleSubmit(e, item.produto_id)} className="flex flex-col gap-3">
                                                <StarSelector
                                                    value={forms[item.produto_id]?.nota || 0}
                                                    onChange={v => updateForm(item.produto_id, 'nota', v)}
                                                />
                                                <textarea
                                                    value={forms[item.produto_id]?.descricao || ''}
                                                    onChange={e => updateForm(item.produto_id, 'descricao', e.target.value)}
                                                    placeholder="Conte o que achou do produto..."
                                                    rows={3}
                                                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-verde-escuro transition-all resize-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={submitting[item.produto_id]}
                                                    className="self-start flex items-center gap-2 bg-verde-escuro text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
                                                >
                                                    {submitting[item.produto_id] ? (
                                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : null}
                                                    Enviar avaliação
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}

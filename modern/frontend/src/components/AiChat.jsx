import { useState, useRef, useEffect } from "react"
import { IoChatbubblesOutline } from "react-icons/io5"
import { Link, useLocation } from "react-router-dom"
import { createChat, sendMessage } from "../lib/IaAssistant"
import { getCategories } from "../lib/api/categories"
import { getCart } from "../lib/api/cart"
import { getProductBySlug, getProdutosDestaque } from "../lib/api/products"
import { getUserOrders } from "../lib/api/orders"

function getSuggestions(pathname) {
    if (/^\/produto\//.test(pathname)) return [
        "Quais são as especificações?",
        "Tem frete grátis para esse?",
        "Como é a garantia?",
    ]
    if (pathname === '/carrinho') return [
        "Como aplico um cupom?",
        "Como funciona o frete?",
        "Posso parcelar?",
    ]
    if (pathname === '/checkout') return [
        "Como funciona o PIX?",
        "Qual o prazo de entrega?",
        "Posso parcelar no cartão?",
    ]
    if (pathname === '/profile' || pathname === '/meus-pedidos') return [
        "Como rastreio meu pedido?",
        "Posso cancelar um pedido?",
        "Como faço devolução?",
    ]
    return [
        "Quais produtos vocês têm?",
        "Como acompanho meu pedido?",
        "Tem algum desconto disponível?",
    ]
}

function parseInline(text) {
    const regex = /\*\*(.*?)\*\*|(\/[a-z][a-z0-9\-/]*)/g
    const result = []
    let lastIndex = 0
    let match
    let key = 0

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) result.push(text.slice(lastIndex, match.index))
        if (match[1] !== undefined) {
            result.push(<strong key={key++}>{match[1]}</strong>)
        } else if (match[2] !== undefined) {
            result.push(
                <Link key={key++} to={match[2]} className="underline text-verde-escuro hover:opacity-75">
                    {match[2]}
                </Link>
            )
        }
        lastIndex = regex.lastIndex
    }
    if (lastIndex < text.length) result.push(text.slice(lastIndex))
    return result
}

function renderMarkdown(text) {
    const lines = text.split('\n')
    const result = []
    let listItems = []

    const flushList = (key) => {
        if (listItems.length === 0) return
        result.push(
            <ul key={`ul-${key}`} className="list-disc pl-4 my-1 space-y-0.5">
                {listItems.map((item, j) => <li key={j}>{parseInline(item)}</li>)}
            </ul>
        )
        listItems = []
    }

    lines.forEach((line, i) => {
        if (/^[-*] /.test(line)) {
            listItems.push(line.slice(2))
        } else {
            flushList(i)
            if (line.trim()) result.push(<p key={i} className="mb-0.5">{parseInline(line)}</p>)
        }
    })
    flushList('end')

    return result.length > 0 ? result : <span>{text}</span>
}

export default function AiChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: "ai", text: "Olá! Como posso te ajudar hoje?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const chatRef = useRef(createChat())
    const bottomRef = useRef(null)
    const location = useLocation()

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        if (!open) return

        const slug = location.pathname.match(/^\/produto\/([^/]+)/)?.[1] ?? null
        const usuario = localStorage.getItem('user_nome') ?? null
        const token = localStorage.getItem('user_token')

        const ctx = { usuario, categorias: [], carrinho: [], produtoAtual: null, produtos: [], pedidos: [] }

        Promise.all([
            getCategories().then(({ data }) => { ctx.categorias = data.data ?? [] }).catch(() => {}),
            getProdutosDestaque().then(res => { ctx.produtos = res.data.products ?? [] }).catch(() => {}),
            token ? getCart().then(res => { ctx.carrinho = res.data.carrinho ?? [] }).catch(() => {}) : Promise.resolve(),
            token ? getUserOrders().then(res => { ctx.pedidos = res.data.orders ?? [] }).catch(() => {}) : Promise.resolve(),
            slug ? getProductBySlug(slug).then(res => { ctx.produtoAtual = res.data.product ?? null }).catch(() => {}) : Promise.resolve(),
        ]).then(() => { chatRef.current.context = ctx })
    }, [open, location.pathname])

    const send = async (text) => {
        const userMsg = (text ?? input).trim()
        if (!userMsg || loading) return
        setInput("")
        setLoading(true)

        setMessages(prev => [
            ...prev,
            { role: "user", text: userMsg },
            { role: "ai", text: "" },
        ])

        await sendMessage(chatRef.current, userMsg, (chunk) => {
            setMessages(prev => {
                const updated = [...prev]
                const last = { ...updated[updated.length - 1] }
                last.text += chunk
                updated[updated.length - 1] = last
                return updated
            })
        })

        setLoading(false)
    }

    const hasUserMessages = messages.some(m => m.role === "user")
    const suggestions = getSuggestions(location.pathname)

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {open && (
                <div className="flex flex-col w-80 h-96 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 bg-verde-escuro text-white">
                        <span className="font-bold text-sm">Assistente SmartCart</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {messages.map((m, i) => {
                            const isPlaceholder = loading && i === messages.length - 1 && m.role === "ai" && !m.text
                            return (
                                <div key={i} className={`text-sm px-3 py-2 rounded-xl max-w-[85%] leading-relaxed
                                    ${m.role === "user"
                                        ? "bg-verde-escuro text-white self-end rounded-br-sm"
                                        : "bg-gray-100 text-gray-700 self-start rounded-bl-sm"}`}>
                                    {m.role === "ai"
                                        ? isPlaceholder
                                            ? <span className="text-gray-400 italic">Digitando...</span>
                                            : renderMarkdown(m.text)
                                        : m.text}
                                </div>
                            )
                        })}

                        {!hasUserMessages && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {suggestions.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-verde-escuro hover:text-verde-escuro transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    <div className="p-3 border-t border-gray-100 flex gap-2">
                        <input
                            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-verde-escuro transition-colors disabled:opacity-60"
                            placeholder="Digite sua dúvida..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && send()}
                            disabled={loading}
                        />
                        <button
                            onClick={() => send()}
                            disabled={loading}
                            className="bg-verde-escuro text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-verde-claro hover:text-verde-escuro transition-all disabled:opacity-50">
                            Enviar
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={() => setOpen(o => !o)}
                aria-label={open ? 'Fechar chat de ajuda' : 'Abrir chat de ajuda'}
                aria-expanded={open}
                className="w-14 h-14 rounded-full bg-verde-escuro text-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                {open ? "×" : <IoChatbubblesOutline className="text-2xl" />}
            </button>
        </div>
    )
}

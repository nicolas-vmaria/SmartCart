import { useState, useRef, useEffect } from "react"
import { IoChatbubblesOutline } from "react-icons/io5"
import { useLocation } from "react-router-dom"
import { createChat, sendMessage } from "../lib/IaAssistant"
import { getCategories } from "../lib/api/categories"
import { getCart } from "../lib/api/cart"
import { getProductBySlug } from "../lib/api/products"

const SUGGESTIONS = [
    "Quais produtos vocês têm?",
    "Como acompanho meu pedido?",
    "Tem algum desconto disponível?",
]

function parseBold(text) {
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    )
}

function renderMarkdown(text) {
    const lines = text.split('\n')
    const result = []
    let listItems = []

    const flushList = (key) => {
        if (listItems.length === 0) return
        result.push(
            <ul key={`ul-${key}`} className="list-disc pl-4 my-1 space-y-0.5">
                {listItems.map((item, j) => <li key={j}>{parseBold(item)}</li>)}
            </ul>
        )
        listItems = []
    }

    lines.forEach((line, i) => {
        if (/^[-*] /.test(line)) {
            listItems.push(line.slice(2))
        } else {
            flushList(i)
            if (line.trim()) result.push(<p key={i} className="mb-0.5">{parseBold(line)}</p>)
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

        const ctx = { usuario, categorias: [], carrinho: [], produtoAtual: null }

        Promise.all([
            getCategories().then(({ data }) => { ctx.categorias = data.data ?? [] }).catch(() => {}),
            token ? getCart().then(res => { ctx.carrinho = res.data.carrinho ?? [] }).catch(() => {}) : Promise.resolve(),
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
                                {SUGGESTIONS.map(s => (
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
                className="w-14 h-14 rounded-full bg-verde-escuro text-white shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform">
                {open ? "×" : <IoChatbubblesOutline className="text-2xl" />}
            </button>
        </div>
    )
}

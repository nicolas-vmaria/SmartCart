import { useState, useRef, useEffect } from "react"
import { IoChatbubblesOutline } from "react-icons/io5"
import { createChat, sendMessage } from "../lib/IaAssistant"

const chat = createChat()

export default function AiChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: "ai", text: "Olá! Como posso te ajudar hoje?" }
    ])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const send = async () => {
        if (!input.trim() || loading) return
        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", text: userMsg }])
        setLoading(true)
        const reply = await sendMessage(chat, userMsg)
        setMessages(prev => [...prev, { role: "ai", text: reply }])
        setLoading(false)
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {open && (
                <div className="flex flex-col w-80 h-96 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-verde-escuro text-white">
                        <span className="font-bold text-sm">Assistente SmartCart</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`text-sm px-3 py-2 rounded-xl max-w-[85%] leading-relaxed
                                ${m.role === "user"
                                    ? "bg-verde-escuro text-white self-end rounded-br-sm"
                                    : "bg-gray-100 text-gray-700 self-start rounded-bl-sm"}`}>
                                {m.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="bg-gray-100 text-gray-400 text-sm px-3 py-2 rounded-xl self-start rounded-bl-sm">
                                Digitando...
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-3 border-t border-gray-100 flex gap-2">
                        <input
                            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-verde-escuro transition-colors"
                            placeholder="Digite sua dúvida..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && send()}
                        />
                        <button
                            onClick={send}
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

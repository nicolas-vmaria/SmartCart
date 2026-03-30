import { useState } from 'react'
import { FaPhone } from 'react-icons/fa'
import { FaEnvelope } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'

export default function Contato() {
    const [form, setForm] = useState({ nome: '', email: '', mensagem: '' })
    const [enviado, setEnviado] = useState(false)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleSubmit(e) {
        e.preventDefault()
        setEnviado(true)
    }

    return (
        <main>

            {/* Hero */}
            <section className="flex h-80 items-center justify-center bg-linear-65 from-verde-escuro to-green-700 px-50 text-center flex-col gap-5">
                <h1 className="text-6xl text-verde-claro font-bold">
                    Fale com a <span className="italic font-light">gente.</span>
                </h1>
                <p className="text-verde-claro text-xl max-w-2xl">
                    Tem alguma dúvida, sugestão ou quer saber mais sobre o SmartCart? Estamos aqui.
                </p>
            </section>

            {/* Conteúdo */}
            <section className="flex items-start justify-between px-50 py-24 gap-20">

                {/* Informações */}
                <div className="flex flex-col gap-10 max-w-sm w-full">
                    <div>
                        <h2 className="text-3xl font-bold text-verde-escuro mb-2">Informações de <span className="italic font-light">contato</span></h2>
                        <p className="text-gray-500">Nossa equipe responde em até 1 dia útil.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-5 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all">
                            <div className="bg-verde-escuro p-4 rounded-full">
                                <FaPhone className="text-verde-claro text-xl" />
                            </div>
                            <div>
                                <p className="font-bold text-verde-escuro">Telefone</p>
                                <p className="text-gray-500">(11) 99999-9999</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all">
                            <div className="bg-verde-escuro p-4 rounded-full">
                                <FaEnvelope className="text-verde-claro text-xl" />
                            </div>
                            <div>
                                <p className="font-bold text-verde-escuro">E-mail</p>
                                <p className="text-gray-500">contato@smartcart.com.br</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:scale-105 transition-all">
                            <div className="bg-verde-escuro p-4 rounded-full">
                                <FaLocationDot className="text-verde-claro text-xl" />
                            </div>
                            <div>
                                <p className="font-bold text-verde-escuro">Endereço</p>
                                <p className="text-gray-500">São Paulo, SP — Brasil</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulário */}
                <div className="flex-1">
                    {enviado ? (
                        <div className="flex flex-col items-center justify-center h-full gap-5 border-2 border-gray-200 rounded-2xl p-16 text-center">
                            <h3 className="text-3xl font-bold text-verde-escuro">Mensagem enviada!</h3>
                            <p className="text-gray-500">Obrigado pelo contato. Nossa equipe retornará em breve.</p>
                            <button
                                onClick={() => { setEnviado(false); setForm({ nome: '', email: '', mensagem: '' }) }}
                                className="mt-4 text-verde-escuro border-2 border-verde-escuro rounded-full px-8 py-3 cursor-pointer transition-colors hover:bg-verde-escuro hover:text-verde-claro"
                            >
                                Enviar outra mensagem
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6 border-2 border-gray-200 rounded-2xl p-10">
                            <h2 className="text-2xl font-bold text-verde-escuro">Envie sua mensagem</h2>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-600">Nome</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                    placeholder="Seu nome completo"
                                    required
                                    className="border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-verde-escuro transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-600">E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="seu@email.com"
                                    required
                                    className="border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-verde-escuro transition-colors"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-600">Mensagem</label>
                                <textarea
                                    name="mensagem"
                                    value={form.mensagem}
                                    onChange={handleChange}
                                    placeholder="Como podemos te ajudar?"
                                    required
                                    rows={5}
                                    className="border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-verde-escuro transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="self-start text-verde-escuro border-2 border-verde-escuro rounded-full px-10 py-3 cursor-pointer transition-colors hover:bg-verde-escuro hover:text-verde-claro text-lg"
                            >
                                Enviar
                            </button>
                        </form>
                    )}
                </div>

            </section>

        </main>
    )
}

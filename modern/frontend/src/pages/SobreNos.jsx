import { Link } from 'react-router-dom'
import { FaLightbulb } from 'react-icons/fa'
import { FaHandshake } from 'react-icons/fa'
import { FaLeaf } from 'react-icons/fa'
import { FaRocket } from 'react-icons/fa6'
import { FaUsers } from 'react-icons/fa'
import { FaStore } from 'react-icons/fa'

export default function SobreNos() {
    return (
        <main>

            {/* Hero */}
            <section className="flex h-210 items-center justify-center bg-linear-65 from-verde-escuro to-green-700 px-50 text-center flex-col gap-8">
                <h1 className="text-6xl text-verde-claro font-bold">
                    Reinventando a experiência <span className="italic font-light">de compra.</span>
                </h1>
                <p className="text-verde-claro text-xl max-w-3xl">
                    A <span className="font-black">SmartCart</span> nasceu com um propósito simples: eliminar filas, simplificar compras e levar tecnologia de ponta para o dia a dia dos mercados brasileiros.
                </p>
            </section>

            {/* Nossa história */}
            <section className="flex items-center justify-between px-50 py-30 gap-20">
                <div className="flex flex-col gap-5 max-w-xl">
                    <p className="text-verde-escuro font-bold uppercase tracking-widest text-sm">Nossa História</p>
                    <h2 className="text-4xl font-bold">
                        Tudo começou com uma <span className="italic font-light">ideia simples.</span>
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        Em 2022, um grupo de engenheiros e entusiastas de varejo se reuniu com uma pergunta: por que ainda precisamos esperar em fila no caixa? Desse questionamento nasceu o SmartCart — um carrinho que pensa junto com você.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Desde então, já transformamos a experiência de compra de mais de <span className="font-bold text-verde-escuro">500 mercados</span> em todo o Brasil, com tecnologia RFID, câmeras de visão computacional e pagamento integrado.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 shrink-0">
                    <div className="border-2 border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 hover:shadow-2xl hover:scale-105 transition-all">
                        <FaStore className="text-5xl text-verde-escuro" />
                        <h3 className="text-3xl font-bold text-verde-escuro">500+</h3>
                        <p className="text-gray-500 text-center text-sm">Mercados atendidos</p>
                    </div>
                    <div className="border-2 border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 hover:shadow-2xl hover:scale-105 transition-all">
                        <FaUsers className="text-5xl text-verde-escuro" />
                        <h3 className="text-3xl font-bold text-verde-escuro">1M+</h3>
                        <p className="text-gray-500 text-center text-sm">Clientes impactados</p>
                    </div>
                    <div className="border-2 border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 hover:shadow-2xl hover:scale-105 transition-all">
                        <FaRocket className="text-5xl text-verde-escuro" />
                        <h3 className="text-3xl font-bold text-verde-escuro">2022</h3>
                        <p className="text-gray-500 text-center text-sm">Ano de fundação</p>
                    </div>
                    <div className="border-2 border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 hover:shadow-2xl hover:scale-105 transition-all">
                        <FaLeaf className="text-5xl text-verde-escuro" />
                        <h3 className="text-3xl font-bold text-verde-escuro">100%</h3>
                        <p className="text-gray-500 text-center text-sm">Empresa brasileira</p>
                    </div>
                </div>
            </section>

            {/* Nossos valores */}
            <section className="bg-linear-65 from-verde-escuro to-green-700 py-30 px-50">
                <div className="mb-14 text-center">
                    <h2 className="text-4xl font-bold text-verde-claro">Nossos <span className="italic font-light">valores</span></h2>
                    <p className="text-verde-claro mt-2">O que guia cada decisão que tomamos</p>
                </div>

                <div className="grid grid-cols-3 gap-10">
                    <div className="border-2 border-green-500 bg-green-800/30 rounded-2xl p-8 flex flex-col gap-4 hover:scale-105 hover:shadow-2xl transition-all">
                        <FaLightbulb className="text-4xl text-verde-claro" />
                        <h3 className="text-2xl font-bold text-verde-claro">Inovação</h3>
                        <p className="text-green-200 leading-relaxed">Estamos sempre um passo à frente, desenvolvendo tecnologia que resolve problemas reais do varejo brasileiro.</p>
                    </div>
                    <div className="border-2 border-green-500 bg-green-800/30 rounded-2xl p-8 flex flex-col gap-4 hover:scale-105 hover:shadow-2xl transition-all">
                        <FaHandshake className="text-4xl text-verde-claro" />
                        <h3 className="text-2xl font-bold text-verde-claro">Parceria</h3>
                        <p className="text-green-200 leading-relaxed">Crescemos junto com os nossos clientes. O sucesso do seu mercado é o nosso sucesso.</p>
                    </div>
                    <div className="border-2 border-green-500 bg-green-800/30 rounded-2xl p-8 flex flex-col gap-4 hover:scale-105 hover:shadow-2xl transition-all">
                        <FaLeaf className="text-4xl text-verde-claro" />
                        <h3 className="text-2xl font-bold text-verde-claro">Sustentabilidade</h3>
                        <p className="text-green-200 leading-relaxed">Reduzimos o desperdício de papel, otimizamos filas e contribuímos para um varejo mais eficiente e sustentável.</p>
                    </div>
                </div>
            </section>

            {/* Depoimento */}
            <section className="flex flex-col bg-linear-65 from-verde-claro to-lime-400 w-full h-100 items-center justify-center px-50 text-center gap-4">
                <h2 className="text-4xl text-verde-escuro">"Nunca imaginei que um carrinho de supermercado pudesse transformar tanto o nosso negócio."</h2>
                <p className="text-gray-700">Mariana Alves, Rede SuperFácil</p>
            </section>

            {/* CTA */}
            <section className="flex flex-col items-center justify-center h-80 gap-5">
                <h2 className="text-5xl text-verde-escuro text-center">Pronto para fazer parte dessa <span className="italic">revolução?</span></h2>
                <Link to="/produtos">
                    <button className="text-2xl text-verde-escuro rounded-full w-70 p-5 border-2 border-verde-escuro cursor-pointer transition-colors hover:bg-verde-escuro hover:text-verde-claro">
                        Ver Produtos
                    </button>
                </Link>
            </section>

        </main>
    )
}

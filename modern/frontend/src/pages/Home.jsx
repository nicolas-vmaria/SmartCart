import SmartCart3D from '../components/SmartCart3D'

import { FaTruck } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa6";
import { LuNfc } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import { FaWeightHanging } from "react-icons/fa";
import { MdOutlineTouchApp } from "react-icons/md";
import { MdOutlinePayments } from "react-icons/md";
import { FaWifi } from "react-icons/fa";

import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProdutosDestaque } from '../lib/api/products'

export default function Home() {
    const [destaques, setDestaques] = useState([])
    const [loadingDestaques, setLoadingDestaques] = useState(true)

    useEffect(() => {
        getProdutosDestaque()
            .then(({ data }) => setDestaques(data.products ?? []))
            .catch(() => {})
            .finally(() => setLoadingDestaques(false))
    }, [])

    return (
        <main className="">
            <section className="flex flex-col md:flex-row min-h-screen items-center justify-between bg-linear-65 from-verde-escuro to-green-700 px-6 sm:px-12 lg:px-32 xl:px-50 py-20 md:py-0 gap-10">
                <div className="flex flex-col gap-5 max-w-xl w-full">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl text-verde-claro font-bold">O Carrinho inteligente que <span className='italic font-light'>facilita sua compra.</span></h1>

                    <p className='text-verde-claro'>O <span className="font-black">SmartCart</span> é um carrinho muito bom, legal, maneiro e tem todas as funcionalidade de um carrinho comum, mas muito melhor pq ele tem telinha e computa todos os items que você coloca dentro dele.</p>

                    <Link to={'/produtos'}>
                        <button className='border-2 rounded-2xl border-verde-claro text-verde-claro self-start p-5 transition-all hover:bg-verde-claro hover:text-verde-escuro cursor-pointer'>
                            Descubra mais produtos!
                        </button>
                    </Link>
                </div>

                <div className='w-72 h-72 sm:w-96 sm:h-96 lg:w-120 lg:h-120 shrink-0 hidden md:block'>
                    <SmartCart3D />
                </div>
            </section>

            <section className='flex py-10 items-center justify-between'>
                <div className='px-6 sm:px-12 lg:px-32 xl:px-50 flex w-full gap-5 justify-between flex-wrap'>
                    <div className='flex border border-gray-200 rounded-2xl p-6 sm:p-10 box-border flex-col items-center gap-2 flex-1 min-w-40'>
                        <div className='bg-verde-escuro p-6 sm:p-8 rounded-full'>
                            <FaTruck className='w-10 h-auto sm:w-16 text-verde-claro' />
                        </div>
                        <p className='text-center text-sm sm:text-base'>Frete Grátis para todo Brasil!</p>
                    </div>
                    <div className='flex border border-gray-200 rounded-2xl p-6 sm:p-10 box-border flex-col items-center gap-2 flex-1 min-w-40'>
                        <div className='bg-verde-escuro p-6 sm:p-8 rounded-full'>
                            <FiClock className='w-10 h-auto sm:w-16 text-verde-claro' />
                        </div>
                        <p className='text-center text-sm sm:text-base'>Garantia de 2 Anos.</p>
                    </div>
                    <div className='flex border border-gray-200 rounded-2xl p-6 sm:p-10 box-border flex-col items-center gap-2 flex-1 min-w-40'>
                        <div className='bg-verde-escuro p-6 sm:p-8 rounded-full'>
                            <FaArrowsRotate className='w-10 h-auto sm:w-16 text-verde-claro' />
                        </div>
                        <p className='text-center text-sm sm:text-base'>Devolução em Até 30 Dias.</p>
                    </div>
                    <div className='flex border border-gray-200 rounded-2xl p-6 sm:p-10 box-border flex-col items-center gap-2 flex-1 min-w-40'>
                        <div className='bg-verde-escuro p-6 sm:p-8 rounded-full'>
                            <FaCreditCard className='w-10 h-auto sm:w-16 text-verde-claro' />
                        </div>
                        <p className='text-center text-sm sm:text-base'>Parcelado em até 12x sem Juros.</p>
                    </div>
                </div>
            </section>

            {(loadingDestaques || destaques.length > 0) && (
                <section className='py-10 px-6 sm:px-12 lg:px-32 xl:px-50'>
                    <div className='mb-8'>
                        <h1 className='text-3xl sm:text-4xl'>Produtos em <span className='font-bold italic'>Destaque</span></h1>
                        <p className='text-gray-600'>Selecionados especialmente para você</p>
                    </div>
                    {loadingDestaques ? (
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className='animate-pulse'>
                                    <div className='bg-gray-200 rounded-2xl h-44 mb-3' />
                                    <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
                                    <div className='h-3 bg-gray-100 rounded w-1/2' />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
                            {destaques.map(p => (
                                <Link key={p.id} to={`/produto/${p.slug}`}
                                    className='group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1'>
                                    <div className='h-44 bg-gray-50 flex items-center justify-center overflow-hidden'>
                                        {p.foto_url
                                            ? <img src={p.foto_url} alt={p.nome} className='w-full h-full object-cover group-hover:scale-105 transition-transform' />
                                            : <div className='w-16 h-16 bg-gray-200 rounded-xl' />
                                        }
                                    </div>
                                    <div className='p-4'>
                                        <h3 className='font-semibold text-sm text-gray-800 line-clamp-2'>{p.nome}</h3>
                                        <p className='text-verde-escuro font-bold text-sm mt-1'>
                                            {Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            )}

            <section className='py-10 px-6 sm:px-10'>
                <div className='my-10'>
                    <h1 className='text-3xl sm:text-4xl'>O que o  <span className='font-bold italic'>Smartcart</span> oferece?</h1>
                    <p className='text-gray-600'>Descubra a tecnologia por trás de um produto SmartCart</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10'>
                    <div className='border-2 border-gray-200 p-5 rounded-2xl transition-all hover:scale-105 hover:shadow-2xl'>
                        <div className='py-10'>
                            <LuNfc className='text-4xl text-verde-escuro' />
                        </div>
                        <h1 className='text-2xl font-bold'>RFID / NFC</h1>
                        <p>Leitores que identificam produtos automaticamente ao colocá-los no carrinho, sem precisar passar no caixa.</p>
                    </div>
                    <div className='border-2 border-gray-200 p-5 rounded-2xl transition-all hover:shadow-2xl hover:scale-105'>
                        <div className='py-10'>
                            <FaRegEye className='text-4xl text-verde-escuro' />
                        </div>
                        <h1 className='text-2xl font-bold'>Computer Vision (câmeras + IA)</h1>
                        <p>Câmeras que reconhecem os itens visualmente, útil para frutas, verduras e produtos sem código de barras.</p>
                    </div>
                    <div className='border-2 border-gray-200 p-5 rounded-2xl transition-all hover:shadow-2xl hover:scale-105'>
                        <div className='py-10'>
                            <FaWeightHanging className='text-4xl text-verde-escuro' />
                        </div>
                        <h1 className='text-2xl font-bold'>Sensores de peso</h1>
                        <p>Balança integrada que valida o item reconhecido pela câmera ou RFID, evitando fraudes.</p>
                    </div>
                    <div className='border-2 border-gray-200 p-5 rounded-2xl transition-all hover:shadow-2xl hover:scale-105'>
                        <div className='py-10'>
                            <MdOutlineTouchApp className='text-4xl text-verde-escuro' />
                        </div>
                        <h1 className='text-2xl font-bold'>Tela touchscreen</h1>
                        <p>Display embutido que exibe a lista de compras, total em tempo real, promoções personalizadas e permite o pagamento direto no carrinho.</p>
                    </div>
                    <div className='border-2 border-gray-200 p-5 rounded-2xl transition-all hover:shadow-2xl hover:scale-105'>
                        <div className='py-10'>
                            <MdOutlinePayments className='text-4xl text-verde-escuro' />
                        </div>
                        <h1 className='text-2xl font-bold'>Pagamento integrado (NFC / chip)</h1>
                        <p>Leitor de cartão ou aproximação direto no carrinho, eliminando a fila do caixa completamente.</p>
                    </div>
                    <div className='border-2 border-gray-200 p-5 rounded-2xl transition-all hover:shadow-2xl hover:scale-105'>
                        <div className='py-10'>
                            <FaWifi className='text-4xl text-verde-escuro' />
                        </div>
                        <h1 className='text-2xl font-bold'>Conectividade IoT (Wi-Fi / BLE)</h1>
                        <p>O carrinho se comunica com o sistema da loja em tempo real para sincronizar estoque, enviar dados de comportamento do cliente e localizar o carrinho dentro da loja via Bluetooth Low Energy.</p>
                    </div>
                </div>
            </section>

            <section className='my-10'>
                <div className='m-6 sm:m-10'>
                    <h1 className='text-3xl sm:text-4xl'>Veja o que é falado sobre os nossos produtos!</h1>
                    <p className='text-gray-600'>Veja o que tá na boca do povo</p>
                </div>

                <div className='flex flex-col bg-linear-65 from-verde-escuro to-green-700 w-full py-16 sm:py-20 items-center justify-center px-6 sm:px-16 text-center'>
                    <h1 className='text-2xl sm:text-4xl text-white'>"Existe um mundo antes e um depois de termos o SmartCart em nossos mercados!"</h1>
                    <p className='text-verde-claro mt-4'>Frederico Texeira de Campos, Texeira's Atacadão</p>
                </div>
            </section>

            <section className='flex flex-col items-center justify-center py-20 sm:py-32 gap-5 px-6 text-center'>
                <h1 className='text-4xl sm:text-5xl text-verde-escuro'>O que está <span className='italic'>esperando?</span> <br /> Aproveite um mundo depois do <span className='font-bold'>SmartCart</span> hoje mesmo.</h1>
                <Link to={"/produtos"}><button className='text-xl sm:text-2xl text-verde-escuro rounded-full px-10 sm:w-70 p-5 border-2 border-verde-escuro cursor-pointer transition-colors hover:bg-verde-escuro hover:text-verde-claro'>Produtos</button></Link>
            </section>
        </main>
    )
}

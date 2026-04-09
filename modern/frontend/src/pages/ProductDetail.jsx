import StarRating from "../components/StarRating";

import { FaBagShopping } from "react-icons/fa6";
import { FiClock } from "react-icons/fi";
import { FaArrowsRotate } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

import { useState } from "react";

export default function ProductDetail() {

    const [cont, setCont] = useState(1)

    const minusCont = () => {
        if (cont === 1) {
            cont = 1
        } else {
            setCont(cont - 1)
        }

    }

    const plusCont = () => {
        setCont(cont + 1)
    }

    // Futuramente virá da API junto com os dados do produto
    const features = [
        { titulo: 'RFID / NFC', descricao: 'Identifica produtos automaticamente ao colocá-los no carrinho, sem precisar passar no caixa.' },
        { titulo: 'Computer Vision', descricao: 'Câmera com IA que reconhece itens visualmente, incluindo frutas e produtos sem código de barras.' },
        { titulo: 'Sensor de Peso', descricao: 'Balança integrada que valida cada item reconhecido, evitando erros e fraudes.' },
        { titulo: 'Tela Touchscreen', descricao: 'Display 10" que exibe a lista de compras e total em tempo real.' },
        { titulo: 'Pagamento Integrado', descricao: 'Aceita cartão por aproximação, chip e PIX direto no carrinho.' },
        { titulo: 'Conectividade IoT', descricao: 'Wi-Fi 5GHz + Bluetooth 5.0 para sincronização em tempo real com o sistema da loja.' },
    ]

    return (
        <main className="">
            <section className="flex items-center p-10 gap-10">
                <div className="bg-gray-200 aspect-square h-180">
                    <img src="" alt="imagem do produto" />
                </div>
                <div className="flex flex-col gap-5 py-10">
                    <h1 className="text-gray-500">SKU: 039232</h1>
                    <h1 className="text-4xl">Titulo do Produto</h1>
                    <div className="flex gap-2 items-center">
                        <StarRating rating={4} />
                        <p>215 Reviews</p>
                    </div>
                    <div className="flex gap-2 items-end">
                        <h1 className="text-3xl">R$940,99</h1>
                        <h1 className="text-gray-500 line-through">R$1032,99</h1>
                    </div>
                    <div className="text-gray-500">
                        <p>O SmartCart Pro é um carrinho de compras inteligente equipado com uma tela touchscreen integrada, projetado para transformar a experiência de compras em supermercados e lojas de varejo. Ele combina tecnologia de ponta com praticidade, oferecendo autonomia total ao consumidor dentro da loja.</p>
                    </div>
                    <div className="flex gap-5">
                        <div className="flex text-xl">
                            <button onClick={minusCont} className="flex justify-center items-center bg-white px-5 border-1 rounded-l-full border-r-0 border-gray-200 cursor-pointer hover:bg-gray-100">-</button>
                            <div className="flex justify-center items-center bg-white  border-1 border-gray-200 px-5">{cont}</div>
                            <button onClick={plusCont} className="flex justify-center items-center bg-white  px-5 border-1 rounded-r-full border-l-0 border-gray-200 cursor-pointer hover:bg-gray-100">+</button>
                        </div>
                        <button className="flex items-center justify-center gap-2 cursor-pointer bg-verde-escuro text-verde-claro rounded-full w-full h-12 transition-all hover:bg-verde-claro hover:text-verde-escuro hover:border-verde-claro"><FaBagShopping /> Adicionar ao Carrinho</button>
                    </div>
                </div>
            </section>

            <section className="px-10 py-16 border-t border-gray-200">
                <div className="mb-10">
                    <h2 className="text-4xl font-bold">O que esse <span className="italic font-light">produto</span> oferece?</h2>
                    <p className="text-gray-500 mt-1">Tecnologia integrada para uma experiência completa</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {features.map(({ titulo, descricao }) => (
                        <div key={titulo} className="border-2 border-gray-200 p-6 rounded-2xl transition-all hover:shadow-2xl hover:scale-105">
                            <FaCheckCircle className="text-3xl text-verde-escuro mb-4" />
                            <h3 className="text-xl font-bold mb-2">{titulo}</h3>
                            <p className="text-gray-500">{descricao}</p>
                        </div>
                    ))}
                </div>

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
        </main>
    )
}
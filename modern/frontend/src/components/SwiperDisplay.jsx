import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Package } from "lucide-react";
import ProdutoCard from './ProdutoCard'

export default function SwiperDisplay({ title, produtos = [], loading }) {
    return (
        <div className="px-5 pt-4 pb-2">
            <h1 className="text-4xl p-5">{title}</h1>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-verde-escuro border-t-transparent rounded-full animate-spin" />
                </div>
            ) : produtos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                    <Package size={40} strokeWidth={1.5} />
                    <p>Nenhum produto disponível no momento.</p>
                </div>
            ) : (
                <Swiper
                    loop={false}
                    spaceBetween={20}
                    slidesPerView="auto"
                    grabCursor={true}
                    style={{ paddingBottom: '20px', paddingTop: '8px' }}
                >
                    {produtos.map(produto => (
                        <SwiperSlide key={produto.id} style={{ width: 'auto' }}>
                            <ProdutoCard produto={produto} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    )
}

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { Package } from "lucide-react";
import ProdutoCard from './ProdutoCard'

function ProdutoCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl w-75 overflow-hidden shadow-md shrink-0 animate-pulse">
            <div className="bg-gray-200 w-full h-80" />
            <div className="px-5 py-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    )
}

export default function SwiperDisplay({ title, produtos = [], loading }) {
    return (
        <div className="px-5 pt-4 pb-2">
            <h1 className="text-4xl p-5">{title}</h1>

            {loading ? (
                <div className="flex gap-5 overflow-hidden px-1 py-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <ProdutoCardSkeleton key={i} />
                    ))}
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

import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css/navigation'
import 'swiper/css'

import slide1 from '../assets/carrossel/1.png'
import slide2 from '../assets/carrossel/2.png'
import slide3 from '../assets/carrossel/3.png'

const API_URL = import.meta.env.VITE_API_URL

const FALLBACK = [
    { id: 'f1', foto_url: slide1 },
    { id: 'f2', foto_url: slide2 },
    { id: 'f3', foto_url: slide3 },
]

export default function Carroussel() {
    const [slides, setSlides] = useState(FALLBACK)

    useEffect(() => {
        fetch(`${API_URL}/banners`)
            .then(r => r.json())
            .then(data => {
                const banners = data.banners ?? []
                if (banners.length > 0) setSlides(banners)
            })
            .catch(() => {})
    }, [])

    return (
        <div>
            <Swiper
                navigation={true}
                autoplay={{ delay: 3000 }}
                pagination={true}
                loop={true}
                modules={[Pagination, Navigation, Autoplay]}
                className="mySwiper"
            >
                {slides.map(s => (
                    <SwiperSlide key={s.id}>
                        <img src={s.foto_url} alt="banner" className="w-full" />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

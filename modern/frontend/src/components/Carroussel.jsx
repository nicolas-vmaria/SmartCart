import { useEffect, useState } from 'react'
import { imgUrl } from '../lib/cloudinaryUrl'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css/navigation'
import 'swiper/css'

import slide1 from '../assets/carrossel/1.webp'
import slide2 from '../assets/carrossel/2.webp'
import slide3 from '../assets/carrossel/3.webp'

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
                {slides.map((s, i) => (
                    <SwiperSlide key={s.id}>
                        <img
                            src={imgUrl(s.foto_url, 1200)}
                            alt={s.titulo || `Banner promocional ${i + 1}`}
                            width={1600}
                            height={417}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            fetchPriority={i === 0 ? 'high' : 'auto'}
                            className="w-full h-auto"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

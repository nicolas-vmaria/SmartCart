import { Swiper, SwiperSlide } from "swiper/react";

import { Pagination, Navigation, Autoplay } from 'swiper/modules';


import 'swiper/css/navigation';
import 'swiper/css';

import slide1 from '../assets/carrossel/1.png'
import slide2 from '../assets/carrossel/2.png'
import slide3 from '../assets/carrossel/3.png'

export default function Carroussel(){
    return (
        <div className="">
            <Swiper navigation={true} autoplay={{ delay: 3000 }} pagination={true} loop={true} modules={[Pagination, Navigation, Autoplay]} className="mySwiper">
                <SwiperSlide><img src={slide1} alt="slide 1" /></SwiperSlide>
                <SwiperSlide><img src={slide2} alt="slide 2" /></SwiperSlide>
                <SwiperSlide><img src={slide3} alt="slide 3" /></SwiperSlide>
            </Swiper>
        </div>
    )
}
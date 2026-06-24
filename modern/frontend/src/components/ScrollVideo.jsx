import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const pad = (n) => String(n).padStart(4, '0')

/* Sequência de frames (extraídos do vídeo via ffmpeg) que avança conforme o
   scroll: a seção fica fixa (sticky) e o ScrollTrigger amarra o progresso do
   scroll ao frame desenhado no canvas. Só liga o scrub depois de todos os
   frames carregados, pra não travar/pular imagem durante o scroll. */
export default function ScrollVideo({ framesPath = '/frames', frameCount = 250 }) {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const frameRef = useRef(0)
  const sizeRef = useRef({ width: 0, height: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'

    const draw = (index) => {
      const img = imagesRef.current[index]
      if (!img || !img.complete || !img.naturalWidth) return
      const { width, height } = sizeRef.current
      const imgAspect = img.naturalWidth / img.naturalHeight

      ctx.clearRect(0, 0, width, height)

      /* Tela mais estreita que o frame (celular): "cover" preenche tudo
         cortando só as laterais (fundo) — o carrinho fica inteiro de cima a
         baixo. Tela mais larga (desktop): "contain" sem cortar topo/base,
         espelhando o próprio frame nas faixas laterais que sobram. */
      if (width / height < imgAspect) {
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
        const w = img.naturalWidth * scale
        const h = img.naturalHeight * scale
        ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h)
        return
      }

      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      const x = (width - w) / 2
      const y = (height - h) / 2

      if (x > 0) {
        const drawMirrored = (dx) => {
          ctx.save()
          ctx.translate(dx + w, y)
          ctx.scale(-1, 1)
          ctx.drawImage(img, 0, 0, w, h)
          ctx.restore()
        }
        drawMirrored(x - w)
        drawMirrored(x + w)
      }

      ctx.drawImage(img, x, y, w, h)
    }

    /* Canvas precisa de um buffer em pixels físicos (CSS px * devicePixelRatio),
       senão em telas retina/alta densidade o navegador estica um buffer menor
       e a imagem sai borrada mesmo com frames de origem nítidos. */
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = wrapper.clientWidth
      const height = window.innerHeight
      sizeRef.current = { width, height }
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingQuality = 'high'
      draw(frameRef.current)
    }
    resize()
    window.addEventListener('resize', resize)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* Esconde a navbar enquanto a seção de frames está pinada na tela */
    const visibilityTrigger = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      onToggle: (self) => {
        window.dispatchEvent(new CustomEvent('scrollvideo:active', { detail: self.isActive }))
      },
    })

    let trigger
    const startScrub = () => {
      if (trigger || reduce) return
      trigger = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const index = Math.min(frameCount - 1, Math.round(self.progress * (frameCount - 1)))
          frameRef.current = index
          draw(index)
        },
      })
      ScrollTrigger.refresh()
    }

    let loaded = 0
    const images = Array.from({ length: frameCount }, (_, i) => {
      const img = new Image()
      img.onload = () => {
        if (i === 0) draw(0)
        loaded += 1
        if (loaded === frameCount) startScrub()
      }
      img.src = `${framesPath}/frame_${pad(i + 1)}.jpg`
      return img
    })
    imagesRef.current = images

    return () => {
      window.removeEventListener('resize', resize)
      visibilityTrigger.kill()
      trigger?.kill()
      window.dispatchEvent(new CustomEvent('scrollvideo:active', { detail: false }))
    }
  }, [framesPath, frameCount])

  return (
    <section ref={wrapperRef} className="relative z-60 h-[300vh] bg-gray-300">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </section>
  )
}

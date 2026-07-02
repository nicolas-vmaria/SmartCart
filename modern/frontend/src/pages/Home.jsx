import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import {
  ShoppingCart, Truck, Shield, RefreshCcw, CreditCard,
  Radio, Eye, Scale, Hand, Wifi, ArrowRight, Plug, Monitor, ShoppingBasket,
} from 'lucide-react'
import { getProdutosDestaque } from '../lib/api/products'
import { imgUrl } from '../lib/cloudinaryUrl'
import SmartCartDemo from '../components/SmartCartDemo'

const SmartCart3D = lazy(() => import('../components/SmartCart3D'))

gsap.registerPlugin(TextPlugin)

const QUOTE = '"Existe um mundo antes e um depois de termos o SmartCart em nossos mercados!"'

/* Adiciona .in-view a elementos com .reveal quando entram no viewport */
function setupReveal(root) {
  const els = root.querySelectorAll('.reveal')
  if (!els.length) return () => {}
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view')
        io.unobserve(e.target)
      }
    }),
    { threshold: 0.12 }
  )
  els.forEach((el) => io.observe(el))
  return () => io.disconnect()
}

/* ── Hero ────────────────────────────────────────────────────── */
function Hero() {
  /* Adia o download/execução do three.js para depois do carregamento inicial */
  const [show3D, setShow3D] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setShow3D(true), { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(() => setShow3D(true), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(ellipse 70% 80% at 38% 42%, rgba(76,175,80,0.28), transparent 70%), #1a5c2a',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-7 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center py-24 lg:py-32 min-h-[92vh]">
        {/* Copy */}
        <div className="flex flex-col">
          <span
            className="hero-eyebrow self-start inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2 rounded-full mb-6 tracking-wide"
            style={{
              background: 'rgba(212,232,74,0.12)',
              border: '1px solid rgba(212,232,74,0.3)',
              color: '#D4E84A',
            }}
          >
            ● Tecnologia embarcada · feita no Brasil
          </span>

          <h1
            className="font-extrabold leading-[1.05] tracking-[-1.5px] mb-6"
            style={{ fontSize: 'clamp(40px, 5.2vw, 66px)', color: '#D4E84A' }}
          >
            <span className="hero-line block overflow-hidden">O Carrinho</span>
            <span className="hero-line block overflow-hidden">inteligente que</span>
            <span
              className="hero-line block overflow-hidden"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 600 }}
            >
              facilita sua compra.
            </span>
          </h1>

          <p
            className="hero-subtitle text-[17px] leading-relaxed max-w-[480px] mb-8"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            O SmartCart une RFID, visão computacional com IA, sensores de peso e tela
            touchscreen com pagamento integrado — para acabar com as filas de caixa e
            transformar a experiência de compra na sua rede.
          </p>

          <div className="hero-cta-row flex items-center gap-4 flex-wrap">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-semibold border border-white/85 text-white transition-all hover:bg-[#D4E84A] hover:text-[#1a5c2a] hover:border-[#D4E84A]"
            >
              Descubra mais produtos! <ArrowRight size={18} />
            </Link>
            <a
              href="#tecnologia"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold"
              style={{ background: '#D4E84A', color: '#1a5c2a', border: '1.5px solid #D4E84A' }}
            >
              Ver tecnologia
            </a>
          </div>

          <div className="flex gap-10 mt-12">
            {[
              { num: '-92%', lbl: 'tempo no caixa' },
              { num: '+38%', lbl: 'ticket médio' },
              { num: '+120', lbl: 'lojas equipadas' },
            ].map((s) => (
              <div key={s.lbl} className="hero-stat">
                <div className="text-[30px] font-extrabold tracking-tight" style={{ color: '#D4E84A' }}>
                  {s.num}
                </div>
                <div className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart 3D */}
        <div className="hero-image flex items-center justify-center">
          <div className="relative w-full max-w-[420px]" style={{ aspectRatio: '1 / 1.05' }}>
            {show3D && (
              <Suspense fallback={null}>
                <SmartCart3D />
              </Suspense>
            )}
            {/* Mini screen overlay */}
            <div
              className="absolute bottom-6 right-[-18px] rounded-[14px] p-3.5 min-w-[180px] z-10"
              style={{
                background: 'rgba(15,61,26,0.92)',
                border: '1px solid rgba(212,232,74,0.4)',
                backdropFilter: 'blur(6px)',
                boxShadow: '0 20px 40px -16px rgba(0,0,0,0.6)',
              }}
            >
              {[['Arroz 5kg', 'R$ 28,90'], ['Café 500g', 'R$ 19,50'], ['Frutas (1,2kg)', 'R$ 11,40']].map(([item, price]) => (
                <div key={item} className="flex justify-between text-[12px] py-0.5" style={{ color: 'rgba(255,255,255,0.78)' }}>
                  <span>{item}</span><span>{price}</span>
                </div>
              ))}
              <div className="flex justify-between text-[12px] mt-1.5 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
                <span style={{ color: 'rgba(255,255,255,0.78)' }}>Total</span>
                <span className="font-extrabold text-[15px]" style={{ color: '#D4E84A' }}>R$ 59,80</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Diferenciais ────────────────────────────────────────────── */
const DIFERENCIAIS = [
  { icon: <Truck size={24} />, title: 'Frete Grátis', desc: 'Entrega gratuita para todo o Brasil em pedidos elegíveis.' },
  { icon: <Shield size={24} />, title: 'Garantia de 2 Anos', desc: 'Cobertura total contra defeitos de fabricação e hardware.' },
  { icon: <RefreshCcw size={24} />, title: 'Devolução em 30 Dias', desc: 'Não gostou? Devolva em até 30 dias, sem complicação.' },
  { icon: <CreditCard size={24} />, title: 'Até 12x sem Juros', desc: 'Parcele a modernização da sua rede em até 12 vezes.' },
]

function Diferenciais() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DIFERENCIAIS.map((d, i) => (
            <div
              key={d.title}
              className={`reveal delay-${i + 1} flex flex-col gap-3 p-7 rounded-[18px] border border-[#e0e0e0] bg-white transition-shadow hover:shadow-[0_18px_40px_-22px_rgba(26,92,42,0.4)]`}
            >
              <div className="w-[50px] h-[50px] rounded-[14px] grid place-items-center" style={{ background: '#1a5c2a', color: '#D4E84A' }}>
                {d.icon}
              </div>
              <h3 className="text-[16px] font-bold text-gray-900">{d.title}</h3>
              <p className="text-[14px] text-[#555] leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Produtos em Destaque ────────────────────────────────────── */
const PRODUTO_ICONS = {
  0: <ShoppingCart size={56} strokeWidth={1.6} />,
  1: <Plug size={52} strokeWidth={1.6} />,
  2: <ShoppingBasket size={56} strokeWidth={1.6} />,
  3: <Monitor size={56} strokeWidth={1.6} />,
}

function ProdutosDestaque() {
  const [destaques, setDestaques] = useState([])
  const [loading, setLoading] = useState(true)
  const gridRef = useRef(null)

  useEffect(() => {
    getProdutosDestaque()
      .then(({ data }) => setDestaques(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* Observa os cards depois que eles entram no DOM (pós-loading) */
  useEffect(() => {
    if (loading || !gridRef.current) return
    const cleanup = setupReveal(gridRef.current)
    return cleanup
  }, [loading])

  if (!loading && destaques.length === 0) return null

  return (
    <section className="py-24 bg-[#F5F5F5]" id="produtos">
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="text-center mb-14 reveal">
          <h2 className="font-extrabold tracking-tight leading-[1.12]" style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', color: '#1a1a1a' }}>
            Produtos em{' '}
            <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: '#2d7a3a' }}>
              Destaque
            </span>
          </h2>
          <p className="mt-3.5 text-[17px] text-[#555]">Selecionados especialmente para a sua rede</p>
        </div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[calc(50%-12px)] lg:w-[calc(25%-18px)] animate-pulse rounded-[18px] border border-[#e0e0e0] overflow-hidden">
                <div className="bg-[#e8f5e9] h-44" />
                <div className="p-5 flex flex-col gap-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="flex flex-wrap justify-center gap-6">
            {destaques.map((p, i) => (
              <div key={p.id} className={`reveal delay-${i + 1} w-[calc(50%-12px)] lg:w-[calc(25%-18px)]`}>
                <Link
                  to={`/produto/${p.slug}`}
                  className="flex flex-col h-full rounded-[18px] border border-[#e0e0e0] transition-all bg-white overflow-hidden transition-[transform,box-shadow,border-color] duration-300 ease-out hover:shadow-[0_24px_48px_-18px_rgba(26,92,42,0.35)] hover:-translate-y-2 hover:border-[#4CAF50]/40"
                >
                  <div
                    className="relative grid place-items-center"
                    style={{ aspectRatio: '1 / 0.92', background: 'repeating-linear-gradient(45deg, #e8f5e9 0 16px, #f0f9f1 16px 32px)' }}
                  >
                    {i === 0 && (
                      <span className="absolute top-3.5 left-3.5 text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: '#1a5c2a', color: '#D4E84A' }}>
                        Mais vendido
                      </span>
                    )}
                    {p.desconto_percentual > 0 && (
                      <span className="absolute top-3.5 right-3.5 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#e53935', color: '#fff' }}>
                        -{p.desconto_percentual}%
                      </span>
                    )}
                    {p.foto_url
                      ? <img src={imgUrl(p.foto_url, 400)} alt={p.nome} loading="lazy" className="w-full h-full object-cover" />
                      : <div style={{ color: '#1a5c2a' }}>{PRODUTO_ICONS[i % 4]}</div>
                    }
                  </div>
                  <div className="p-5 flex flex-col gap-1.5">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[#4CAF50]">Produto</span>
                    <h3 className="text-[17px] font-bold text-gray-900 line-clamp-2">{p.nome}</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-[22px] font-extrabold tracking-tight text-[#1a5c2a]">
                        {(Number(p.preco) * (1 - p.desconto_percentual / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      {p.desconto_percentual > 0 && (
                        <span className="text-[13px] text-gray-400 line-through">
                          {Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      )}
                    </div>
                    <span className="mt-3.5 block py-2.5 rounded-full text-[14px] font-semibold text-center border border-[#1a5c2a] text-[#1a5c2a] transition-colors group-hover:bg-[#1a5c2a] group-hover:text-white">
                      Ver produto
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Features ────────────────────────────────────────────────── */
const FEATURES = [
  { icon: <Radio size={26} />, title: 'RFID / NFC', desc: 'Leitores que identificam produtos automaticamente ao colocá-los no carrinho, sem precisar passar no caixa.' },
  { icon: <Eye size={26} />, title: 'Computer Vision (câmeras + IA)', desc: 'Câmeras que reconhecem os itens visualmente, úteis para frutas, verduras e produtos sem código de barras.' },
  { icon: <Scale size={26} />, title: 'Sensores de peso', desc: 'Balança integrada que valida o item reconhecido pela câmera ou RFID, evitando fraudes.' },
  { icon: <Hand size={26} />, title: 'Tela touchscreen', desc: 'Display que exibe a lista de compras, total em tempo real, promoções personalizadas e permite o pagamento direto no carrinho.' },
  { icon: <CreditCard size={26} />, title: 'Pagamento integrado (NFC / chip)', desc: 'Leitor de cartão ou aproximação direto no carrinho, eliminando a fila do caixa completamente.' },
  { icon: <Wifi size={26} />, title: 'Conectividade IoT (Wi-Fi / BT)', desc: 'O carrinho sincroniza estoque, envia dados e é rastreado em tempo real via Bluetooth e Wi-Fi.' },
]

function Features() {
  return (
    <section className="py-24 bg-white" id="tecnologia">
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="text-center mb-14 reveal">
          <h2 className="font-extrabold tracking-tight leading-[1.12]" style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', color: '#1a1a1a' }}>
            O que o{' '}
            <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: '#2d7a3a' }}>
              SmartCart
            </span>{' '}
            oferece?
          </h2>
          <p className="mt-3.5 text-[17px] text-[#555]">Descubra a tecnologia por trás de um produto SmartCart</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`reveal delay-${i + 1}`}>
              <div className="flex flex-col gap-3.5 p-8 rounded-[18px] border border-[#e0e0e0] bg-white h-full transition-[box-shadow,border-color] duration-300 ease-out hover:shadow-[0_22px_50px_-28px_rgba(26,92,42,0.45)] hover:border-[#4CAF50]">
                <div className="w-[52px] h-[52px] rounded-[14px] grid place-items-center" style={{ background: '#e8f5e9', color: '#1a5c2a' }}>
                  {f.icon}
                </div>
                <h3 className="text-[18px] font-bold text-gray-900">{f.title}</h3>
                <p className="text-[14.5px] text-[#555] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Testimonial ─────────────────────────────────────────────── */
function Testimonial() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1240px] mx-auto px-7 text-center mb-12 reveal">
        <h2 className="font-extrabold tracking-tight" style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', color: '#1a1a1a' }}>
          Veja o que é falado sobre os nossos produtos!
        </h2>
        <p className="mt-3.5 text-[17px] text-[#555]">Veja o que tá na boca do povo</p>
      </div>
      <div className="testimonial-section py-20" style={{ background: '#1a5c2a' }}>
        <div className="max-w-[920px] mx-auto px-7 text-center">
          <div className="leading-[0.6] mb-4 opacity-60" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 90, color: '#D4E84A' }}>"</div>
          <p className="quote-text font-bold leading-[1.28] tracking-[-0.8px] text-white min-h-[2.4em]" style={{ fontSize: 'clamp(24px, 3.4vw, 38px)' }} />
          <div className="quote-author mt-8" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <div className="font-bold text-[17px]" style={{ color: '#D4E84A' }}>Frederico Texeira de Campos</div>
            <div className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Texeira's Atacadão</div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA Final ───────────────────────────────────────────────── */
function CtaFinal() {
  return (
    <section className="py-24 bg-white text-center">
      <div className="max-w-[1240px] mx-auto px-7">
        <h2
          className="reveal font-extrabold tracking-[-1.2px] leading-[1.12] max-w-[820px] mx-auto"
          style={{ fontSize: 'clamp(30px, 4.4vw, 52px)', color: '#1a5c2a' }}
        >
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontWeight: 600, color: '#2d7a3a' }}>
            O que está esperando?
          </span>
          <br />
          Aproveite um mundo depois do SmartCart hoje mesmo.
        </h2>
        <p className="reveal delay-1 mt-4 text-[18px] text-[#555]">
          Fale com nosso time e equipe sua rede com a tecnologia que transforma o varejo.
        </p>
        <Link
          to="/produtos"
          className="reveal delay-2 mt-10 inline-flex items-center gap-2.5 px-12 py-4 rounded-full text-[17px] font-bold text-white transition-colors hover:bg-[#2d7a3a]"
          style={{ background: '#1a5c2a', border: '1.5px solid #1a5c2a' }}
        >
          Produtos <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  )
}

/* ── Home ────────────────────────────────────────────────────── */
export default function Home() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* 1. Hero entrance (GSAP — não depende de ScrollTrigger) */
    const ctx = gsap.context(() => {
      if (!reduce) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('.hero-eyebrow', { y: 30, opacity: 0, duration: 0.5 })
          .from('.hero-line',    { y: 80, opacity: 0, duration: 0.7, stagger: 0.2 }, '-=0.2')
          .from('.hero-subtitle',{ y: 40, duration: 0.6 }, '-=0.3')
          .from('.hero-cta-row', { scale: 0.85, opacity: 0, duration: 0.5, transformOrigin: 'left center' }, '-=0.2')
          .from('.hero-stat',    { y: 24, opacity: 0, duration: 0.5, stagger: 0.12 }, '-=0.2')
          .from('.hero-image',   { x: 120, opacity: 0, duration: 0.8 }, '-=0.9')

        /* Float do carrinho */
        gsap.to('.hero-image', { y: -12, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      }

      /* Testimonial typewriter */
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            gsap.to('.quote-text', { duration: 3, text: QUOTE, ease: 'none' })
            gsap.to('.quote-author', { opacity: 1, y: 0, duration: 0.8, delay: 2.6 })
            io.disconnect()
          }
        })
      }, { threshold: 0.3 })
      const testimonialSection = root.querySelector('.testimonial-section')
      if (testimonialSection) io.observe(testimonialSection)
    }, root)

    /* 2. Scroll reveal via IntersectionObserver (confiável, sem ScrollTrigger) */
    const cleanupReveal = reduce ? () => {} : setupReveal(root)

    return () => {
      ctx.revert()
      cleanupReveal()
    }
  }, [])

  return (
    <main ref={rootRef}>
      <Hero />
      <Diferenciais />
      <ProdutosDestaque />
      <Features />
      <SmartCartDemo />
      <Testimonial />
      <CtaFinal />
    </main>
  )
}

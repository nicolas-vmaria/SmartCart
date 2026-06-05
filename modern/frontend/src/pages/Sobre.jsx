import { Link, useParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Users, HelpCircle, Store, Briefcase, Handshake, ChevronRight, ChevronDown, MapPin, Phone, Clock, CheckCircle } from 'lucide-react'
import { FaLightbulb, FaHandshake, FaLeaf, FaUsers, FaStore } from 'react-icons/fa'
import { FaRocket as FaRocket6 } from 'react-icons/fa6'
import { getVagasPublicas } from '../lib/api/vagas'
import { areaCor } from '../lib/areaColors'

// ─── Quem Somos ───────────────────────────────────────────────────────────────
function QuemSomos() {
    return (
        <div className="flex flex-col gap-10">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Quem Somos</h2>
                <p className="text-gray-400 text-sm">Conheça a empresa por trás do SmartCart.</p>
            </div>

            <div className="flex flex-col gap-4">
                <p className="text-gray-600 leading-relaxed">
                    Em 2022, um grupo de engenheiros e entusiastas de varejo se reuniu com uma pergunta: <strong>por que ainda precisamos esperar em fila no caixa?</strong> Desse questionamento nasceu o SmartCart — um carrinho que pensa junto com você.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    Desde então, já transformamos a experiência de compra de mais de <span className="font-bold text-verde-escuro">500 mercados</span> em todo o Brasil, com tecnologia RFID, câmeras de visão computacional e pagamento integrado diretamente no carrinho.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { icon: FaStore,   valor: '500+',  label: 'Mercados atendidos'  },
                    { icon: FaUsers,   valor: '1M+',   label: 'Clientes impactados' },
                    { icon: FaRocket6, valor: '2022',  label: 'Ano de fundação'     },
                    { icon: FaLeaf,    valor: '100%',  label: 'Empresa brasileira'  },
                ].map(({ icon: Icon, valor, label }) => (
                    <div key={label} className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-2 hover:shadow-lg hover:scale-105 transition-all">
                        <Icon className="text-4xl text-verde-escuro" />
                        <h3 className="text-2xl font-bold text-verde-escuro">{valor}</h3>
                        <p className="text-gray-500 text-center text-sm">{label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-verde-escuro rounded-2xl p-8 flex flex-col gap-6">
                <h3 className="text-xl font-bold text-verde-claro text-center">Nossos valores</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: FaLightbulb, titulo: 'Inovação',        texto: 'Sempre um passo à frente, desenvolvendo tecnologia real.' },
                        { icon: FaHandshake, titulo: 'Parceria',         texto: 'Crescemos junto com os nossos clientes.' },
                        { icon: FaLeaf,      titulo: 'Sustentabilidade', texto: 'Menos papel, menos fila, mais eficiência.' },
                    ].map(({ icon: Icon, titulo, texto }) => (
                        <div key={titulo} className="bg-green-800/40 border border-green-600/40 rounded-xl p-5 flex flex-col gap-2">
                            <Icon className="text-2xl text-verde-claro" />
                            <h4 className="font-bold text-verde-claro">{titulo}</h4>
                            <p className="text-green-200 text-sm leading-relaxed">{texto}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const faqs = [
    { p: 'O SmartCart funciona em qualquer supermercado?',      r: 'O SmartCart é compatível com a grande maioria dos sistemas de gestão de varejo brasileiros. Realizamos uma análise de integração gratuita antes da instalação para garantir plena compatibilidade.' },
    { p: 'Quanto tempo leva a instalação?',                      r: 'O processo de instalação e treinamento da equipe leva em média 3 a 5 dias úteis, dependendo do tamanho da loja e do número de carrinhos adquiridos.' },
    { p: 'É necessário reformar a loja?',                        r: 'Não. O SmartCart é plug-and-play. Não exige obras, adaptações estruturais ou fiação adicional. Funciona via Wi-Fi e bateria recarregável.' },
    { p: 'O sistema funciona offline?',                          r: 'Sim. O SmartCart possui modo offline para situações de queda de conexão. Os dados são sincronizados automaticamente quando a conexão é restabelecida.' },
    { p: 'Como é feito o suporte técnico?',                      r: 'Oferecemos suporte remoto 24/7 e visitas técnicas presenciais dentro da garantia de 2 anos. Problemas críticos têm SLA de atendimento em até 4 horas úteis.' },
    { p: 'O pagamento pode ser feito por aproximação no carrinho?', r: 'Sim. O SmartCart Pro possui leitor NFC integrado, aceitando cartões por aproximação, smartwatches e pagamento via PIX direto na tela touchscreen.' },
    { p: 'Como funciona o controle de estoque?',                 r: 'Cada produto removido do carrinho é automaticamente comunicado ao sistema da loja via API, permitindo atualização de estoque em tempo real.' },
    { p: 'O produto possui garantia?',                           r: 'Sim. Todos os produtos SmartCart possuem garantia de 2 anos contra defeitos de fabricação, com cobertura de peças e mão de obra.' },
]

function FAQ() {
    const [aberto, setAberto] = useState(null)
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Perguntas Frequentes</h2>
                <p className="text-gray-400 text-sm">As dúvidas mais comuns sobre o SmartCart.</p>
            </div>
            <div className="flex flex-col gap-2">
                {faqs.map(({ p, r }, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setAberto(aberto === i ? null : i)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left font-bold text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {p}
                            <ChevronDown size={16} className={`shrink-0 ml-4 text-gray-400 transition-transform duration-300 ${aberto === i ? 'rotate-180' : ''}`} />
                        </button>
                        {aberto === i && (
                            <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                                {r}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-3">Não encontrou o que procurava?</p>
                <Link to="/contato" className="inline-block bg-verde-escuro text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                    Fale com a gente
                </Link>
            </div>
        </div>
    )
}

// ─── Franqueado ───────────────────────────────────────────────────────────────
function Franqueado() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Seja um Franqueado</h2>
                <p className="text-gray-400 text-sm">Leve o SmartCart para a sua região.</p>
            </div>

            <div className="bg-verde-escuro rounded-2xl p-8 text-center flex flex-col gap-3">
                <h3 className="text-2xl font-bold text-verde-claro">Por que ser um franqueado SmartCart?</h3>
                <p className="text-green-200 text-sm max-w-lg mx-auto leading-relaxed">
                    O mercado de varejo inteligente cresce 32% ao ano no Brasil. Seja parte dessa revolução com suporte total da nossa equipe.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { titulo: 'Suporte completo',     texto: 'Treinamento, instalação e assistência técnica inclusos.' },
                    { titulo: 'Território exclusivo', texto: 'Área de atuação delimitada e protegida por contrato.' },
                    { titulo: 'Marketing conjunto',   texto: 'Campanhas nacionais e material de venda fornecidos.' },
                    { titulo: 'ROI em 18 meses',      texto: 'Retorno médio de investimento comprovado pelos franqueados.' },
                ].map(({ titulo, texto }) => (
                    <div key={titulo} className="border border-gray-200 rounded-xl p-5 flex gap-3">
                        <CheckCircle size={18} className="text-verde-escuro shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{titulo}</p>
                            <p className="text-gray-400 text-xs mt-0.5">{texto}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="font-bold text-gray-800">Requisitos mínimos</h3>
                <ul className="flex flex-col gap-2 text-sm text-gray-500">
                    {[
                        'CNPJ ativo há no mínimo 12 meses',
                        'Capital de investimento a partir de R$ 80.000',
                        'Experiência no setor varejista (desejável)',
                        'Infraestrutura para showroom regional',
                    ].map(r => (
                        <li key={r} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-verde-escuro shrink-0" />
                            {r}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-3">Interessado? Envie seu contato e entraremos em breve.</p>
                <Link to="/contato" className="inline-block bg-verde-escuro text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                    Quero ser franqueado
                </Link>
            </div>
        </div>
    )
}

// ─── Nossas Lojas ─────────────────────────────────────────────────────────────
const lojas = [
    { cidade: 'São Paulo — SP',      end: 'Av. Paulista, 1000 — Bela Vista',   tel: '(11) 3000-0001', horario: 'Seg–Sex: 8h–18h' },
    { cidade: 'Curitiba — PR',       end: 'R. XV de Novembro, 500 — Centro',   tel: '(41) 3000-0002', horario: 'Seg–Sex: 8h–18h' },
    { cidade: 'Belo Horizonte — MG', end: 'Av. do Contorno, 200 — Centro',     tel: '(31) 3000-0003', horario: 'Seg–Sex: 8h–17h' },
    { cidade: 'Joinville — SC',      end: 'R. Max Colin, 326 — Centro',        tel: '(47) 3000-0004', horario: 'Seg–Sex: 8h–17h' },
    { cidade: 'Porto Alegre — RS',   end: 'Av. Borges de Medeiros, 100 — Centro', tel: '(51) 3000-0005', horario: 'Seg–Sex: 8h–18h' },
]

function NossasLojas() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Nossas Lojas</h2>
                <p className="text-gray-400 text-sm">Encontre um ponto de atendimento SmartCart perto de você.</p>
            </div>

            <div className="flex flex-col gap-3">
                {lojas.map(({ cidade, end, tel, horario }) => (
                    <div key={cidade} className="border border-gray-200 rounded-2xl p-5 flex gap-5 hover:border-verde-escuro/30 hover:bg-verde-escuro/5 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-verde-escuro/10 text-verde-escuro flex items-center justify-center shrink-0">
                            <Store size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-800">{cidade}</p>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
                                <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} /> {end}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Phone size={11} /> {tel}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} /> {horario}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-1">Não tem uma loja na sua cidade?</p>
                <p className="text-xs text-gray-400 mb-3">Atendemos remotamente em todo o Brasil.</p>
                <Link to="/contato" className="inline-block bg-verde-escuro text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                    Solicitar atendimento
                </Link>
            </div>
        </div>
    )
}

// ─── Trabalhe Conosco ─────────────────────────────────────────────────────────

function SkeletonVaga() {
    return (
        <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between animate-pulse">
            <div className="flex flex-col gap-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="flex gap-2">
                    <div className="h-4 w-16 bg-gray-200 rounded-full" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
            </div>
            <div className="h-7 w-20 bg-gray-200 rounded-full" />
        </div>
    )
}

function TrabalheConosco() {
    const [vagas, setVagas]   = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getVagasPublicas()
            .then(({ data }) => setVagas(data.vagas ?? []))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Trabalhe Conosco</h2>
                <p className="text-gray-400 text-sm">Faça parte do time que está reinventando o varejo brasileiro.</p>
            </div>

            <div className="bg-verde-escuro rounded-2xl p-8 flex flex-col gap-3 text-center">
                <h3 className="text-xl font-bold text-verde-claro">Por que trabalhar na SmartCart?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    {[
                        { t: 'Ambiente inovador',    d: 'Tecnologia de ponta no dia a dia' },
                        { t: 'Flexibilidade',        d: 'Vagas remotas e híbridas'         },
                        { t: 'Crescimento real',     d: 'Plano de carreira estruturado'    },
                    ].map(({ t, d }) => (
                        <div key={t} className="bg-green-800/40 border border-green-600/40 rounded-xl p-4">
                            <p className="font-bold text-verde-claro text-sm">{t}</p>
                            <p className="text-green-200 text-xs mt-1">{d}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-3">
                    Vagas abertas{!loading && vagas.length > 0 && <span className="ml-2 text-xs font-normal text-gray-400">({vagas.length})</span>}
                </h3>
                <div className="flex flex-col gap-2">
                    {loading
                        ? Array.from({ length: 3 }).map((_, i) => <SkeletonVaga key={i} />)
                        : vagas.length === 0
                            ? (
                                <div className="border border-gray-200 rounded-xl p-8 text-center">
                                    <Briefcase size={28} className="mx-auto text-gray-200 mb-2" />
                                    <p className="text-gray-400 text-sm">Nenhuma vaga aberta no momento.</p>
                                </div>
                            )
                            : vagas.map(v => (
                                <div key={v.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-verde-escuro/30 hover:bg-verde-escuro/5 transition-all">
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{v.cargo}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${areaCor[v.area] ?? 'bg-gray-100 text-gray-600'}`}>{v.area}</span>
                                            <span className="text-xs text-gray-400">{v.tipo_contrato} · {v.local}</span>
                                        </div>
                                    </div>
                                    <Link to={`/candidatura/${v.id}`} className="text-xs font-bold text-verde-escuro border border-verde-escuro px-3 py-1.5 rounded-full hover:bg-verde-escuro hover:text-white transition-all shrink-0">
                                        Candidatar
                                    </Link>
                                </div>
                            ))
                    }
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-500 text-sm mb-1">Não achou sua vaga?</p>
                <p className="text-xs text-gray-400 mb-3">Envie seu currículo e entraremos em contato em oportunidades futuras.</p>
                <Link to="/candidatura/espontanea" className="inline-block bg-verde-escuro text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                    Enviar currículo
                </Link>
            </div>
        </div>
    )
}

// ─── Dados das seções ─────────────────────────────────────────────────────────
const secoes = [
    { slug: 'quem-somos',           titulo: 'Quem Somos',           icon: Users,      componente: QuemSomos      },
    { slug: 'perguntas-frequentes', titulo: 'Perguntas Frequentes',  icon: HelpCircle, componente: FAQ            },
    { slug: 'seja-um-franqueado',   titulo: 'Seja um Franqueado',   icon: Handshake,  componente: Franqueado     },
    { slug: 'nossas-lojas',         titulo: 'Nossas Lojas',         icon: Store,      componente: NossasLojas    },
    { slug: 'trabalhe-conosco',     titulo: 'Trabalhe Conosco',     icon: Briefcase,  componente: TrabalheConosco},
]

const slugMap = Object.fromEntries(secoes.map(s => [s.slug, s]))

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Sobre() {
    const { slug } = useParams()

    if (!slug) return <Navigate to="/sobre/quem-somos" replace />

    const secao = slugMap[slug]
    if (!secao) return <Navigate to="/sobre/quem-somos" replace />

    const Conteudo = secao.componente

    return (
        <main className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-verde-escuro py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <p className="text-verde-claro/60 text-sm mb-2 flex items-center gap-1">
                        <Link to="/" className="hover:text-verde-claro transition-colors">Início</Link>
                        <ChevronRight size={14} />
                        Sobre
                        <ChevronRight size={14} />
                        <span className="text-verde-claro">{secao.titulo}</span>
                    </p>
                    <h1 className="text-3xl font-bold text-white">Sobre a SmartCart</h1>
                    <p className="text-verde-claro/70 mt-1 text-sm">Conheça mais sobre quem somos e como trabalhamos.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                {/* Sidebar */}
                <aside className="w-full lg:w-56 lg:shrink-0 lg:sticky lg:top-28">
                    <nav className="bg-white rounded-2xl border border-gray-200 overflow-x-auto flex flex-row lg:flex-col">
                        {secoes.map(({ slug: s, titulo, icon: Icon }) => {
                            const active = s === slug
                            return (
                                <Link
                                    key={s}
                                    to={`/sobre/${s}`}
                                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold transition-colors shrink-0 whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2
                                        ${active
                                            ? 'border-verde-escuro bg-verde-escuro/5 text-verde-escuro'
                                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                                >
                                    <Icon size={15} className={active ? 'text-verde-escuro' : 'text-gray-400'} />
                                    {titulo}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Conteúdo */}
                <article className="flex-1 bg-white rounded-2xl border border-gray-200 p-5 sm:p-8">
                    <Conteudo />
                </article>

            </div>
        </main>
    )
}

import { useState, useRef, useEffect } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import { Search, SlidersHorizontal, Trash2, X, Download, FileText, Mail, Phone, Link2, ChevronDown } from 'lucide-react'
import { vagas, areaCor } from '../../data/vagas'

const statusStyle = {
    'Novo':        'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    'Em análise':  'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    'Aprovado':    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    'Reprovado':   'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

const inputCls = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all w-full"

const mockCurriculos = [
    { id: 1,  nome: 'Rafael Mendonça',    email: 'rafael@email.com',   telefone: '(11) 98001-1111', linkedin: 'linkedin.com/in/rafaelm', cargo: 'Desenvolvedor(a) Full Stack',  area: 'Tecnologia', data: '02/05/2026', status: 'Novo',       carta: 'Tenho 5 anos de experiência com React e Python. Acredito que posso contribuir muito com a equipe técnica da SmartCart, especialmente nas integrações de tempo real com sistemas de loja.' },
    { id: 2,  nome: 'Camila Ferreira',    email: 'camila@email.com',   telefone: '(21) 97002-2222', linkedin: 'linkedin.com/in/camilaf', cargo: 'Executivo(a) de Vendas B2B',  area: 'Comercial',  data: '01/05/2026', status: 'Em análise', carta: 'Atuei por 7 anos em vendas B2B no setor varejista, com carteira de mais de 50 redes de supermercados. Minha experiência é exatamente o que a SmartCart precisa para expandir no Sul e Sudeste.' },
    { id: 3,  nome: 'Bruno Alves',        email: 'bruno@email.com',    telefone: '(31) 96003-3333', linkedin: '',                        cargo: 'Técnico(a) de Campo',          area: 'Operações',  data: '30/04/2026', status: 'Aprovado',   carta: 'Tenho CREA ativo, CNH B e experiência em manutenção de equipamentos eletrônicos. Disponibilidade total para viagens na região Sul.' },
    { id: 4,  nome: 'Larissa Souza',      email: 'larissa@email.com',  telefone: '(41) 95004-4444', linkedin: 'linkedin.com/in/larisas', cargo: 'Analista de Suporte Técnico', area: 'Suporte',    data: '29/04/2026', status: 'Reprovado',  carta: 'Tenho 3 anos de experiência em suporte N1 e N2. Trabalho bem sob pressão e tenho facilidade para explicar questões técnicas a usuários não técnicos.' },
    { id: 5,  nome: 'Thiago Costa',       email: 'thiago@email.com',   telefone: '(51) 94005-5555', linkedin: 'linkedin.com/in/thiagoc', cargo: 'Engenheiro(a) de Hardware',   area: 'Tecnologia', data: '28/04/2026', status: 'Em análise', carta: 'Formado em Engenharia Eletrônica pela USP. Tenho experiência com hardware embarcado, RFID e protocolos IoT. Já desenvolvi soluções de rastreamento para o setor logístico.' },
    { id: 6,  nome: 'Fernanda Lima',      email: 'fernanda@email.com', telefone: '(62) 93006-6666', linkedin: 'linkedin.com/in/ferndl',  cargo: 'Desenvolvedor(a) Full Stack',  area: 'Tecnologia', data: '27/04/2026', status: 'Novo',       carta: 'Desenvolvedora com foco em React e Node.js, atualmente buscando migrar para um ambiente de maior impacto. A SmartCart representa exatamente o tipo de desafio que procuro.' },
    { id: 7,  nome: 'Marcos Ribeiro',     email: 'marcos@email.com',   telefone: '(85) 92007-7777', linkedin: '',                        cargo: 'Executivo(a) de Vendas B2B',  area: 'Comercial',  data: '26/04/2026', status: 'Novo',       carta: 'Gestor de contas com experiência no setor de tecnologia para varejo. Tenho network consolidado com decisores de grandes redes atacadistas do Nordeste.' },
    { id: 8,  nome: 'Juliana Cardoso',    email: 'juliana@email.com',  telefone: '(48) 91008-8888', linkedin: 'linkedin.com/in/julianac',cargo: 'Analista de Suporte Técnico', area: 'Suporte',    data: '25/04/2026', status: 'Em análise', carta: 'Atuo há 4 anos em helpdesk técnico em empresa de software de gestão. Tenho certificação ITIL e experiência com atendimento a redes varejistas.' },
]

export default function AdminCurriculos() {
    const [curriculos, setCurriculos] = useState(mockCurriculos)
    const [search, setSearch]         = useState('')
    const [selected, setSelected]     = useState([])
    const [detalhe, setDetalhe]       = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters]       = useState({ status: 'Todos', area: 'Todos', cargo: 'Todos' })
    const filterRef = useRef(null)

    useEffect(() => {
        const handler = e => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const activeFiltersCount = [
        filters.status !== 'Todos',
        filters.area   !== 'Todos',
        filters.cargo  !== 'Todos',
    ].filter(Boolean).length

    const areas  = ['Todos', ...new Set(mockCurriculos.map(c => c.area))]
    const cargos = ['Todos', ...vagas.map(v => v.cargo)]

    const filtered = curriculos.filter(c => {
        const q = search.toLowerCase()
        const matchSearch = c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.cargo.toLowerCase().includes(q)
        const matchStatus = filters.status === 'Todos' || c.status === filters.status
        const matchArea   = filters.area   === 'Todos' || c.area   === filters.area
        const matchCargo  = filters.cargo  === 'Todos' || c.cargo  === filters.cargo
        return matchSearch && matchStatus && matchArea && matchCargo
    })

    const allSelected = filtered.length > 0 && filtered.every(c => selected.includes(c.id))

    const toggleOne = id => setSelected(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
    const toggleAll = () => allSelected
        ? setSelected(p => p.filter(id => !filtered.map(c => c.id).includes(id)))
        : setSelected(p => [...new Set([...p, ...filtered.map(c => c.id)])])

    const deleteSelected = () => { setCurriculos(p => p.filter(c => !selected.includes(c.id))); setSelected([]) }

    const setStatus = (id, status) => {
        setCurriculos(p => p.map(c => c.id === id ? { ...c, status } : c))
        setDetalhe(p => p ? { ...p, status } : null)
    }

    const stats = {
        total:      curriculos.length,
        novos:      curriculos.filter(c => c.status === 'Novo').length,
        analise:    curriculos.filter(c => c.status === 'Em análise').length,
        aprovados:  curriculos.filter(c => c.status === 'Aprovado').length,
    }

    return (
        <main>
            <AdminHeader title="Currículos" description="Gerencie as candidaturas recebidas pelo site." />

            {/* Cards de resumo */}
            <div className="grid grid-cols-4 gap-4 mt-5">
                {[
                    { label: 'Total',       valor: stats.total,     cor: 'text-gray-800 dark:text-(--admin-text)'   },
                    { label: 'Novos',       valor: stats.novos,     cor: 'text-blue-600'                            },
                    { label: 'Em análise',  valor: stats.analise,   cor: 'text-yellow-600'                          },
                    { label: 'Aprovados',   valor: stats.aprovados, cor: 'text-green-600'                           },
                ].map(({ label, valor, cor }) => (
                    <div key={label} className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                        <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                        <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
                    </div>
                ))}
            </div>

            {/* Tabela */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">

                {/* Barra de ações */}
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted) shrink-0" />
                        <input
                            placeholder="Buscar por nome, e-mail ou cargo..."
                            className="outline-none dark:bg-(--admin-card) dark:text-(--admin-text) text-sm w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilters(p => !p)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                                ${activeFiltersCount > 0 ? 'border-verde-escuro text-verde-escuro bg-green-50 dark:bg-(--admin-accent-soft) dark:text-(--admin-accent) dark:border-(--admin-accent)' : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}
                        >
                            <SlidersHorizontal size={15} />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>
                            )}
                        </button>

                        {showFilters && (
                            <div className="absolute top-11 left-0 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-xl shadow-lg dark:shadow-black/40 p-4 z-20 w-56 flex flex-col gap-4">
                                {[
                                    { key: 'status', label: 'Status',  opts: ['Todos', 'Novo', 'Em análise', 'Aprovado', 'Reprovado'] },
                                    { key: 'area',   label: 'Área',    opts: areas   },
                                ].map(({ key, label, opts }) => (
                                    <div key={key} className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">{label}</label>
                                        {opts.map(opt => (
                                            <button key={opt} onClick={() => setFilters(p => ({ ...p, [key]: opt }))}
                                                className={`text-left text-sm px-2 py-1 rounded-md transition-all
                                                    ${filters[key] === opt ? 'bg-green-50 dark:bg-(--admin-accent-soft) text-verde-escuro dark:text-(--admin-accent) font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                                {activeFiltersCount > 0 && (
                                    <button onClick={() => setFilters({ status: 'Todos', area: 'Todos', cargo: 'Todos' })}
                                        className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button onClick={deleteSelected}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all">
                            <Trash2 size={15} />
                            Excluir {selected.length}
                        </button>
                    )}

                    <span className="ml-auto text-sm text-gray-400 dark:text-(--admin-text-muted)">{filtered.length} candidatura(s)</span>
                </div>

                {/* Tabela */}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 pr-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                            </th>
                            <th className="pb-3 font-medium">Candidato</th>
                            <th className="pb-3 font-medium">Cargo</th>
                            <th className="pb-3 font-medium">Área</th>
                            <th className="pb-3 font-medium">Data</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 transition-colors ${selected.includes(c.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                <td className="py-3 pr-3">
                                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleOne(c.id)} className="cursor-pointer" />
                                </td>
                                <td className="py-3">
                                    <p className="font-medium text-verde-escuro dark:text-(--admin-accent)">{c.nome}</p>
                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{c.email}</p>
                                </td>
                                <td className="py-3 text-gray-600 dark:text-(--admin-text) max-w-48">
                                    <p className="truncate">{c.cargo}</p>
                                </td>
                                <td className="py-3">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${areaCor[c.area]}`}>{c.area}</span>
                                </td>
                                <td className="py-3 text-gray-400 dark:text-(--admin-text-muted) text-xs">{c.data}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[c.status]}`}>{c.status}</span>
                                </td>
                                <td className="py-3">
                                    <button
                                        onClick={() => setDetalhe(c)}
                                        className="text-xs font-bold text-verde-escuro dark:text-(--admin-accent) border border-verde-escuro dark:border-(--admin-accent) px-3 py-1 rounded-full hover:bg-verde-escuro dark:hover:bg-(--admin-accent) hover:text-white dark:hover:text-black transition-all"
                                    >
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-gray-400 dark:text-(--admin-text-muted)">
                                    Nenhuma candidatura encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de detalhe */}
            {detalhe && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl w-full max-w-lg shadow-2xl dark:shadow-black/60 flex flex-col max-h-[90vh]">

                        {/* Header modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-(--admin-border)">
                            <div>
                                <h2 className="font-bold text-lg text-verde-escuro dark:text-(--admin-accent)">{detalhe.nome}</h2>
                                <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{detalhe.cargo}</p>
                            </div>
                            <button onClick={() => setDetalhe(null)}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="overflow-y-auto p-6 flex flex-col gap-5">

                            {/* Infos */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { icon: Mail,     label: 'E-mail',    valor: detalhe.email    },
                                    { icon: Phone,    label: 'Telefone',  valor: detalhe.telefone },
                                    { icon: Link2,    label: 'LinkedIn',  valor: detalhe.linkedin || '—' },
                                    { icon: FileText, label: 'Enviado em',valor: detalhe.data     },
                                ].map(({ icon: Icon, label, valor }) => (
                                    <div key={label} className="bg-gray-50 dark:bg-(--admin-input) rounded-xl p-3 flex items-start gap-2">
                                        <Icon size={14} className="text-gray-400 dark:text-(--admin-text-muted) mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                                            <p className="font-medium text-gray-700 dark:text-(--admin-text) break-all">{valor}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Área + badge */}
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${areaCor[detalhe.area]}`}>{detalhe.area}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyle[detalhe.status]}`}>{detalhe.status}</span>
                            </div>

                            {/* Carta */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Carta de apresentação</p>
                                <p className="text-sm text-gray-600 dark:text-(--admin-text) leading-relaxed bg-gray-50 dark:bg-(--admin-input) rounded-xl p-4">
                                    {detalhe.carta}
                                </p>
                            </div>

                            {/* Mudar status */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Atualizar status</p>
                                <div className="flex gap-2 flex-wrap">
                                    {['Novo', 'Em análise', 'Aprovado', 'Reprovado'].map(s => (
                                        <button key={s} onClick={() => setStatus(detalhe.id, s)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer
                                                ${detalhe.status === s
                                                    ? statusStyle[s]
                                                    : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer modal */}
                        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-(--admin-border)">
                            <button className="flex items-center gap-2 flex-1 justify-center border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                <Download size={15} /> Baixar currículo
                            </button>
                            <button
                                onClick={() => { setCurriculos(p => p.filter(c => c.id !== detalhe.id)); setDetalhe(null) }}
                                className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all">
                                <Trash2 size={15} /> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export const vagas = [
    {
        slug:  'engenheiro-hardware',
        cargo: 'Engenheiro(a) de Hardware',
        area:  'Tecnologia',
        tipo:  'CLT',
        local: 'São Paulo — SP',
        descricao: 'Responsável pelo desenvolvimento e manutenção dos componentes eletrônicos do SmartCart, incluindo leitores RFID, sensores de peso e módulos de conectividade IoT.',
        requisitos: [
            'Graduação em Engenharia Elétrica, Eletrônica ou afins',
            'Experiência com hardware embarcado e microcontroladores',
            'Conhecimento em protocolos de comunicação (SPI, I2C, UART)',
            'Familiaridade com ferramentas EDA (KiCad, Altium)',
        ],
        diferenciais: [
            'Experiência com sistemas RFID/NFC',
            'Conhecimento em IoT e comunicação sem fio (BLE, Wi-Fi)',
        ],
    },
    {
        slug:  'desenvolvedor-full-stack',
        cargo: 'Desenvolvedor(a) Full Stack',
        area:  'Tecnologia',
        tipo:  'CLT',
        local: 'Remoto',
        descricao: 'Atuará no desenvolvimento e evolução da plataforma web SmartCart, trabalhando com React no frontend e Python/Flask no backend, integrando sistemas de loja em tempo real.',
        requisitos: [
            'Sólida experiência com React e JavaScript moderno',
            'Experiência com Python (Flask ou FastAPI)',
            'Conhecimento em banco de dados relacionais (MySQL/PostgreSQL)',
            'Familiaridade com APIs RESTful e integrações',
        ],
        diferenciais: [
            'Experiência com sistemas de varejo ou PDV',
            'Conhecimento em WebSockets e comunicação em tempo real',
        ],
    },
    {
        slug:  'tecnico-campo',
        cargo: 'Técnico(a) de Campo',
        area:  'Operações',
        tipo:  'CLT',
        local: 'Curitiba — PR',
        descricao: 'Realizará instalação, configuração e manutenção dos carrinhos SmartCart nos clientes da região Sul do Brasil, prestando suporte técnico presencial e garantindo o bom funcionamento dos equipamentos.',
        requisitos: [
            'Curso técnico em Eletrônica, Informática ou afins',
            'Disponibilidade para viagens na região Sul',
            'Habilitação categoria B',
            'Habilidades de comunicação e atendimento ao cliente',
        ],
        diferenciais: [
            'Experiência em manutenção de equipamentos de varejo',
            'Conhecimento básico em redes Wi-Fi',
        ],
    },
    {
        slug:  'executivo-vendas-b2b',
        cargo: 'Executivo(a) de Vendas B2B',
        area:  'Comercial',
        tipo:  'CLT + Bônus',
        local: 'São Paulo — SP',
        descricao: 'Responsável pela prospecção e fechamento de contratos com redes de supermercados e atacadistas, apresentando as soluções SmartCart e gerenciando o relacionamento com clientes estratégicos.',
        requisitos: [
            'Experiência comprovada em vendas B2B consultivas',
            'Conhecimento do setor varejista',
            'Perfil hunter com foco em resultados',
            'Excelente comunicação e negociação',
        ],
        diferenciais: [
            'Rede de contatos no setor supermercadista',
            'Experiência com vendas de tecnologia para varejo',
        ],
    },
    {
        slug:  'analista-suporte-tecnico',
        cargo: 'Analista de Suporte Técnico',
        area:  'Suporte',
        tipo:  'CLT',
        local: 'Remoto',
        descricao: 'Atenderá chamados de suporte técnico de clientes SmartCart, realizando diagnósticos remotos, orientando equipes de loja e escalando ocorrências críticas para a equipe de campo.',
        requisitos: [
            'Experiência em suporte técnico de TI ou equipamentos',
            'Boa comunicação escrita e verbal',
            'Capacidade de diagnóstico e resolução de problemas',
            'Disponibilidade para trabalho em turnos rotativos',
        ],
        diferenciais: [
            'Conhecimento em redes e conectividade',
            'Experiência com sistemas de chamados (Zendesk, Jira)',
        ],
    },
]

export const vagasPorSlug = {
    ...Object.fromEntries(vagas.map(v => [v.slug, v])),
    espontanea: {
        slug: 'espontanea',
        cargo: 'Candidatura Espontânea',
        area: null,
        tipo: null,
        local: null,
        descricao: 'Não encontrou a vaga certa? Envie seu currículo e entraremos em contato quando surgir uma oportunidade alinhada ao seu perfil.',
        requisitos: [],
        diferenciais: [],
    },
}

export const areaCor = {
    'Tecnologia': 'bg-blue-100 text-blue-700',
    'Operações':  'bg-orange-100 text-orange-700',
    'Comercial':  'bg-purple-100 text-purple-700',
    'Suporte':    'bg-green-100 text-green-700',
}

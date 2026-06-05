import { Link, useParams, Navigate } from 'react-router-dom'
import { Shield, FileText, RefreshCw, Truck, CreditCard, ChevronRight } from 'lucide-react'

const politicas = [
    {
        slug: 'privacidade',
        titulo: 'Privacidade',
        icon: Shield,
        conteudo: [
            {
                titulo: '1. Coleta de Dados',
                texto: `A SmartCart coleta apenas os dados necessários para a prestação dos nossos serviços, incluindo: nome completo, CNPJ, endereço de e-mail, telefone e endereço de entrega. Essas informações são fornecidas diretamente por você no momento do cadastro ou da realização de um pedido.`,
            },
            {
                titulo: '2. Uso das Informações',
                texto: `Seus dados são utilizados exclusivamente para: processar e entregar seus pedidos, enviar confirmações e atualizações de status, oferecer suporte ao cliente e, com seu consentimento, enviar comunicações sobre novidades e promoções.`,
            },
            {
                titulo: '3. Compartilhamento',
                texto: `A SmartCart não vende, aluga ou compartilha suas informações pessoais com terceiros para fins de marketing. Dados podem ser compartilhados apenas com parceiros logísticos e processadores de pagamento estritamente necessários para a conclusão do seu pedido.`,
            },
            {
                titulo: '4. Segurança',
                texto: `Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Todas as transações financeiras são criptografadas via SSL.`,
            },
            {
                titulo: '5. Seus Direitos (LGPD)',
                texto: `Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem o direito de acessar, corrigir, excluir ou portar seus dados a qualquer momento. Para exercer esses direitos, entre em contato pelo e-mail sac@smartcart.com.br.`,
            },
            {
                titulo: '6. Cookies',
                texto: `Utilizamos cookies para melhorar sua experiência de navegação, analisar o tráfego do site e personalizar conteúdo. Você pode desativar cookies no seu navegador, mas isso pode afetar algumas funcionalidades.`,
            },
        ],
    },
    {
        slug: 'termos-de-uso',
        titulo: 'Termos de Uso',
        icon: FileText,
        conteudo: [
            {
                titulo: '1. Aceitação dos Termos',
                texto: `Ao acessar e utilizar o site da SmartCart, você concorda com os presentes Termos de Uso. Caso não concorde com qualquer disposição, solicitamos que não utilize nossos serviços.`,
            },
            {
                titulo: '2. Elegibilidade',
                texto: `Nossos produtos são destinados exclusivamente a pessoas jurídicas (empresas). Para realizar um cadastro e efetuar compras, é necessário possuir CNPJ válido e ativo. O usuário deve ter capacidade legal para contratar.`,
            },
            {
                titulo: '3. Conta do Usuário',
                texto: `Você é responsável por manter a confidencialidade de suas credenciais de acesso. A SmartCart não se responsabiliza por danos decorrentes do uso não autorizado da sua conta. Em caso de suspeita de acesso indevido, altere sua senha imediatamente e entre em contato conosco.`,
            },
            {
                titulo: '4. Propriedade Intelectual',
                texto: `Todo o conteúdo do site — textos, imagens, logotipos, interfaces e tecnologias — é de propriedade exclusiva da SmartCart ou de seus licenciadores, protegido por leis de direitos autorais e propriedade industrial. É proibida a reprodução sem autorização prévia e por escrito.`,
            },
            {
                titulo: '5. Limitação de Responsabilidade',
                texto: `A SmartCart não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso ou da impossibilidade de uso do site ou dos produtos. Nossa responsabilidade está limitada ao valor do pedido realizado.`,
            },
            {
                titulo: '6. Alterações',
                texto: `A SmartCart reserva-se o direito de modificar estes termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail com antecedência mínima de 15 dias. O uso contínuo do site após as alterações implica aceitação dos novos termos.`,
            },
        ],
    },
    {
        slug: 'trocas-e-devolucao',
        titulo: 'Trocas e Devolução',
        icon: RefreshCw,
        conteudo: [
            {
                titulo: '1. Prazo para Devolução',
                texto: `Você tem até 30 dias corridos a partir da data de recebimento do produto para solicitar troca ou devolução, conforme o artigo 49 do Código de Defesa do Consumidor. Após esse prazo, a devolução só será aceita em casos de defeito coberto pela garantia.`,
            },
            {
                titulo: '2. Condições do Produto',
                texto: `Para que a troca ou devolução seja aceita, o produto deve ser devolvido em sua embalagem original, sem sinais de uso indevido, com todos os acessórios, manuais e notas fiscais. Produtos com danos causados por mau uso não serão aceitos.`,
            },
            {
                titulo: '3. Como Solicitar',
                texto: `Para iniciar o processo, entre em contato com nosso SAC pelo e-mail sac@smartcart.com.br ou pelo telefone (45) 99999-9999, de segunda a quinta-feira, das 8h às 18h. Nossa equipe fornecerá as instruções de envio e o código de autorização de devolução.`,
            },
            {
                titulo: '4. Custos de Envio',
                texto: `Em caso de defeito do produto ou erro no envio por nossa parte, os custos de frete para devolução serão 100% cobertos pela SmartCart. Em casos de arrependimento de compra, o frete de retorno é de responsabilidade do cliente.`,
            },
            {
                titulo: '5. Reembolso',
                texto: `Após o recebimento e análise do produto devolvido (prazo de até 5 dias úteis), o reembolso será processado na mesma forma de pagamento utilizada na compra, em até 7 dias úteis para PIX e boleto, ou na fatura subsequente para cartão de crédito.`,
            },
            {
                titulo: '6. Garantia',
                texto: `Todos os produtos SmartCart possuem garantia de 2 anos contra defeitos de fabricação, a partir da data de emissão da nota fiscal. Defeitos causados por acidentes, mau uso, instalações incorretas ou modificações não autorizadas não são cobertos pela garantia.`,
            },
        ],
    },
    {
        slug: 'entrega-e-frete',
        titulo: 'Entrega e Frete',
        icon: Truck,
        conteudo: [
            {
                titulo: '1. Frete Grátis',
                texto: `A SmartCart oferece frete grátis para todo o Brasil em todos os pedidos, sem valor mínimo de compra. Acreditamos que o custo do frete não deve ser um obstáculo para que nossos clientes tenham acesso à melhor tecnologia de carrinho inteligente.`,
            },
            {
                titulo: '2. Prazo de Entrega',
                texto: `O prazo de entrega varia de 5 a 15 dias úteis após a confirmação do pagamento, dependendo da região de destino. Regiões metropolitanas das capitais costumam receber em 5 a 8 dias úteis. Regiões remotas podem levar até 15 dias úteis.`,
            },
            {
                titulo: '3. Processamento do Pedido',
                texto: `Após a confirmação do pagamento, seu pedido entra em fila de separação e embalagem. Esse processo leva de 1 a 2 dias úteis. Pedidos confirmados após as 14h serão processados no próximo dia útil.`,
            },
            {
                titulo: '4. Rastreamento',
                texto: `Assim que seu pedido for despachado, você receberá um e-mail com o código de rastreamento e o link para acompanhar a entrega em tempo real. O acompanhamento também fica disponível na sua área de cliente, em "Meus Pedidos".`,
            },
            {
                titulo: '5. Entrega e Recebimento',
                texto: `A entrega será realizada no endereço cadastrado no pedido, em dias úteis, durante horário comercial. Caso não haja ninguém no local para receber, o transportador tentará a entrega por mais 2 vezes antes de encaminhar o produto para uma unidade de retirada.`,
            },
            {
                titulo: '6. Avarias no Transporte',
                texto: `Ao receber seu pedido, confira o estado da embalagem antes de assinar o comprovante. Em caso de embalagem danificada, recuse o recebimento e entre em contato conosco imediatamente. Avarias não relatadas em até 48h após a entrega podem não ser cobertas.`,
            },
        ],
    },
    {
        slug: 'pagamento',
        titulo: 'Pagamento',
        icon: CreditCard,
        conteudo: [
            {
                titulo: '1. Formas de Pagamento',
                texto: `A SmartCart aceita as seguintes formas de pagamento: PIX (confirmação imediata), boleto bancário (compensação em até 2 dias úteis), e cartão de crédito das bandeiras Visa, Mastercard, American Express, Elo e Hipercard.`,
            },
            {
                titulo: '2. Parcelamento',
                texto: `Compras no cartão de crédito podem ser parceladas em até 12 vezes sem juros. O valor mínimo de cada parcela é de R$ 50,00. O parcelamento está sujeito à análise e aprovação da administradora do cartão.`,
            },
            {
                titulo: '3. PIX',
                texto: `O pagamento via PIX é processado de forma imediata, 24 horas por dia, 7 dias por semana. Após a geração do QR Code, você tem 30 minutos para realizar o pagamento. O pedido é confirmado automaticamente após a identificação da transferência.`,
            },
            {
                titulo: '4. Boleto Bancário',
                texto: `O boleto bancário vence em 3 dias úteis após a emissão. Após o pagamento, a compensação bancária pode levar até 2 dias úteis para ser identificada. O pedido será processado somente após a confirmação do pagamento.`,
            },
            {
                titulo: '5. Segurança nas Transações',
                texto: `Todas as transações realizadas no site da SmartCart são protegidas por criptografia SSL (Secure Socket Layer). Não armazenamos dados completos de cartão de crédito em nossos servidores. O processamento é realizado por gateways de pagamento certificados PCI-DSS.`,
            },
            {
                titulo: '6. Nota Fiscal',
                texto: `A nota fiscal eletrônica (NF-e) é emitida em nome do CNPJ cadastrado na sua conta e enviada por e-mail após a confirmação do pagamento. Também fica disponível na sua área de cliente. A emissão da nota é requisito para processamento de qualquer devolução.`,
            },
        ],
    },
]

const slugMap = Object.fromEntries(politicas.map(p => [p.slug, p]))

export default function Politicas() {
    const { slug } = useParams()

    if (!slug) return <Navigate to="/politicas/privacidade" replace />

    const politica = slugMap[slug]
    if (!politica) return <Navigate to="/politicas/privacidade" replace />

    return (
        <main className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-verde-escuro py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <p className="text-verde-claro/60 text-sm mb-2 flex items-center gap-1">
                        <Link to="/" className="hover:text-verde-claro transition-colors">Início</Link>
                        <ChevronRight size={14} />
                        Políticas
                        <ChevronRight size={14} />
                        <span className="text-verde-claro">{politica.titulo}</span>
                    </p>
                    <h1 className="text-3xl font-bold text-white">Central de Políticas</h1>
                    <p className="text-verde-claro/70 mt-1 text-sm">Transparência e clareza sobre como operamos.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                {/* Sidebar */}
                <aside className="w-full lg:w-56 lg:shrink-0 lg:sticky lg:top-28">
                    <nav className="bg-white rounded-2xl border border-gray-200 overflow-x-auto flex flex-row lg:flex-col">
                        {politicas.map(({ slug: s, titulo, icon: Icon }) => {
                            const active = s === slug
                            return (
                                <Link
                                    key={s}
                                    to={`/politicas/${s}`}
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
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-verde-escuro/10 text-verde-escuro flex items-center justify-center">
                            <politica.icon size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Política de {politica.titulo}</h2>
                            <p className="text-xs text-gray-400">Última atualização: maio de 2026</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-7">
                        {politica.conteudo.map(({ titulo, texto }) => (
                            <div key={titulo}>
                                <h3 className="font-bold text-gray-800 mb-2">{titulo}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{texto}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Dúvidas? Entre em contato: <span className="font-bold">sac@smartcart.com.br</span></p>
                        <Link to="/contato" className="text-sm font-bold text-verde-escuro border border-verde-escuro px-4 py-2 rounded-full hover:bg-verde-escuro hover:text-white transition-all">
                            Fale conosco
                        </Link>
                    </div>
                </article>

            </div>
        </main>
    )
}

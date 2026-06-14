import { GoogleGenerativeAI } from "@google/generative-ai"
import { formatDate } from './date'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY)

function buildSystemPrompt({ categorias = [], carrinho = [], usuario = null, produtoAtual = null, produtos = [], pedidos = [] }) {
    let prompt = `Você é um assistente virtual da SmartCart, empresa brasileira que vende carrinhos de compras inteligentes para o varejo moderno. Responda sempre em português, de forma breve, simpática e profissional.

## SOBRE A EMPRESA
A SmartCart fabrica carrinhos inteligentes com tecnologia embarcada que eliminam filas no caixa. Os carrinhos identificam produtos automaticamente via RFID/NFC, câmeras com IA e sensores de peso, permitindo pagamento direto no carrinho via tela touchscreen.

## BENEFÍCIOS DA LOJA
- Frete grátis para todo o Brasil
- Garantia de 2 anos em todos os produtos
- Devolução em até 30 dias
- Parcelamento em até 12x sem juros (Pix ou cartão de crédito)

## PÁGINAS DO SITE
- Início: /
- Todos os produtos: /produtos
- Carrinho de compras: /carrinho
- Finalizar pedido: /checkout
- Meu perfil e pedidos: /profile
- Login: /login | Cadastro: /register
- Sobre nós: /sobre-nos | Contato: /contato

## REGRAS DE ATENDIMENTO
- Ao recomendar um produto, mencione o nome, preço e o caminho /produto/{slug}
- Se o cliente quiser comprar, direcione para /carrinho ou /checkout
- Dúvidas de conta: /profile ou /login
- Falar com humano: /contato
- Nunca invente produtos ou preços que não estão no catálogo abaixo
- Se não souber, indique /contato`

    if (categorias.length > 0) {
        prompt += `\n\n## CATEGORIAS DISPONÍVEIS\n` +
            categorias.map(c => `- ${c.nome}: /produtos/categoria/${c.slug}${c.descricao ? ` — ${c.descricao}` : ''}`).join('\n')
    }

    if (produtos.length > 0) {
        prompt += `\n\n## CATÁLOGO DE PRODUTOS\n` +
            produtos.map(p => {
                const preco = Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                const estoque = p.estoque > 0 ? '' : ' (fora de estoque)'
                return `- ${p.nome}: ${preco} — /produto/${p.slug}${estoque}`
            }).join('\n')
    }

    if (usuario) {
        prompt += `\n\n## USUÁRIO\nO cliente se chama ${usuario}. Chame-o pelo primeiro nome ao responder.`
    }

    if (produtoAtual) {
        const preco = Number(produtoAtual.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        prompt += `\n\n## PRODUTO SENDO VISUALIZADO\nO cliente está na página do produto "${produtoAtual.nome}" (${preco}). Caminho: /produto/${produtoAtual.slug}. Estoque: ${produtoAtual.estoque > 0 ? `${produtoAtual.estoque} unidades` : 'fora de estoque'}.`
        if (produtoAtual.descricao) {
            const plain = produtoAtual.descricao.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
            prompt += ` Descrição: ${plain}`
        }
    }

    if (carrinho.length > 0) {
        const total = carrinho.reduce((sum, i) => sum + Number(i.preco) * i.quantidade, 0)
        prompt += `\n\n## CARRINHO DO CLIENTE\n` +
            carrinho.map(i => `- ${i.produto_nome} (x${i.quantidade}) — ${Number(i.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`).join('\n')
        prompt += `\nTotal: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    } else if (usuario) {
        prompt += `\n\n## CARRINHO DO CLIENTE\nCarrinho vazio.`
    }

    if (pedidos.length > 0) {
        prompt += `\n\n## PEDIDOS DO CLIENTE\n` +
            pedidos.map(p => `- Pedido #${p.id}: ${p.status} — ${formatDate(p.created_at)}`).join('\n')
    }

    return prompt
}

function toGeminiHistory(history) {
    return history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
    }))
}

export function createChat() {
    return { history: [], context: {} }
}

export async function sendMessage(chat, message, onChunk) {
    if (chat.history.length > 10) {
        chat.history = chat.history.slice(-10)
    }

    chat.history.push({ role: "user", content: message })

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: buildSystemPrompt(chat.context)
        })

        const chatSession = model.startChat({ history: toGeminiHistory(chat.history.slice(0, -1)) })
        const result = await chatSession.sendMessageStream(message)

        let fullReply = ""
        for await (const chunk of result.stream) {
            const delta = chunk.text()
            if (delta) {
                fullReply += delta
                onChunk?.(delta)
            }
        }

        chat.history.push({ role: "assistant", content: fullReply })
        return fullReply
    } catch {
        const errorMsg = "Desculpe, não consegui processar sua mensagem. Tente novamente em instantes."
        chat.history.push({ role: "assistant", content: errorMsg })
        onChunk?.(errorMsg)
        return errorMsg
    }
}

export async function generateProductDescription(nome, categoria) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(
        `Você é redator de e-commerce especializado em tecnologia para varejo. Gere uma descrição completa para o produto abaixo seguindo EXATAMENTE a estrutura e o tom do exemplo.

PRODUTO: ${nome}
CATEGORIA: ${categoria}

---
EXEMPLO DE ESTRUTURA E TOM (adapte para o produto acima, não copie):

<p><strong>SmartCart Basket – A Cestinha Inteligente que Revoluciona suas Compras</strong></p>

<p>Transforme a experiência de compra com a SmartCart Basket, uma cestinha inteligente desenvolvida para oferecer mais praticidade, controle e tecnologia dentro do supermercado. Equipada com uma tela integrada de alta visibilidade, ela exibe em tempo real os produtos adicionados à cesta, permitindo que o cliente acompanhe suas compras de forma simples e intuitiva.</p>

<p>Utilizando sensores inteligentes e tecnologia de identificação automática de produtos, a SmartCart Basket reconhece os itens inseridos ou removidos, atualizando instantaneamente a lista de compras e o valor total da compra. Isso proporciona mais transparência, agilidade e conveniência durante todo o processo.</p>

<p>Além disso, a tela pode exibir ofertas personalizadas, promoções em tempo real, recomendações de produtos e informações úteis para auxiliar o consumidor em sua jornada de compra. Seu design moderno, ergonômico e resistente foi pensado para o uso diário em ambientes de varejo de alta movimentação.</p>

<p><strong>Principais funcionalidades:</strong></p>
<ul>
<li>Tela inteligente integrada com exibição dos produtos em tempo real.</li>
<li>Atualização automática do valor total da compra.</li>
<li>Sensores avançados para identificação e monitoramento dos itens.</li>
<li>Exibição de promoções e ofertas personalizadas.</li>
<li>Interface intuitiva e fácil de utilizar.</li>
<li>Estrutura resistente e ergonomicamente projetada.</li>
<li>Integração com sistemas de gestão e estoque do supermercado.</li>
<li>Experiência de compra mais rápida, moderna e eficiente.</li>
</ul>

<p>A SmartCart Basket representa o futuro das compras em supermercados, combinando tecnologia, praticidade e inovação para criar uma experiência mais inteligente para consumidores e varejistas.</p>
---

REGRAS:
- Primeira linha: <p><strong>NOME DO PRODUTO – Tagline criativa</strong></p>
- 2 a 3 parágrafos de introdução descrevendo o produto, tecnologia e benefícios
- Seção <p><strong>Principais funcionalidades:</strong></p> seguida de <ul> com 6 a 8 itens <li>
- Parágrafo final de fechamento com visão/posicionamento
- Use apenas tags: <p>, <strong>, <ul>, <li>
- Tom profissional, persuasivo, em português brasileiro
- Não invente especificações técnicas que não façam sentido para o produto`
    )
    return result.response.text()
}

export async function summarizeReviews(reviews) {
    if (reviews.length < 3) return null
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const reviewsText = reviews.map(r => `${r.nota}/5: "${r.descricao}"`).join('\n')
    const result = await model.generateContent(
        `Analise as avaliações abaixo de um produto e escreva 1 a 2 frases resumindo o sentimento geral dos clientes de forma objetiva e equilibrada. Use terceira pessoa. Não mencione números ou médias.\n\n${reviewsText}`
    )
    return result.response.text()
}

export async function analyzeReviews(reviews) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const reviewsText = reviews.map(r => `${r.nota}/5 — "${r.descricao}"`).join('\n')
    const result = await model.generateContent(
        `Analise as avaliações de clientes abaixo e gere um relatório em texto corrido, sem usar asteriscos, hashtags ou qualquer marcação markdown. Use apenas texto simples com seções separadas por linha em branco, assim:

SENTIMENTO GERAL
Descreva aqui o sentimento geral (positivo/negativo/misto).

PONTOS POSITIVOS
Liste aqui os principais elogios mencionados, um por linha com traço.

PONTOS NEGATIVOS
Liste aqui as principais críticas mencionadas, um por linha com traço.

TENDÊNCIAS
Descreva padrões ou tendências observadas.

RECOMENDAÇÃO
Sugira uma ação concreta para a loja com base nas avaliações.

Avaliações:
${reviewsText}`
    )
    return result.response.text()
}

export async function generateDashboardInsights(stats) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(
        `Você é um analista de negócios de e-commerce. Com base nos dados abaixo de uma loja online brasileira de tecnologia para varejo, gere de 3 a 5 insights acionáveis em texto corrido, sem usar asteriscos, hashtags ou qualquer marcação markdown. Use linguagem direta, profissional e objetiva. Cada insight em uma linha separada começando com um traço.

Dados do dashboard:
- Faturamento total: ${stats.faturamento}
- Total de clientes: ${stats.clientes}
- Pedidos novos: ${stats.pedidosNovos}
- Total de produtos: ${stats.produtos}
${stats.extra ? `- Informações adicionais: ${stats.extra}` : ''}

Foque em observações úteis para o gestor da loja: tendências, alertas, oportunidades de melhoria e ações recomendadas.`
    )
    return result.response.text()
}

export async function generateJobDescription(cargo, area, tipoContrato, formatoTrabalho) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(
        `Gere uma descrição de vaga de emprego para uma empresa brasileira de tecnologia para varejo (SmartCart). Retorne apenas texto simples sem markdown, com o seguinte formato:

REQUISITOS
- [requisito 1]
- [requisito 2]
- [requisito 3]
- [requisito 4]
- [requisito 5]

DIFERENCIAIS
- [diferencial 1]
- [diferencial 2]
- [diferencial 3]

Cargo: ${cargo}
Área: ${area}
Tipo de contrato: ${tipoContrato}
Formato de trabalho: ${formatoTrabalho}

Use linguagem clara e objetiva. Requisitos devem ser realistas para o cargo informado.`
    )
    return result.response.text()
}

export async function generateMarketingText(tipo, contexto = {}) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const prompt = tipo === 'flash_sale'
        ? `Crie um título curto e chamativo para uma Flash Sale de uma loja de tecnologia para varejo brasileira (SmartCart). O título deve ter no máximo 60 caracteres, ser urgente e persuasivo. Retorne APENAS o título, sem aspas, sem explicação.${contexto.produtos ? ` Produtos em destaque: ${contexto.produtos}` : ''}`
        : `Crie textos para um popup promocional de uma loja de tecnologia para varejo brasileira (SmartCart). Retorne APENAS um JSON válido neste formato exato, sem markdown:
{"titulo":"título do popup aqui","texto":"texto curto e persuasivo de 1 a 2 frases aqui"}

Tom: amigável, moderno e persuasivo. Título com até 50 caracteres. Texto com até 120 caracteres.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    if (tipo === 'flash_sale') return { titulo: text }

    try {
        const match = text.match(/\{[\s\S]*\}/)
        return match ? JSON.parse(match[0]) : { titulo: '', texto: '' }
    } catch {
        return { titulo: '', texto: '' }
    }
}

export async function suggestCartProducts(cartItems, products) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const cartText = cartItems.map(i => i.produto_nome).join(', ')
    const catalogoText = products
        .filter(p => !cartItems.some(i => i.produto_slug === p.slug || i.produto_nome === p.nome))
        .map(p => `${p.slug}: ${p.nome}`)
        .join('\n')

    const result = await model.generateContent(
        `Um cliente tem os seguintes itens no carrinho: ${cartText}

Catálogo disponível (slug: nome):
${catalogoText}

Sugira até 3 produtos do catálogo que complementem o carrinho. Retorne APENAS uma lista JSON de slugs. Exemplo: ["slug-1","slug-2"]. Não inclua nenhum texto além do JSON.`
    )
    try {
        const text = result.response.text().trim()
        const match = text.match(/\[.*\]/s)
        return match ? JSON.parse(match[0]) : []
    } catch {
        return []
    }
}

export async function analyzeCurriculo(curriculo) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const partes = [
        `Candidato: ${curriculo.nome}`,
        curriculo.cargo || curriculo.vaga_nome ? `Vaga: ${curriculo.cargo ?? curriculo.vaga_nome}` : null,
        curriculo.area ? `Área: ${curriculo.area}` : null,
        curriculo.carta_apresent ? `\nCarta de apresentação:\n${curriculo.carta_apresent}` : null,
    ].filter(Boolean).join('\n')

    const result = await model.generateContent(
        `Analise o candidato abaixo e retorne APENAS um JSON válido, sem markdown, sem texto extra.

${partes}

Estrutura obrigatória do JSON:
{
  "resumo": "parágrafo descrevendo o perfil do candidato",
  "habilidades": ["habilidade 1", "habilidade 2"],
  "pontosFortes": ["ponto forte 1", "ponto forte 2"],
  "pontosAtencao": ["ponto de atenção 1"],
  "fitVaga": "avaliação sobre adequação à vaga (ou null se não houver vaga informada)",
  "recomendacao": "texto da recomendação",
  "recomendacaoNivel": "positivo" | "neutro" | "negativo"
}

Regras: habilidades máximo 8 itens, pontosFortes máximo 4, pontosAtencao máximo 3. Se a carta for vaga ou inexistente, baseie-se nos dados disponíveis. Responda em português.`
    )
    try {
        const text = result.response.text().trim()
        const match = text.match(/\{[\s\S]*\}/)
        return match ? JSON.parse(match[0]) : null
    } catch {
        return null
    }
}

export async function searchProducts(query, produtos) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const catalogo = produtos.map(p => `${p.slug}: ${p.nome} — ${p.categoria_nome ?? ''}`).join('\n')
    const result = await model.generateContent(
        `Você é um motor de busca de produtos. O usuário pesquisou: "${query}"

Catálogo disponível (formato slug: nome — categoria):
${catalogo}

Retorne APENAS uma lista JSON de slugs dos produtos relevantes, ordenados do mais ao menos relevante. Exemplo: ["slug-1","slug-2"]. Se nenhum produto for relevante, retorne []. Não inclua nenhum texto além do JSON.`
    )
    try {
        const text = result.response.text().trim()
        const match = text.match(/\[.*\]/s)
        return match ? JSON.parse(match[0]) : []
    } catch {
        return []
    }
}

import Groq from "groq-sdk"

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_KEY, dangerouslyAllowBrowser: true })

function buildSystemPrompt({ categorias = [], carrinho = [], usuario = null, produtoAtual = null }) {
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

    return prompt
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
        const stream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: buildSystemPrompt(chat.context) }, ...chat.history],
            stream: true,
        })

        let fullReply = ""
        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ""
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

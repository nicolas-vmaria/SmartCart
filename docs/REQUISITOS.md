# SmartCart — Especificação de Requisitos e Histórias de Usuário

**Versão:** 1.0  
**Data:** 2026-06-18  
**Sistema:** SmartCart — Plataforma de E-commerce

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Requisitos Funcionais](#2-requisitos-funcionais)
3. [Requisitos Não Funcionais](#3-requisitos-não-funcionais)
4. [Histórias de Usuário com Critérios de Aceitação BDD](#4-histórias-de-usuário-com-critérios-de-aceitação-bdd)
5. [Escopo Negativo](#5-escopo-negativo)

---

## 1. Visão Geral

O SmartCart é uma plataforma de e-commerce composta por três módulos principais:

| Módulo | Tecnologia | Público-alvo |
|---|---|---|
| Frontend Web | React 19 + Vite + Tailwind CSS | Clientes |
| Painel Administrativo Web | React 19 + Vite + Tailwind CSS | Administradores |
| App Mobile Administrativo | React Native + Expo + NativeWind | Administradores |

**Backend:** PHP (sem framework), arquitetura MVC, MySQL hospedado no Railway  
**Infraestrutura:** Docker, Railway (deploy contínuo), Cloudinary (imagens), Expo EAS (build mobile)

---

## 2. Requisitos Funcionais

### 2.1 Autenticação e Controle de Acesso

| ID | Descrição |
|---|---|
| RF01 | O sistema deve permitir cadastro de usuário com nome, e-mail, telefone e senha, exigindo verificação de e-mail antes de liberar o acesso. |
| RF02 | O sistema deve autenticar usuários via e-mail e senha, emitindo um JWT (`user_token`) armazenado no localStorage. |
| RF03 | O sistema deve permitir login e cadastro via Google OAuth. |
| RF04 | O sistema deve permitir recuperação de senha por e-mail (fluxo: esqueci → link → redefinir). |
| RF05 | O sistema deve autenticar administradores com credenciais próprias, emitindo um JWT separado (`admin_token`) com role `admin`. |
| RF06 | O sistema deve controlar o acesso de administradores por papéis com permissões granulares por seção do painel (`ver_produtos`, `ver_pedidos`, etc.). |

### 2.2 Catálogo de Produtos

| ID | Descrição |
|---|---|
| RF07 | O sistema deve listar produtos com filtro e navegação por categoria. |
| RF08 | O sistema deve exibir a página de detalhe do produto com galeria de imagens, descrição e avaliações de clientes. |
| RF09 | O sistema deve oferecer busca de produtos por linguagem natural utilizando IA (Groq). |
| RF10 | O sistema deve exibir seções de destaque na home: produtos em destaque, mais vendidos e lançamentos. |
| RF11 | O sistema deve sugerir produtos frequentemente comprados juntos na página de detalhe (bundle). |
| RF12 | O sistema deve suportar categorias hierárquicas (pai/filho) com navegação por slug. |

### 2.3 Carrinho de Compras

| ID | Descrição |
|---|---|
| RF13 | O sistema deve permitir adicionar, remover e alterar a quantidade de itens no carrinho. |
| RF14 | O sistema deve validar e aplicar cupons de desconto (percentual ou valor fixo) com controle de validade e limite de uso. |
| RF15 | O sistema deve calcular o frete por CEP via ViaCEP com regras de valor por estado. |
| RF16 | O sistema deve sugerir produtos relacionados no carrinho via IA. |
| RF17 | O sistema deve aplicar descontos progressivos baseados em volume de itens. |

### 2.4 Checkout e Pagamento

| ID | Descrição |
|---|---|
| RF18 | O sistema deve guiar o usuário por um fluxo de checkout em 3 etapas: (1) endereço de entrega, (2) método de pagamento, (3) confirmação do pedido. |
| RF19 | O sistema deve oferecer pagamento via PIX com geração de QR Code. |
| RF20 | O sistema deve oferecer pagamento via cartão de crédito com detecção automática de bandeira (Visa, Mastercard, Amex, Elo, Hipercard, Discover) e validação Luhn. |
| RF21 | O sistema deve permitir selecionar ou cadastrar endereço de entrega durante o checkout. |

### 2.5 Pedidos

| ID | Descrição |
|---|---|
| RF22 | O sistema deve registrar pedidos com itens, quantidades e o preço unitário histórico (preço no momento da compra). |
| RF23 | O sistema deve exibir o histórico de pedidos do usuário com acompanhamento de status: aguardando pagamento, pago, enviado, entregue, cancelado. |
| RF24 | O sistema deve permitir que o usuário cancele um pedido em aberto. |
| RF25 | O sistema deve permitir que o usuário avalie os produtos de um pedido concluído (nota 1–5 estrelas e comentário). |

### 2.6 Perfil do Usuário

| ID | Descrição |
|---|---|
| RF26 | O sistema deve permitir que o usuário edite seus dados pessoais (nome, telefone). |
| RF27 | O sistema deve permitir que o usuário gerencie seu endereço principal. |
| RF28 | O sistema deve permitir alteração de senha mediante confirmação da senha atual. |
| RF29 | O sistema deve permitir upload de foto de perfil via Cloudinary. |

### 2.7 Avaliações de Produtos

| ID | Descrição |
|---|---|
| RF30 | O sistema deve permitir que usuários publiquem avaliações com nota (1–5 estrelas) e comentário. |
| RF31 | O sistema deve permitir que usuários marquem uma avaliação como "útil" (helpful). |

### 2.8 Vagas e Carreiras

| ID | Descrição |
|---|---|
| RF32 | O sistema deve listar vagas de emprego com filtros por área, tipo de contrato e formato de trabalho. |
| RF33 | O sistema deve permitir que candidatos se inscrevam em vagas com envio de currículo. |
| RF34 | O sistema deve aceitar candidaturas espontâneas sem vínculo a uma vaga específica. |

### 2.9 Painel Administrativo Web

| ID | Descrição |
|---|---|
| RF35 | O painel deve exibir um dashboard com KPIs (receita, usuários, pedidos, produtos) e gráficos de desempenho por período. |
| RF36 | O painel deve permitir criar, editar e excluir produtos com campos: nome, preço, estoque, percentual de desconto, foto e destaque. |
| RF37 | O painel deve permitir gerenciar categorias hierárquicas (pai/filho). |
| RF38 | O painel deve listar todos os pedidos e permitir atualizar seus status. |
| RF39 | O painel deve listar clientes cadastrados e permitir exclusão de contas. |
| RF40 | O painel deve permitir criar, editar e desativar cupons com tipo, valor, data de validade e limite de usos. |
| RF41 | O painel deve permitir criar papéis administrativos com permissões granulares por seção e atribuí-los a funcionários. |
| RF42 | O painel deve permitir gerenciar banners da home: upload, reordenação e ativação/desativação. |
| RF43 | O painel deve permitir personalizar a loja: textos de benefícios, valor mínimo de frete grátis e cores do tema. |
| RF44 | O painel deve exibir relatórios de vendas com gráficos por período (diário, mensal, anual) e ranking de produtos. |
| RF45 | O painel deve permitir moderar avaliações com lista de palavras proibidas e exclusão em lote. |
| RF46 | O painel deve registrar e exibir um log de auditoria de todas as ações administrativas. |
| RF47 | O painel deve permitir gerenciar vagas de emprego (criar, editar, pausar, reativar, encerrar). |
| RF48 | O painel deve permitir revisar currículos e atualizar o status de cada candidatura (novo → em análise → aprovado/reprovado). |

### 2.10 App Mobile Administrativo

| ID | Descrição |
|---|---|
| RF49 | O app deve exibir um dashboard com KPIs e gráfico de receita anual. |
| RF50 | O app deve listar produtos com busca, filtro por status e modal de detalhe. |
| RF51 | O app deve listar pedidos com busca, filtro por status e modal de detalhe. |
| RF52 | O app deve exibir relatórios mensais com navegação por mês/ano e ranking de produtos. |
| RF53 | O app deve enviar push notifications quando novos pedidos pendentes forem recebidos. |

### 2.11 Recursos Gerais

| ID | Descrição |
|---|---|
| RF54 | O sistema deve disponibilizar um formulário de contato público com envio por e-mail. |
| RF55 | O sistema deve permitir que administradores gerenciem configurações globais (pares chave-valor). |
| RF56 | O backend deve expor um endpoint de health check (`GET /`) para monitoramento de disponibilidade. |

---

## 3. Requisitos Não Funcionais

### 3.1 Desempenho

| ID | Descrição |
|---|---|
| RNF01 | Listas e grids devem exibir skeleton loading (`animate-pulse`) durante o carregamento, imitando a forma dos cards reais. |
| RNF02 | Todas as imagens devem ser armazenadas e entregues via CDN (Cloudinary). |
| RNF03 | O build frontend deve ser otimizado com Vite, aplicando code splitting e tree-shaking automaticamente. |
| RNF04 | Listagens com grande volume de dados devem implementar paginação no backend e lazy load no frontend. |

### 3.2 Segurança

| ID | Descrição |
|---|---|
| RNF05 | Toda autenticação deve utilizar JWT HS256 com prazo de expiração definido. |
| RNF06 | Os tokens de usuário (`user_token`) e administrador (`admin_token`) devem ser completamente separados. |
| RNF07 | Senhas devem ser armazenadas com hash bcrypt — nunca em texto puro. |
| RNF08 | Todos os inputs do backend devem ser sanitizados para prevenção de SQL injection. |
| RNF09 | Todas as rotas protegidas devem aplicar `AuthMiddleware` com validação de JWT e role antes de executar qualquer lógica. |
| RNF10 | O backend deve ter CORS configurado para aceitar requisições apenas de origens autorizadas. |

### 3.3 Usabilidade

| ID | Descrição |
|---|---|
| RNF11 | O frontend web deve ser responsivo e mobile-first com Tailwind CSS. |
| RNF12 | Toda operação assíncrona deve fornecer feedback via componente `Toast` (sucesso ou erro). |
| RNF13 | Toda ação destrutiva deve exigir confirmação via `ConfirmDialog` antes de ser executada. |
| RNF14 | Toda chamada ao backend deve exibir estado de carregamento: spinner no botão e atributo `disabled` ativo durante a requisição. |

### 3.4 Manutenibilidade

| ID | Descrição |
|---|---|
| RNF15 | O backend deve seguir arquitetura MVC sem framework: Controller → Service → Repository. |
| RNF16 | Toda alteração no schema do banco deve gerar um arquivo de migration versionado (`mig-NNN.sql`) e atualizar `schema.sql`. |
| RNF17 | Chamadas API de admin e de cliente devem estar em arquivos separados; arquivos admin usam `adminApi`, nunca `api`. |

### 3.5 Rastreabilidade

| ID | Descrição |
|---|---|
| RNF18 | Toda ação de administrador deve ser registrada na tabela `AuditLog` com identificação, ação, entidade e timestamp. |
| RNF19 | O preço unitário deve ser registrado em `Itens_Pedido` no momento da compra, preservando o histórico. |
| RNF20 | O uso de cupom deve ser rastreado por usuário em `CuponsUsoUsuarios`, limitando a um uso por cupom por conta. |

### 3.6 Infraestrutura e Implantação

| ID | Descrição |
|---|---|
| RNF21 | O backend deve ser empacotado em container Docker para portabilidade entre ambientes. |
| RNF22 | O banco de dados MySQL deve ser hospedado em serviço de nuvem gerenciado (Railway). |
| RNF23 | O frontend e o backend devem ser implantados automaticamente via Railway a cada push na branch principal. |

### 3.7 Compatibilidade

| ID | Descrição |
|---|---|
| RNF24 | O app mobile deve ser compatível com iOS e Android via Expo SDK (React Native). |
| RNF25 | O checkout deve suportar no mínimo 6 bandeiras de cartão de crédito: Visa, Mastercard, Amex, Elo, Hipercard e Discover. |

---

## 4. Histórias de Usuário com Critérios de Aceitação BDD

> **Personas utilizadas:**
> - **Cliente** — usuário final que navega e compra na loja
> - **Administrador** — gestor com acesso total ao painel
> - **Funcionário** — admin com permissões restritas por papel
> - **Candidato** — usuário que busca vagas de emprego

---

### 4.1 Autenticação e Controle de Acesso

---

#### US01 — Cadastro de Usuário

> Como **cliente**,  
> quero **criar uma conta informando meu nome, e-mail, telefone e senha**,  
> para **ter acesso ao carrinho, histórico de pedidos e funcionalidades exclusivas da plataforma**.

```gherkin
Funcionalidade: Cadastro de usuário

  Cenário: Cadastro bem-sucedido
    Dado que estou na página de cadastro
    Quando preencho nome, e-mail válido, telefone e senha
    E clico em "Criar conta"
    Então recebo um e-mail de verificação no endereço informado
    E sou redirecionado para a página de login com mensagem de sucesso

  Cenário: E-mail já cadastrado
    Dado que estou na página de cadastro
    Quando preencho um e-mail que já existe na base de dados
    E clico em "Criar conta"
    Então vejo um Toast com a mensagem "E-mail já cadastrado"
    E o formulário permanece preenchido para correção

  Cenário: Campos obrigatórios vazios
    Dado que estou na página de cadastro
    Quando tento criar conta sem preencher um campo obrigatório
    Então o botão de submit permanece desabilitado
    Ou vejo uma mensagem de validação no campo faltante
```

---

#### US02 — Login de Usuário

> Como **cliente**,  
> quero **fazer login com meu e-mail e senha**,  
> para **acessar minha conta e retomar minhas compras**.

```gherkin
Funcionalidade: Login de usuário

  Cenário: Login bem-sucedido
    Dado que estou na página de login
    Quando preencho meu e-mail e senha corretos
    E clico em "Entrar"
    Então sou redirecionado para a página inicial autenticado
    E meu nome aparece na Navbar
    E o token "user_token" é armazenado no localStorage

  Cenário: Credenciais inválidas
    Dado que estou na página de login
    Quando preencho e-mail ou senha incorretos
    E clico em "Entrar"
    Então vejo um Toast com a mensagem de erro
    E permaneço na página de login

  Cenário: E-mail não verificado
    Dado que cadastrei uma conta mas não verifiquei o e-mail
    Quando tento fazer login
    Então vejo uma mensagem informando que o e-mail ainda não foi verificado
```

---

#### US03 — Login via Google

> Como **cliente**,  
> quero **fazer login com minha conta Google**,  
> para **não precisar criar e memorizar mais uma senha**.

```gherkin
Funcionalidade: Autenticação via Google OAuth

  Cenário: Login com Google bem-sucedido
    Dado que estou na página de login
    Quando clico em "Entrar com Google"
    E autorizo o acesso à minha conta Google
    Então sou redirecionado para a loja autenticado
    E meu token "user_token" é armazenado no localStorage

  Cenário: Cancelamento da autenticação Google
    Dado que cliquei em "Entrar com Google"
    Quando cancelo a autorização na janela do Google
    Então retorno à página de login sem erros
    E nenhum dado é armazenado
```

---

#### US04 — Recuperação de Senha

> Como **cliente**,  
> quero **redefinir minha senha por e-mail**,  
> para **recuperar o acesso à minha conta caso esqueça a senha**.

```gherkin
Funcionalidade: Recuperação de senha

  Cenário: Solicitação de redefinição bem-sucedida
    Dado que estou na página "Esqueci minha senha"
    Quando preencho meu e-mail cadastrado
    E clico em "Enviar link"
    Então recebo um e-mail com o link de redefinição
    E vejo uma mensagem de confirmação na tela

  Cenário: E-mail não cadastrado
    Dado que estou na página "Esqueci minha senha"
    Quando preencho um e-mail que não existe na base
    E clico em "Enviar link"
    Então vejo um Toast com a mensagem de erro

  Cenário: Redefinição de senha bem-sucedida
    Dado que acessei o link de redefinição enviado ao meu e-mail
    Quando preencho a nova senha e confirmo
    E clico em "Redefinir senha"
    Então minha senha é atualizada
    E sou redirecionado para o login com mensagem de sucesso

  Cenário: Link de redefinição expirado
    Dado que acessei um link de redefinição expirado
    Então vejo uma mensagem informando que o link é inválido ou expirou
    E sou direcionado para solicitar um novo link
```

---

#### US05 — Login de Administrador

> Como **administrador**,  
> quero **fazer login em uma área separada com credenciais exclusivas**,  
> para **acessar o painel de gestão da loja com segurança**.

```gherkin
Funcionalidade: Login de administrador

  Cenário: Login de admin bem-sucedido
    Dado que estou na página de login do painel admin
    Quando preencho e-mail e senha de administrador válidos
    E clico em "Entrar"
    Então recebo um "admin_token" JWT com role "admin"
    E sou redirecionado para o dashboard do painel

  Cenário: Tentativa de acesso com credenciais de cliente
    Dado que estou na página de login admin
    Quando preencho credenciais de um usuário comum
    E clico em "Entrar"
    Então vejo um Toast de acesso negado
    E permaneço na tela de login

  Cenário: Acesso direto à URL do painel sem autenticação
    Dado que não estou autenticado como admin
    Quando acesso diretamente uma URL do painel (/admin/*)
    Então sou redirecionado para a página de login do admin
```

---

#### US06 — Gerenciamento de Papéis e Permissões

> Como **administrador**,  
> quero **criar papéis com permissões específicas por seção e atribuí-los a funcionários**,  
> para **garantir que cada membro da equipe acesse apenas o que é necessário para sua função**.

```gherkin
Funcionalidade: Controle de acesso por papéis

  Cenário: Criar papel com permissões específicas
    Dado que estou na seção "Papéis" do painel admin
    Quando crio um novo papel "Atendimento" com permissão apenas em "ver_pedidos"
    E salvo
    Então o papel aparece na listagem
    E pode ser atribuído a funcionários

  Cenário: Funcionário acessa seção não autorizada
    Dado que sou um funcionário com papel que não inclui "ver_produtos"
    Quando tento acessar a seção de Produtos pelo menu lateral
    Então o item não aparece no menu
    Ou recebo uma resposta 403 na tentativa de requisição

  Cenário: Atribuir papel a funcionário
    Dado que estou criando ou editando um funcionário
    Quando seleciono um papel existente para ele
    E salvo
    Então o funcionário passa a ter as permissões do papel ao fazer login
```

---

### 4.2 Catálogo de Produtos

---

#### US07 — Navegação e Filtro por Categoria

> Como **cliente**,  
> quero **navegar e filtrar produtos por categoria**,  
> para **encontrar rapidamente o que estou procurando**.

```gherkin
Funcionalidade: Navegação por categorias

  Cenário: Filtrar produtos por categoria
    Dado que estou na página de produtos
    Quando seleciono uma categoria no menu de categorias
    Então a listagem exibe apenas os produtos daquela categoria
    E o título da página é atualizado com o nome da categoria

  Cenário: Categoria sem produtos
    Dado que seleciono uma categoria que não possui produtos cadastrados
    Então vejo uma mensagem indicando que nenhum produto foi encontrado

  Cenário: Navegar para subcategoria
    Dado que clico em uma categoria pai com subcategorias
    Então vejo as subcategorias disponíveis
    E posso navegar diretamente para os produtos de cada subcategoria
```

---

#### US08 — Busca de Produtos com IA

> Como **cliente**,  
> quero **buscar produtos usando linguagem natural**,  
> para **encontrar o que preciso sem saber o nome exato do produto**.

```gherkin
Funcionalidade: Busca por IA

  Cenário: Busca bem-sucedida por linguagem natural
    Dado que estou na página de busca IA
    Quando digito "quero algo para organizar minha mesa de trabalho"
    E confirmo a busca
    Então recebo uma lista de produtos relevantes sugeridos pela IA

  Cenário: Busca sem resultados relevantes
    Dado que realizo uma busca por texto muito vago ou sem contexto
    Então recebo uma resposta da IA com sugestões alternativas
    Ou uma mensagem informando que nenhum produto foi encontrado

  Cenário: Erro na API de IA
    Dado que a API Groq está indisponível
    Quando realizo uma busca
    Então vejo um Toast com mensagem de erro
    E o sistema continua funcionando normalmente
```

---

#### US09 — Página de Detalhe do Produto

> Como **cliente**,  
> quero **ver todos os detalhes de um produto antes de comprar**,  
> para **tomar uma decisão de compra informada**.

```gherkin
Funcionalidade: Detalhe do produto

  Cenário: Visualizar produto disponível
    Dado que clico em um produto na listagem
    Então vejo nome, preço, descrição, galeria de imagens, estoque disponível e avaliações
    E posso adicionar o produto ao carrinho

  Cenário: Produto fora de estoque
    Dado que acesso a página de um produto sem estoque
    Então o botão "Adicionar ao carrinho" está desabilitado
    E vejo um indicador de "Fora de estoque"

  Cenário: Ver sugestões de produtos comprados juntos
    Dado que estou na página de detalhe de um produto
    Então vejo uma seção "Compre junto" com produtos relacionados
```

---

### 4.3 Carrinho de Compras

---

#### US10 — Gerenciar Itens do Carrinho

> Como **cliente**,  
> quero **adicionar, remover e alterar a quantidade de produtos no carrinho**,  
> para **controlar exatamente o que vou comprar antes de finalizar o pedido**.

```gherkin
Funcionalidade: Gerenciamento do carrinho

  Cenário: Adicionar produto ao carrinho
    Dado que estou na página de detalhe de um produto em estoque
    Quando clico em "Adicionar ao carrinho"
    Então o produto é adicionado ao carrinho
    E o contador de itens na Navbar é atualizado

  Cenário: Alterar quantidade de item
    Dado que tenho um produto no carrinho
    Quando aumento ou diminuo a quantidade usando os controles
    Então o subtotal do item é recalculado em tempo real

  Cenário: Remover item do carrinho
    Dado que tenho pelo menos um item no carrinho
    Quando clico em "Remover" em um item
    Então o item é removido da lista
    E o total do carrinho é atualizado

  Cenário: Carrinho vazio
    Dado que meu carrinho está vazio
    Quando acesso a página do carrinho
    Então vejo uma mensagem informando que o carrinho está vazio
    E um botão para continuar comprando
```

---

#### US11 — Aplicar Cupom de Desconto

> Como **cliente**,  
> quero **aplicar um cupom de desconto no carrinho**,  
> para **pagar menos pela minha compra**.

```gherkin
Funcionalidade: Cupons de desconto

  Cenário: Aplicar cupom válido
    Dado que tenho itens no carrinho
    Quando insiro um código de cupom válido e clico em "Aplicar"
    Então o desconto é exibido no resumo do pedido
    E o total é recalculado com o desconto aplicado

  Cenário: Cupom expirado
    Dado que insiro um código de cupom cuja data de validade já passou
    Então vejo um Toast com a mensagem "Cupom expirado"
    E nenhum desconto é aplicado

  Cenário: Cupom já utilizado por este usuário
    Dado que já usei este cupom em uma compra anterior
    Quando tento aplicá-lo novamente
    Então vejo um Toast com a mensagem de que o cupom já foi utilizado

  Cenário: Código de cupom inválido
    Dado que insiro um código que não existe
    Então vejo um Toast com a mensagem "Cupom inválido"
```

---

#### US12 — Calcular Frete por CEP

> Como **cliente**,  
> quero **calcular o frete informando meu CEP**,  
> para **saber o custo total da compra antes de finalizar**.

```gherkin
Funcionalidade: Cálculo de frete

  Cenário: CEP válido com frete calculado
    Dado que tenho itens no carrinho
    Quando informo um CEP válido e clico em "Calcular frete"
    Então o sistema consulta o ViaCEP e retorna as opções de frete
    E o valor do frete é exibido no resumo do pedido

  Cenário: Compra acima do valor mínimo de frete grátis
    Dado que o total dos itens supera o valor configurado para frete grátis
    Quando calculo o frete
    Então o sistema exibe "Frete grátis" para o meu estado

  Cenário: CEP inválido
    Dado que informo um CEP com formato incorreto ou não encontrado
    Então vejo um Toast com mensagem de erro
    E nenhum valor de frete é exibido
```

---

### 4.4 Checkout e Pagamento

---

#### US13 — Finalizar Compra com PIX

> Como **cliente**,  
> quero **pagar meu pedido via PIX**,  
> para **concluir a compra de forma rápida e sem precisar de cartão de crédito**.

```gherkin
Funcionalidade: Pagamento via PIX

  Cenário: Geração de QR Code PIX
    Dado que estou na etapa de pagamento do checkout
    Quando seleciono "PIX" como método de pagamento
    E confirmo o pedido
    Então um QR Code PIX é exibido na tela
    E o pedido é criado com status "aguardando pagamento"

  Cenário: Pedido registrado com itens e preços históricos
    Dado que finalizo um pedido via PIX
    Então cada item do pedido tem seu preço unitário salvo no momento da compra
    E este preço não se altera se o produto mudar de preço depois

  Cenário: Carrinho vazio na tentativa de checkout
    Dado que meu carrinho está vazio
    Quando tento acessar o checkout
    Então sou redirecionado para a página do carrinho com mensagem de aviso
```

---

#### US14 — Finalizar Compra com Cartão de Crédito

> Como **cliente**,  
> quero **pagar com cartão de crédito**,  
> para **ter mais opções de parcelamento e conveniência**.

```gherkin
Funcionalidade: Pagamento via cartão de crédito

  Cenário: Pagamento com cartão válido
    Dado que estou na etapa de pagamento do checkout
    Quando seleciono "Cartão de crédito" e preencho os dados do cartão
    Então a bandeira é detectada automaticamente pelo número do cartão
    E ao confirmar, o pedido é registrado com sucesso

  Cenário: Número de cartão inválido (falha na validação Luhn)
    Dado que preencho os dados do cartão
    Quando insiro um número que não passa pela validação Luhn
    Então vejo uma mensagem de erro no campo do número do cartão
    E o botão de confirmar permanece desabilitado

  Cenário: Data de validade expirada
    Dado que preencho os dados do cartão com data de validade no passado
    Então vejo uma mensagem de erro informando que o cartão está expirado
```

---

### 4.5 Pedidos

---

#### US15 — Visualizar Histórico de Pedidos

> Como **cliente**,  
> quero **ver todos os meus pedidos com seus status atuais**,  
> para **acompanhar minhas compras e saber quando vão chegar**.

```gherkin
Funcionalidade: Histórico de pedidos

  Cenário: Listar pedidos do usuário autenticado
    Dado que estou autenticado como cliente
    Quando acesso "Meus Pedidos"
    Então vejo a lista de todos os meus pedidos com número, data, valor e status

  Cenário: Clicar em um pedido para ver detalhes
    Dado que estou na página de meus pedidos
    Quando clico em um pedido específico
    Então vejo os itens comprados, preços, endereço de entrega e método de pagamento

  Cenário: Nenhum pedido realizado
    Dado que sou um usuário novo sem pedidos
    Quando acesso "Meus Pedidos"
    Então vejo uma mensagem informando que ainda não há pedidos
```

---

#### US16 — Cancelar Pedido

> Como **cliente**,  
> quero **cancelar um pedido que ainda não foi enviado**,  
> para **mudar de decisão sem precisar entrar em contato com o suporte**.

```gherkin
Funcionalidade: Cancelamento de pedido pelo cliente

  Cenário: Cancelamento bem-sucedido
    Dado que tenho um pedido com status "aguardando pagamento"
    Quando clico em "Cancelar pedido" e confirmo na caixa de diálogo
    Então o status do pedido muda para "cancelado"
    E vejo um Toast de confirmação do cancelamento

  Cenário: Tentativa de cancelar pedido já enviado
    Dado que meu pedido está com status "enviado"
    Quando acesso os detalhes do pedido
    Então a opção de cancelar não está disponível

  Cenário: Confirmação antes do cancelamento
    Dado que clico em "Cancelar pedido"
    Então um ConfirmDialog é exibido pedindo confirmação antes de prosseguir
```

---

#### US17 — Avaliar Produtos do Pedido

> Como **cliente**,  
> quero **avaliar os produtos de um pedido entregue**,  
> para **compartilhar minha experiência e ajudar outros compradores**.

```gherkin
Funcionalidade: Avaliação pós-compra

  Cenário: Submeter avaliação com nota e comentário
    Dado que tenho um pedido com status "entregue"
    Quando acesso a opção de avaliar e seleciono uma nota de 1 a 5 estrelas
    E escrevo um comentário
    E confirmo o envio
    Então minha avaliação é publicada na página do produto

  Cenário: Avaliar produto sem comentário
    Dado que estou avaliando um produto
    Quando seleciono apenas a nota sem escrever comentário
    Então a avaliação pode ser enviada apenas com a nota

  Cenário: Produto já avaliado
    Dado que já avaliei um produto de um pedido
    Então a opção de avaliar novamente não está disponível para aquele item
```

---

### 4.6 Perfil do Usuário

---

#### US18 — Editar Dados Pessoais e Foto de Perfil

> Como **cliente**,  
> quero **atualizar meus dados pessoais e foto de perfil**,  
> para **manter minha conta sempre atualizada**.

```gherkin
Funcionalidade: Edição de perfil

  Cenário: Atualizar nome e telefone
    Dado que estou na página "Meu Perfil"
    Quando altero meu nome ou telefone e salvo
    Então os dados são atualizados no banco
    E vejo um Toast de sucesso

  Cenário: Upload de foto de perfil
    Dado que estou na página de perfil
    Quando seleciono uma nova foto e confirmo o upload
    Então a imagem é enviada ao Cloudinary
    E minha foto de perfil é atualizada na Navbar e na página de perfil

  Cenário: Alterar senha com senha atual incorreta
    Dado que estou na seção de alteração de senha
    Quando preencho a senha atual de forma incorreta
    Então vejo um Toast com mensagem de erro de autenticação
    E a senha não é alterada
```

---

### 4.7 Avaliações

---

#### US19 — Marcar Avaliação como Útil

> Como **cliente**,  
> quero **marcar avaliações de outros usuários como "útil"**,  
> para **destacar os comentários mais relevantes e ajudar outros compradores**.

```gherkin
Funcionalidade: Votar em avaliações

  Cenário: Marcar avaliação como útil
    Dado que estou na página de detalhe de um produto
    Quando clico em "Útil" em uma avaliação de outro usuário
    Então o contador de votos daquela avaliação é incrementado

  Cenário: Tentar votar na própria avaliação
    Dado que sou o autor de uma avaliação
    Então a opção de votar como "útil" não está disponível para minha própria avaliação

  Cenário: Usuário não autenticado tenta votar
    Dado que não estou logado
    Quando clico em "Útil" em uma avaliação
    Então sou redirecionado para a página de login
```

---

### 4.8 Vagas e Carreiras

---

#### US20 — Candidatar-se a uma Vaga

> Como **candidato**,  
> quero **me candidatar a uma vaga de emprego enviando meu currículo**,  
> para **ter a oportunidade de fazer parte da equipe da empresa**.

```gherkin
Funcionalidade: Candidatura a vagas

  Cenário: Candidatura bem-sucedida
    Dado que estou na página de detalhe de uma vaga ativa
    Quando preencho o formulário de candidatura e faço o upload do currículo
    E clico em "Candidatar-se"
    Então minha candidatura é registrada com status "novo"
    E recebo uma mensagem de confirmação na tela

  Cenário: Vaga encerrada
    Dado que acesso uma vaga com status encerrado
    Então o formulário de candidatura não está disponível
    E vejo uma mensagem indicando que a vaga não está mais recebendo candidaturas

  Cenário: Envio sem currículo
    Dado que estou preenchendo o formulário de candidatura
    Quando tento enviar sem anexar o currículo
    Então vejo uma mensagem de validação no campo de currículo
```

---

### 4.9 Painel Administrativo Web

---

#### US21 — Gerenciar Produtos

> Como **administrador**,  
> quero **criar, editar e excluir produtos com todas as suas informações**,  
> para **manter o catálogo da loja sempre atualizado e correto**.

```gherkin
Funcionalidade: CRUD de produtos

  Cenário: Criar novo produto
    Dado que estou na seção "Produtos" do painel admin
    Quando preencho nome, preço, estoque, descrição, foto e desconto
    E clico em "Salvar"
    Então o produto aparece na listagem do painel
    E está disponível na loja para os clientes

  Cenário: Editar preço de produto existente
    Dado que seleciono um produto para editar
    Quando altero o preço e salvo
    Então o novo preço é exibido na loja imediatamente
    E os pedidos anteriores mantêm o preço histórico original

  Cenário: Excluir produto
    Dado que seleciono um produto e clico em "Excluir"
    Então um ConfirmDialog é exibido pedindo confirmação
    E ao confirmar, o produto é removido da loja e da listagem do painel

  Cenário: Campos obrigatórios não preenchidos
    Dado que estou criando um produto
    Quando tento salvar sem preencher o nome ou preço
    Então vejo mensagens de validação nos campos obrigatórios
```

---

#### US22 — Gerenciar Pedidos

> Como **administrador**,  
> quero **visualizar todos os pedidos e atualizar seus status**,  
> para **coordenar o processo de fulfillment e manter os clientes informados**.

```gherkin
Funcionalidade: Gestão de pedidos

  Cenário: Listar todos os pedidos
    Dado que estou na seção "Pedidos" do painel admin
    Então vejo todos os pedidos ordenados por data com número, cliente, valor e status

  Cenário: Atualizar status de pedido para "enviado"
    Dado que seleciono um pedido com status "pago"
    Quando altero o status para "enviado" e salvo
    Então o status é atualizado no banco
    E o cliente vê o novo status em "Meus Pedidos"

  Cenário: Filtrar pedidos por status
    Dado que estou na listagem de pedidos
    Quando aplico o filtro por status "aguardando pagamento"
    Então vejo apenas os pedidos com aquele status
```

---

#### US23 — Gerenciar Cupons

> Como **administrador**,  
> quero **criar cupons de desconto com regras configuráveis**,  
> para **promover campanhas de marketing e fidelizar clientes**.

```gherkin
Funcionalidade: Gestão de cupons

  Cenário: Criar cupom de desconto percentual
    Dado que estou na seção "Cupons" do painel admin
    Quando crio um cupom com código "PROMO20", desconto de 20%, válido até uma data futura
    E salvo
    Então o cupom está disponível para uso pelos clientes

  Cenário: Criar cupom com limite de usos
    Dado que configuro um cupom com limite de 100 usos
    Quando o cupom é utilizado 100 vezes
    Então qualquer nova tentativa de uso retorna erro de cupom inválido

  Cenário: Desativar cupom manualmente
    Dado que um cupom está ativo
    Quando o desativo no painel antes da data de expiração
    Então clientes que tentarem usá-lo recebem mensagem de cupom inválido
```

---

#### US24 — Gerenciar Banners da Home

> Como **administrador**,  
> quero **publicar e organizar os banners da página inicial**,  
> para **comunicar promoções e campanhas visualmente**.

```gherkin
Funcionalidade: Gestão de banners

  Cenário: Adicionar novo banner
    Dado que estou na seção "Banners" do painel admin
    Quando faço upload de uma imagem e salvo
    Então o banner aparece na lista e pode ser ativado

  Cenário: Reordenar banners
    Dado que tenho múltiplos banners cadastrados
    Quando arrasto um banner para uma nova posição na lista
    Então a ordem é salva e refletida na home da loja

  Cenário: Desativar banner temporariamente
    Dado que um banner está ativo
    Quando altero seu status para inativo
    Então ele deixa de aparecer na home sem ser excluído
```

---

#### US25 — Moderar Avaliações de Produtos

> Como **administrador**,  
> quero **revisar e remover avaliações inadequadas dos produtos**,  
> para **manter a qualidade e credibilidade dos comentários na loja**.

```gherkin
Funcionalidade: Moderação de avaliações

  Cenário: Remover avaliação inadequada
    Dado que estou na seção "Reviews" do painel admin
    Quando seleciono uma avaliação e clico em "Excluir"
    Então um ConfirmDialog é exibido
    E ao confirmar, a avaliação é removida da loja

  Cenário: Adicionar palavra à lista de proibidas
    Dado que estou na seção de palavras proibidas
    Quando adiciono uma nova palavra e salvo
    Então avaliações contendo essa palavra são sinalizadas automaticamente

  Cenário: Exclusão em lote
    Dado que seleciono múltiplas avaliações para exclusão
    Quando confirmo a ação de exclusão em lote
    Então todas as avaliações selecionadas são removidas de uma só vez
```

---

#### US26 — Consultar Log de Auditoria

> Como **administrador**,  
> quero **visualizar o histórico de ações realizadas no painel**,  
> para **ter rastreabilidade e identificar responsáveis por alterações críticas**.

```gherkin
Funcionalidade: Log de auditoria

  Cenário: Visualizar log de ações
    Dado que estou na seção "Auditoria" do painel admin
    Então vejo uma listagem cronológica de ações com administrador responsável, ação realizada e timestamp

  Cenário: Ação crítica registrada automaticamente
    Dado que um administrador exclui um produto
    Então o sistema registra automaticamente: quem excluiu, qual produto e quando

  Cenário: Filtrar log por período
    Dado que estou no log de auditoria
    Quando filtro por um intervalo de datas
    Então vejo apenas as ações realizadas naquele período
```

---

#### US27 — Gerenciar Relatórios de Vendas

> Como **administrador**,  
> quero **visualizar relatórios de vendas com gráficos por período**,  
> para **analisar o desempenho da loja e tomar decisões estratégicas**.

```gherkin
Funcionalidade: Relatórios de vendas

  Cenário: Visualizar relatório mensal
    Dado que estou na seção "Relatórios" do painel admin
    Quando seleciono o período mensal
    Então vejo um gráfico com a receita por dia do mês
    E o ranking dos produtos mais vendidos no período

  Cenário: Nenhuma venda no período selecionado
    Dado que seleciono um período sem vendas registradas
    Então vejo o gráfico zerado e uma mensagem informativa
```

---

#### US28 — Revisar Currículos de Candidatos

> Como **administrador**,  
> quero **revisar as candidaturas recebidas e atualizar seus status**,  
> para **gerenciar o processo seletivo da empresa diretamente pelo painel**.

```gherkin
Funcionalidade: Revisão de candidaturas

  Cenário: Ver detalhes de uma candidatura
    Dado que estou na seção "Currículos" do painel admin
    Quando clico em uma candidatura
    Então vejo os dados do candidato e o link para download do currículo

  Cenário: Avançar candidatura para "em análise"
    Dado que seleciono uma candidatura com status "novo"
    Quando altero o status para "em análise" e salvo
    Então o status é atualizado na listagem

  Cenário: Reprovar candidatura
    Dado que avaliei uma candidatura negativamente
    Quando altero o status para "reprovado"
    Então a candidatura é marcada como encerrada
```

---

### 4.10 App Mobile Administrativo

---

#### US29 — Dashboard Mobile

> Como **administrador**,  
> quero **visualizar os principais indicadores da loja no meu celular**,  
> para **monitorar o desempenho mesmo quando estou fora do escritório**.

```gherkin
Funcionalidade: Dashboard mobile

  Cenário: Visualizar KPIs no app
    Dado que estou autenticado no app mobile
    Quando abro a aba "Dashboard"
    Então vejo cards com receita total, receita mensal, pedidos pendentes e pedidos no ano
    E um gráfico de receita acumulada no ano

  Cenário: Atualizar dashboard com pull-to-refresh
    Dado que estou visualizando o dashboard
    Quando puxo a tela para baixo (pull-to-refresh)
    Então os dados são recarregados com as informações mais recentes

  Cenário: Erro de conexão
    Dado que o dispositivo está sem conexão com a internet
    Quando abro o app
    Então vejo uma mensagem de erro e um botão para tentar novamente
```

---

#### US30 — Push Notification para Novos Pedidos

> Como **administrador**,  
> quero **receber notificações no celular quando novos pedidos chegarem**,  
> para **responder rapidamente sem precisar ficar verificando o painel manualmente**.

```gherkin
Funcionalidade: Push notifications de pedidos

  Cenário: Receber notificação de novo pedido
    Dado que o app está instalado e as notificações estão autorizadas
    Quando um novo pedido é realizado por um cliente
    Então recebo uma push notification com o número do pedido

  Cenário: Badge de pedidos pendentes na aba
    Dado que há pedidos com status "aguardando pagamento"
    Quando abro o app
    Então a aba "Pedidos" exibe um badge com o número de pedidos pendentes

  Cenário: Usuário não autoriza notificações
    Dado que o usuário nega a permissão de notificações no sistema operacional
    Então o app continua funcionando normalmente
    E nenhuma tentativa de envio de push é feita
```

---

## 5. Escopo Negativo

Esta seção delimita explicitamente o que **não está contemplado** no sistema na versão atual do projeto, garantindo transparência com a equipe técnica, clientes e investidores.

| # | O que o sistema NÃO faz (v1.0) |
|---|---|
| EN01 | **Não processa pagamentos reais.** O sistema registra pedidos e exibe QR Code e dados de cartão, mas não possui integração com gateways de pagamento como Mercado Pago, Stripe ou Cielo. A confirmação de pagamento é manual. |
| EN02 | **Não envia notificações por e-mail para clientes.** O sistema envia e-mails de verificação de conta e recuperação de senha, mas não notifica o cliente sobre atualizações de status do pedido (pagamento confirmado, pedido enviado, etc.). |
| EN03 | **Não possui rastreamento de entrega integrado.** O status do pedido é atualizado manualmente pelo administrador. Não há integração com transportadoras (Correios, Jadlog, etc.) para rastreamento automático. |
| EN04 | **Não gerencia estoque automaticamente.** O sistema exibe o estoque cadastrado, mas não decrementa o estoque automaticamente ao confirmar o pagamento de um pedido. |
| EN05 | **Não possui sistema de fila ou processamento assíncrono.** Todas as operações são síncronas. Não há uso de filas (Redis, RabbitMQ) para tarefas como envio de e-mails ou geração de relatórios pesados. |
| EN06 | **Não suporta múltiplos vendedores (marketplace).** A plataforma opera com um único lojista. Não há gestão de sellers, comissões ou repasses. |
| EN07 | **Não possui sistema de cupons por produto ou categoria.** Os cupons se aplicam ao total do carrinho. Não há suporte a descontos específicos por produto ou categoria. |
| EN08 | **Não possui programa de fidelidade ou pontos.** Não há acúmulo de pontos, cashback ou benefícios por recorrência de compra. |
| EN09 | **Não permite parcelamento de cartão.** O checkout com cartão de crédito registra a transação sem opções de parcelamento configuráveis. |
| EN10 | **O app mobile não permite gerenciar produtos ou categorias.** O app é somente para consulta e gestão de pedidos/relatórios. Ações de cadastro e edição de produtos são exclusivas do painel web. |
| EN11 | **Não possui busca full-text nativa no backend.** A busca por texto nos produtos é realizada via IA (Groq) no frontend; não há índice de busca (Elasticsearch, Algolia) no backend. |
| EN12 | **Não possui suporte a múltiplos idiomas ou moedas.** O sistema opera exclusivamente em Português do Brasil e em Reais (BRL). |
| EN13 | **Não possui sistema de chat ou atendimento em tempo real.** O formulário de contato é o único canal direto disponível; não há chat ao vivo integrado. |
| EN14 | **Não realiza backup automático do banco de dados.** A responsabilidade por backups é do serviço de hospedagem (Railway); não há rotina de backup gerenciada pela aplicação. |
| EN15 | **Não possui testes automatizados de ponta a ponta (E2E).** Existem testes unitários e de componentes com Vitest, mas não há cobertura E2E com Cypress ou Playwright. |

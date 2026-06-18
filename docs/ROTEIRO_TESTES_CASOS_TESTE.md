# SmartCart

## Roteiro de Testes e Casos de Teste

**Curso:** Desenvolvimento de Sistemas  
**Instituição:** SENAI  
**Turma:** dsv1  
**Sala:** v1  
**Professor:** Rogerio Santos  
**Data:** 07/06/2026  

**Integrantes:** Caio Boing, Nicolas Vieira, Arthur Flores e Felipe Barbosa

> Documento de validação funcional do projeto SmartCart, elaborado para orientar a execução dos testes, registrar os resultados obtidos e comprovar que os principais fluxos do sistema funcionaram conforme o esperado.

---

## 1. Visão Geral

O SmartCart é uma solução de carrinho de supermercado inteligente que busca tornar a compra mais rápida, prática e integrada. O sistema possui área pública para usuários, carrinho de compras, checkout, pedidos, avaliações, contato e painel administrativo para gerenciamento de produtos, pedidos e demais informações do sistema.

Este roteiro organiza os testes de forma metódica, transformando o planejamento teórico em ações práticas. Cada teste possui objetivo, pré-condição, dados de entrada, passos de execução, resultado esperado e resultado obtido.

---

## 2. Objetivo dos Testes

Validar se as principais funcionalidades do SmartCart estão funcionando corretamente, observando:

- comportamento das telas;
- validação de dados;
- navegação entre páginas;
- autenticação de usuários;
- permissões de acesso administrativo;
- funcionamento do carrinho;
- criação e consulta de pedidos;
- cadastro e alteração de produtos;
- mensagens exibidas ao usuário.

O resultado esperado é confirmar que o sistema está estável para apresentação, sem falhas críticas nos fluxos principais.

---

## 3. Ambiente de Teste

| Item | Informação |
|---|---|
| Sistema testado | SmartCart |
| Tipo de teste | Funcional manual |
| Frontend | React + Vite |
| Backend | PHP |
| Banco de dados | MySQL |
| URL do frontend | `http://localhost:5173` |
| URL da API | `http://localhost:3001` |
| Navegador | Google Chrome |
| Sistema operacional | Windows 11 |
| Responsável pela execução | Caio Boing |
| Status geral | Aprovado |

---

## 4. Critérios de Aprovação

Um teste é considerado **aprovado** quando:

- o sistema executa a ação sem erro;
- o comportamento real corresponde ao resultado esperado;
- os dados informados são processados corretamente;
- mensagens de erro ou sucesso aparecem quando necessário;
- o usuário comum não acessa áreas restritas;
- o administrador consegue executar as rotinas esperadas;
- não há travamentos, telas quebradas ou fluxos interrompidos.

---

## 5. Roteiro Geral de Execução

| Etapa | Roteiro do teste | Objetivo | O que se espera | Resultado |
|---|---|---|---|---|
| 1 | Abrir o sistema no navegador | Confirmar carregamento da aplicação | Página inicial exibida corretamente | Aprovado |
| 2 | Testar cadastro e login | Validar autenticação do usuário | Usuário entra no sistema | Aprovado |
| 3 | Navegar por produtos | Conferir listagem e detalhes | Produtos aparecem com informações corretas | Aprovado |
| 4 | Usar o carrinho | Validar inclusão, alteração e remoção | Carrinho atualiza itens e valores | Aprovado |
| 5 | Aplicar cupom | Testar regra de desconto | Total atualizado ou erro exibido | Aprovado |
| 6 | Finalizar pedido | Validar checkout | Pedido criado com sucesso | Aprovado |
| 7 | Acessar painel admin | Validar permissões administrativas | Admin entra e gerencia dados | Aprovado |
| 8 | Registrar resultado final | Consolidar evidências do teste | Documento concluído sem falhas | Aprovado |

---

## 6. Casos de Teste

### CT-001 - Cadastro de Usuário

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se um novo usuário consegue criar uma conta no SmartCart. |
| Pré-condição | O usuário deve estar deslogado e na tela de cadastro. |
| Dados de entrada | Nome, e-mail válido, senha e confirmação de senha. |
| Roteiro do teste | Acessar cadastro, preencher os campos obrigatórios e confirmar o envio do formulário. |
| O que se espera | O sistema deve validar os dados e criar a conta do usuário. |
| Resultado esperado | Usuário cadastrado com sucesso, sem erro visual ou técnico. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-002 - Cadastro com E-mail Inválido

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o sistema bloqueia cadastro com e-mail em formato incorreto. |
| Pré-condição | O usuário deve estar na tela de cadastro. |
| Dados de entrada | Nome válido, e-mail inválido e senha preenchida. |
| Roteiro do teste | Preencher o formulário com e-mail inválido e tentar concluir o cadastro. |
| O que se espera | O sistema deve impedir o cadastro e exibir mensagem de validação. |
| Resultado esperado | Conta não criada e erro apresentado ao usuário. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-003 - Login de Usuário

| Campo | Descrição |
|---|---|
| Objetivo do teste | Confirmar se um usuário cadastrado consegue acessar sua conta. |
| Pré-condição | O usuário deve possuir cadastro válido. |
| Dados de entrada | E-mail e senha corretos. |
| Roteiro do teste | Abrir login, informar as credenciais e clicar em entrar. |
| O que se espera | O sistema deve autenticar o usuário e liberar a navegação. |
| Resultado esperado | Usuário logado e redirecionado para área permitida. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-004 - Login com Senha Incorreta

| Campo | Descrição |
|---|---|
| Objetivo do teste | Validar se o sistema impede acesso com credenciais incorretas. |
| Pré-condição | O usuário deve estar na tela de login. |
| Dados de entrada | E-mail existente e senha incorreta. |
| Roteiro do teste | Informar credenciais inválidas e tentar entrar. |
| O que se espera | O sistema deve negar o acesso. |
| Resultado esperado | Mensagem de erro exibida e usuário permanece deslogado. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-005 - Listagem de Produtos

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se os produtos cadastrados são exibidos para o usuário. |
| Pré-condição | A API deve estar ativa e existir produto cadastrado. |
| Dados de entrada | Acesso à página de produtos. |
| Roteiro do teste | Abrir a página de produtos e conferir os cards exibidos. |
| O que se espera | Os produtos devem aparecer com nome, preço, imagem e informações principais. |
| Resultado esperado | Listagem carregada corretamente. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-006 - Detalhes do Produto

| Campo | Descrição |
|---|---|
| Objetivo do teste | Validar se a página de detalhes mostra as informações completas do produto. |
| Pré-condição | Deve existir pelo menos um produto disponível. |
| Dados de entrada | Clique em um produto da listagem. |
| Roteiro do teste | Acessar produtos, selecionar um item e conferir a página de detalhes. |
| O que se espera | O sistema deve abrir o produto escolhido. |
| Resultado esperado | Nome, preço, imagem, descrição e opção de compra exibidos corretamente. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-007 - Adicionar Produto ao Carrinho

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o usuário consegue adicionar um produto ao carrinho. |
| Pré-condição | Usuário logado e produto disponível. |
| Dados de entrada | Produto selecionado e quantidade desejada. |
| Roteiro do teste | Abrir produto, selecionar quantidade e adicionar ao carrinho. |
| O que se espera | O item deve aparecer no carrinho com os valores corretos. |
| Resultado esperado | Produto adicionado com nome, quantidade e subtotal corretos. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-008 - Alterar Quantidade no Carrinho

| Campo | Descrição |
|---|---|
| Objetivo do teste | Confirmar se o total do carrinho é recalculado ao alterar a quantidade. |
| Pré-condição | Carrinho com pelo menos um item. |
| Dados de entrada | Nova quantidade do produto. |
| Roteiro do teste | Acessar carrinho, alterar quantidade e observar o total. |
| O que se espera | O sistema deve atualizar subtotal e total da compra. |
| Resultado esperado | Valores recalculados corretamente. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-009 - Remover Produto do Carrinho

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o usuário consegue remover um item do carrinho. |
| Pré-condição | Carrinho com pelo menos um produto. |
| Dados de entrada | Item selecionado para remoção. |
| Roteiro do teste | Acessar carrinho, clicar em remover e confirmar se necessário. |
| O que se espera | O produto deve sair do carrinho. |
| Resultado esperado | Item removido e total atualizado. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-010 - Aplicar Cupom de Desconto

| Campo | Descrição |
|---|---|
| Objetivo do teste | Validar se um cupom válido altera o valor final da compra. |
| Pré-condição | Carrinho com item e cupom válido cadastrado. |
| Dados de entrada | Código de cupom válido. |
| Roteiro do teste | Digitar o cupom no carrinho ou checkout e aplicar. |
| O que se espera | O desconto deve ser aplicado ao total. |
| Resultado esperado | Valor final reduzido conforme regra do cupom. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-011 - Cupom Inválido

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o sistema rejeita cupom inexistente ou inválido. |
| Pré-condição | Usuário no carrinho ou checkout. |
| Dados de entrada | Código de cupom inválido. |
| Roteiro do teste | Informar cupom inválido e tentar aplicar. |
| O que se espera | O sistema deve exibir erro e manter o total original. |
| Resultado esperado | Cupom recusado e valor da compra sem alteração. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-012 - Finalização de Pedido

| Campo | Descrição |
|---|---|
| Objetivo do teste | Confirmar se o usuário consegue concluir uma compra. |
| Pré-condição | Usuário logado e carrinho com produtos. |
| Dados de entrada | Produtos, dados de entrega e forma de pagamento. |
| Roteiro do teste | Acessar carrinho, ir ao checkout, preencher dados e confirmar pedido. |
| O que se espera | O sistema deve criar o pedido com os itens selecionados. |
| Resultado esperado | Pedido confirmado e mensagem de sucesso exibida. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-013 - Histórico de Pedidos

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o usuário consegue visualizar pedidos feitos. |
| Pré-condição | Usuário logado e com pelo menos um pedido criado. |
| Dados de entrada | Acesso à área de meus pedidos. |
| Roteiro do teste | Fazer login, abrir meus pedidos e conferir a listagem. |
| O que se espera | O sistema deve mostrar apenas os pedidos do usuário autenticado. |
| Resultado esperado | Pedidos exibidos com status, data e valor. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-014 - Login do Administrador

| Campo | Descrição |
|---|---|
| Objetivo do teste | Validar o acesso ao painel administrativo. |
| Pré-condição | Administrador com credenciais válidas. |
| Dados de entrada | E-mail `admin@smartcart.com` e senha `admin123`. |
| Roteiro do teste | Acessar `/admin/login`, informar credenciais e entrar. |
| O que se espera | O sistema deve autenticar o administrador. |
| Resultado esperado | Painel administrativo carregado corretamente. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-015 - Bloqueio de Rota Administrativa

| Campo | Descrição |
|---|---|
| Objetivo do teste | Garantir que usuário não autenticado não acesse o painel admin. |
| Pré-condição | Não deve existir token de administrador ativo. |
| Dados de entrada | Acesso direto a uma rota administrativa. |
| Roteiro do teste | Sair da conta admin e tentar acessar uma rota protegida pela URL. |
| O que se espera | O sistema deve bloquear o acesso. |
| Resultado esperado | Usuário redirecionado para login administrativo. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-016 - Cadastro de Produto pelo Admin

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o administrador consegue cadastrar um novo produto. |
| Pré-condição | Administrador autenticado. |
| Dados de entrada | Nome, preço, categoria, estoque, descrição e imagem. |
| Roteiro do teste | Acessar painel admin, abrir produtos, cadastrar novo produto e salvar. |
| O que se espera | O produto deve ser salvo no sistema. |
| Resultado esperado | Produto aparece na listagem administrativa e pública. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-017 - Edição de Produto pelo Admin

| Campo | Descrição |
|---|---|
| Objetivo do teste | Confirmar se o administrador consegue alterar dados de um produto. |
| Pré-condição | Administrador logado e produto existente. |
| Dados de entrada | Novos dados do produto. |
| Roteiro do teste | Acessar produtos, editar item selecionado, alterar dados e salvar. |
| O que se espera | O sistema deve atualizar os dados do produto. |
| Resultado esperado | Dados alterados aparecem corretamente após salvar. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-018 - Exclusão de Produto pelo Admin

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o administrador consegue excluir um produto. |
| Pré-condição | Administrador logado e produto existente. |
| Dados de entrada | Produto selecionado para exclusão. |
| Roteiro do teste | Acessar produtos, clicar em excluir e confirmar a ação. |
| O que se espera | O produto deve ser removido ou o sistema deve avisar se houver restrição. |
| Resultado esperado | Produto removido da listagem quando a exclusão for permitida. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-019 - Atualização de Status do Pedido pelo Admin

| Campo | Descrição |
|---|---|
| Objetivo do teste | Validar se o administrador consegue atualizar o status de um pedido. |
| Pré-condição | Administrador logado e pedido existente. |
| Dados de entrada | Novo status do pedido. |
| Roteiro do teste | Acessar pedidos no admin, selecionar pedido, alterar status e salvar. |
| O que se espera | O status deve ser atualizado no sistema. |
| Resultado esperado | Novo status aparece para administrador e usuário. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

### CT-020 - Formulário de Contato

| Campo | Descrição |
|---|---|
| Objetivo do teste | Verificar se o usuário consegue enviar uma mensagem de contato. |
| Pré-condição | Usuário na página de contato. |
| Dados de entrada | Nome, e-mail, assunto e mensagem. |
| Roteiro do teste | Abrir contato, preencher campos e enviar. |
| O que se espera | O sistema deve registrar ou enviar a mensagem. |
| Resultado esperado | Mensagem de sucesso exibida ao usuário. |
| Resultado obtido | Funcionou conforme esperado. |
| Status | Aprovado |

---

## 7. Resumo dos Resultados

| Indicador | Resultado |
|---|---|
| Total de casos executados | 20 |
| Testes aprovados | 20 |
| Testes reprovados | 0 |
| Falhas críticas | 0 |
| Evidências anexadas | Não foram anexados prints ou logs |
| Situação final | Sistema aprovado nos fluxos testados |

---

## 8. Registro de Falhas

| ID | Caso de teste | Falha encontrada | Severidade | Situação |
|---|---|---|---|---|
| - | - | Nenhuma falha encontrada durante a execução dos testes. | - | Concluído |

---

## 9. Conclusão

Com a execução deste roteiro, foi possível validar os principais fluxos do SmartCart de forma organizada. Os testes indicaram que as funcionalidades avaliadas responderam conforme o esperado, sem registro de falhas durante a execução.

O sistema foi considerado aprovado para apresentação, pois os fluxos de usuário comum, carrinho, pedidos e painel administrativo funcionaram corretamente dentro do ambiente testado.

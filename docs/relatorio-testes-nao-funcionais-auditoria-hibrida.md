# 3. Relatorio de Testes Nao Funcionais e Auditoria Hibrida

Este relatorio avalia qualidades internas do SmartCart sob os eixos de experiencia, acessibilidade, robustez operacional e seguranca da informacao. A auditoria combina tres fontes de evidencia: execucao local de testes automatizados, inspecao analitica do codigo-fonte e checklist de conformidade baseado em Nielsen, WCAG e OWASP Top 10.

Data da avaliacao: 18/06/2026.

## 3.1 Escopo Avaliado

Foram avaliados os modulos principais da versao moderna do sistema:

| Camada | Caminho | Itens avaliados |
|---|---|---|
| Frontend web | `modern/frontend` | Build de producao, componentes React, formularios, imagens, rotas protegidas e testes Vitest |
| Backend API | `modern/backend` | Servicos, repositorios, middleware de autenticacao, JWT, rate limit e testes PHPUnit |
| Documentacao | `docs/architecture` e `docs/TESTES.md` | Arquitetura, autenticacao, rotas, banco de dados e cobertura de testes |

## 3.2 Evidencias de Execucao

| Verificacao | Comando executado | Resultado |
|---|---|---|
| Testes automatizados de frontend | `npm test -- --run` em `modern/frontend` | Passou: 18 arquivos, 80 testes, 80 aprovados |
| Testes automatizados de backend | `vendor\bin\phpunit` em `modern/backend` | Passou: 213 testes, 394 assercoes, com 3 warnings |
| Build de producao | `npm run build` em `modern/frontend` | Passou: bundle gerado em `dist` |
| Observacao de performance | Saida do Vite | Atencao: alguns chunks ficaram acima de 500 kB |
| Google Lighthouse | Verificacao de disponibilidade local | Nao executado neste ambiente: binario `lighthouse` e navegadores CLI nao estavam disponiveis |

Os warnings do PHPUnit ocorreram na tentativa de registrar logs de auditoria sem conexao ativa com banco de dados local. Como a suite terminou com status OK, o comportamento funcional testado foi preservado, mas recomenda-se executar novamente com MySQL ativo para validar tambem a persistencia de auditoria.

## 3.3 Testes de Guerrilha e Experiencia Empirica

Os testes de guerrilha devem ser aplicados com usuarios reais em sessoes curtas, preferencialmente de 10 a 15 minutos, usando tarefas representativas do fluxo de compra e administracao. O objetivo e observar atritos sem induzir respostas.

| Tarefa | Criterio de sucesso | Resultado esperado | Status |
|---|---|---|---|
| Localizar um produto pela vitrine ou categoria | Usuario encontra o produto sem ajuda | Navegacao compreensivel e produto acessivel em poucos cliques | Pendente de coleta com usuarios reais |
| Abrir detalhes do produto e adicionar ao carrinho | Produto aparece no carrinho com quantidade correta | Fluxo de compra compreensivel | Pendente de coleta com usuarios reais |
| Realizar login de cliente | Usuario entende campos obrigatorios e mensagens de erro | Login bem-sucedido ou erro claro | Pendente de coleta com usuarios reais |
| Usar recuperacao de senha | Usuario solicita redefinicao sem ajuda | Mensagem de confirmacao clara | Pendente de coleta com usuarios reais |
| Acessar painel admin com credencial autorizada | Rotas protegidas liberam apenas usuario admin | Autenticacao e permissao compreensiveis | Pendente de coleta com usuarios reais |

Conclusao empirica: o repositorio ainda nao contem registros assinados, videos, formularios ou planilhas de testes com usuarios reais. Assim, a auditoria registra o protocolo necessario e recomenda anexar evidencias de aplicacao antes da entrega final.

## 3.4 Inspecao pelas 10 Heuristicas de Nielsen

| Heuristica | Evidencia observada | Resultado |
|---|---|---|
| Visibilidade do status do sistema | Componentes usam loading, skeletons e spinners em paginas como produto, reviews, carrinho e admin | Passou |
| Correspondencia com o mundo real | Textos como carrinho, pedidos, produtos, cupons e avaliacoes seguem vocabulario de e-commerce | Passou |
| Controle e liberdade do usuario | Existem botoes de fechar, voltar, cancelar e rotas de retorno em fluxos principais | Passou |
| Consistencia e padroes | O frontend usa componentes reutilizaveis, rotas padronizadas e classes visuais recorrentes | Passou |
| Prevencao de erros | Formularios possuem validacoes, campos obrigatorios e bloqueios de botao em loading | Passou parcialmente |
| Reconhecimento em vez de memorizacao | Menus, breadcrumbs e labels visiveis reduzem necessidade de memorizar caminhos | Passou |
| Flexibilidade e eficiencia | Painel admin possui filtros, tabelas e atalhos operacionais por tela | Passou |
| Design estetico e minimalista | Interface prioriza cards, listas, filtros e areas funcionais sem excesso textual | Passou |
| Recuperacao de erros | Servicos retornam mensagens para credenciais invalidas, token expirado, cadastro duplicado e entradas invalidas | Passou |
| Ajuda e documentacao | Existem documentos em `docs/architecture` e `docs/TESTES.md` | Passou parcialmente |

Pontos de melhoria: associar todos os `label` a campos por `htmlFor`/`id`, revisar mensagens de erro para manter consistencia de idioma e executar testes com usuarios reais para validar se o comportamento observado por especialistas se confirma na pratica.

## 3.5 Acessibilidade WCAG e Varredura de DOM

A avaliacao de acessibilidade foi orientada por criterios WCAG e por varredura textual do DOM React. A execucao completa via Google Lighthouse deve ser feita em ambiente com Chrome/Edge e Lighthouse instalados.

| Item WCAG/Lighthouse | Evidencia | Resultado |
|---|---|---|
| Texto alternativo em imagens descritivas | Produtos, categorias, banners e logos possuem `alt` em varios componentes | Passou parcialmente |
| Imagens decorativas com `alt=""` | Popups, logos decorativos e miniaturas de apoio usam `alt=""` em alguns pontos | Passou |
| Nome acessivel em controles de icone | Ha uso de `aria-label` em fechar anuncio, redes sociais, simulacao de sensor e botoes do display | Passou |
| Rotulos de formularios | Ha labels visiveis, mas varios nao estao associados a inputs por `htmlFor`/`id` | Falhou |
| Contraste de cores | Nao foi medido automaticamente por Lighthouse neste ambiente | Pendente |
| Conteudo HTML injetado | `ProductDetail.jsx` usa `dangerouslySetInnerHTML` para descricao de produto | Falhou para seguranca preventiva |
| Navegacao protegida | Testes validam redirecionamento de rotas sem token e token expirado no admin | Passou |

Resultado geral de acessibilidade: aprovado com ressalvas. A interface apresenta bons sinais de semantica visual e atributos alternativos, mas nao deve ser considerada plenamente conforme WCAG sem a execucao formal do Lighthouse e sem a correcao dos labels nao associados.

Comando recomendado para gerar evidencia Lighthouse em ambiente preparado:

```powershell
npm run build
npm run preview
npx lighthouse http://localhost:4173 --only-categories=accessibility --output html --output-path docs/lighthouse-accessibility.html
```

## 3.6 Auditoria OWASP Top 10

| Risco OWASP Top 10 | Controle observado | Resultado |
|---|---|---|
| A01: Broken Access Control | Rotas admin usam JWT, `AuthMiddleware` valida role e permissoes especificas | Passou |
| A02: Cryptographic Failures | Senhas usam `password_hash`/`password_verify`; JWT usa HMAC-SHA256 com `JWT_SECRET` | Passou |
| A03: Injection | Repositorios usam PDO `prepare` e parametros em consultas SQL sensiveis | Passou |
| A04: Insecure Design | Ha separacao entre controllers, services, repositories e middleware | Passou parcialmente |
| A05: Security Misconfiguration | CORS e variaveis de ambiente existem, mas segredo de exemplo aparece documentado | Passou parcialmente |
| A06: Vulnerable and Outdated Components | Dependencias existem em `package-lock.json` e `composer.lock`, mas nao foi executado audit de vulnerabilidades | Pendente |
| A07: Identification and Authentication Failures | Login valida senha por hash, token expira e login comum tem rate limit | Passou |
| A08: Software and Data Integrity Failures | Build e testes automatizados passam; nao ha evidencia de assinatura de artefatos | Passou parcialmente |
| A09: Security Logging and Monitoring Failures | `AuditRepository` registra login/logout admin, mas teste local alertou falha de conexao no log | Passou parcialmente |
| A10: Server-Side Request Forgery | Nao foram encontrados fluxos evidentes de requisicao server-side para URL arbitraria do usuario | Passou parcialmente |

## 3.7 Validacao Contra SQL Injection

A aplicacao usa PDO com prepared statements nos repositorios, reduzindo o risco de SQL Injection por separacao entre instrucao SQL e dados do usuario. Exemplos observados incluem busca por e-mail, tokens de verificacao, carrinho, produtos, categorias, pedidos, cupons e relatorios.

Evidencias praticas:

| Entrada maliciosa simulada | Ponto de entrada | Controle esperado | Resultado |
|---|---|---|---|
| `' OR '1'='1` | Login por e-mail | Valor tratado como parametro, nao como SQL | Passou por inspecao |
| `admin@test.com' --` | Busca de usuario | `prepare` + `execute([$email])` | Passou por inspecao |
| `1; DROP TABLE Usuario;` | IDs em repositorios | Parametrizacao por placeholder | Passou por inspecao |

Ressalva: a auditoria foi feita por inspecao de codigo e cobertura de testes unitarios. Para evidencia final, recomenda-se acrescentar testes automatizados especificos com payloads de SQL Injection nos endpoints de login, cadastro, busca de produto e carrinho.

## 3.8 Validacao Contra XSS

O React escapa texto renderizado por padrao, o que reduz XSS refletido em campos comuns como nome, comentario e mensagens. No backend, e-mails e algumas saidas HTML usam `htmlspecialchars`, especialmente em mensagens e notificacoes.

Entretanto, existe um ponto critico: `ProductDetail.jsx` renderiza `produto.descricao` com `dangerouslySetInnerHTML`. Caso essa descricao venha de entrada administrativa sem sanitizacao robusta no backend, payloads como `<script>alert(1)</script>` ou atributos como `onerror` podem ser persistidos e executados no navegador.

| Vetor XSS | Controle observado | Resultado |
|---|---|---|
| Texto em componentes React comuns | Escape automatico do React | Passou |
| HTML em e-mails/notificacoes | Uso de `htmlspecialchars` em varios services | Passou |
| Descricao HTML de produto | Uso de `dangerouslySetInnerHTML` sem sanitizador visivel | Falhou |

Recomendacao obrigatoria: sanitizar HTML de descricao de produto antes de salvar ou antes de renderizar, permitindo apenas tags seguras. Alternativamente, trocar a descricao para renderizacao textual comum quando HTML rico nao for indispensavel.

## 3.9 Autenticacao e Protecao Contra Forca Bruta

A autenticacao e baseada em JWT. O backend gera tokens com `iat` e `exp`; administradores recebem expiracao de 8 horas e clientes de 24 horas. O middleware valida formato Bearer, assinatura e expiracao antes de liberar rotas protegidas.

Controles observados:

| Controle | Implementacao | Resultado |
|---|---|---|
| Hash de senha | `password_hash` no cadastro e alteracao; `password_verify` no login | Passou |
| Expiracao de token | `Jwt::generate` define `exp`; `Jwt::verify` bloqueia expirados | Passou |
| Protecao de rotas admin | `AuthMiddleware::handle('admin', ...)` por papel/permissao | Passou |
| Rate limit no login | `RateLimitMiddleware::handle('auth:login:' . $email, 5, 15 * 60)` | Passou |
| Rate limit em recuperacao de senha | 3 tentativas por 15 minutos | Passou |
| Testes de rota protegida | Frontend valida redirecionamento sem token e token expirado | Passou |

Conclusao: a aplicacao possui protecao pratica contra ataques de forca bruta no login comum por limite de tentativas por IP/e-mail. Recomenda-se confirmar se o login administrativo tambem passa por rate limit equivalente; caso nao passe, deve receber o mesmo controle.

## 3.10 Resultado Consolidado

| Area | Resultado | Justificativa |
|---|---|---|
| Robustez funcional | Passou | Frontend e backend passaram nas suites automatizadas |
| Build de producao | Passou com alerta | Build gerado, mas ha chunks grandes |
| Experiencia de usuario | Passou parcialmente | Heuristicas atendidas por inspecao, mas faltam evidencias de guerrilha real |
| Acessibilidade | Passou parcialmente | Bons atributos `alt`/`aria-label`, mas labels incompletos e Lighthouse pendente |
| SQL Injection | Passou | Uso amplo de prepared statements com PDO |
| XSS | Falhou parcialmente | Existe renderizacao de HTML via `dangerouslySetInnerHTML` sem sanitizacao evidente |
| Autenticacao | Passou | Hash de senha, JWT expiravel, middleware e rate limit em login |
| Auditoria e logs | Passou parcialmente | Existe repositorio de auditoria, mas execucao local gerou warning sem banco |

## 3.11 Plano de Correcao Prioritario

1. Substituir ou sanitizar `dangerouslySetInnerHTML` em `ProductDetail.jsx`.
2. Associar labels de formulario a campos por `htmlFor` e `id`.
3. Executar Lighthouse em ambiente com navegador instalado e anexar relatorio HTML.
4. Aplicar testes de guerrilha com usuarios reais e registrar tarefas, tempo, erros e comentarios.
5. Confirmar rate limit no login administrativo.
6. Executar auditoria de dependencias com `npm audit` e `composer audit`.
7. Reexecutar PHPUnit com banco local ativo para validar logs de auditoria sem warnings.

## 3.12 Conclusao

O SmartCart apresenta uma base tecnica consistente para testes nao funcionais: as suites automatizadas passam, a arquitetura separa responsabilidades, a autenticacao usa hash de senha e JWT expiravel, e a camada de persistencia adota prepared statements. Sob a perspectiva OWASP, os controles contra SQL Injection e forca bruta estao bem encaminhados.

As principais pendencias para conformidade final estao em acessibilidade formal e XSS preventivo. A aprovacao plena exige a execucao documentada do Google Lighthouse, a correcao de labels nao associados e a sanitizacao da descricao HTML de produtos. Tambem e necessario anexar evidencias reais de testes de guerrilha para transformar a avaliacao heuristica em auditoria hibrida completa.

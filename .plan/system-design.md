## Sistema: SaaS ERP para Lojas de Roupas

### 1. Visão geral e requisitos
- **Objetivo**: ERP multi-tenant para estabelecimentos de varejo de moda com integração conversacional via IA (MCP) para consultar/alterar dados por diálogo.
- **Entidades principais**: `stores`, `products`, `customers`, `sales` e `audit_logs`.
- **Funcionais**:
  - **Multi-tenant**: isolamento por `store_id` com RLS.
  - **CRUD**: estabelecimentos, produtos, clientes, vendas (pedidos).
  - **Painel Web**: Next.js (UI + API routes).
  - **MCP**: agente que responde perguntas, executa comandos, mantém contexto, aplica autorização e explica resultados.
  - **Logs/Auditoria**: tabela dedicada e export para observability.
  - **Segurança**: RBAC, proteção contra injeção e privilege escalation.
  - **Disponibilidade/escala**: foco em alta disponibilidade.
- **Não-funcionais**:
  - **Latência**: 300–800ms para operações comuns; respostas do MCP podem ser maiores.
  - **Custos**: escalar com controle financeiro.
  - **LGPD**: proteção, anonimização e eliminação de dados.

### 2. Decisões arquiteturais
- **Monólito modular Next.js**: API routes (serverless/containers) + UI React.
- **Supabase (Postgres)**: DB primário com RLS para multi-tenant/RBAC; `pgvector` para RAG.
- **MCP**: módulo separado dentro do monólito que orquestra LLM, parsing/intent, autorização, geração de SQL seguro e auditoria.
- **Autenticação**: Supabase Auth (JWT) ou OAuth com sessões no Next.
- **Logs/Audit**: tabela `audit_logs` + integração opcional com observability.
- **Deploy**: Vercel/Netlify ou containers (preferível para MCP em escala).

### 3. Modelo de dados (simplificado)
- **Isolamento por `store_id`** no schema `public` com RLS.
- **Tabelas**: `stores`, `users_meta`, `products`, `customers`, `sales`, `audit_logs`, `embeddings` (opcional para RAG).
- **Campos sensíveis**: considerar criptografia de colunas (ex.: email/telefone).

### 4. Multi-tenancy e segurança (RLS)
- **Abordagem**: shared schema + coluna `store_id` + RLS em tabelas sensíveis.
- **Policy**: `USING (store_id = current_setting('app.current_store')::uuid)`.
- **Sessão**: setar `app.current_store` na conexão por requisição autenticada.
- **RBAC**: `owner`, `manager`, `cashier` aplicados na API e, quando aplicável, em RLS.
- **JWT**: validar `sub` e claims (p.ex. `store_id`).

### 5. Arquitetura de alto nível
- **Next.js**: UI React (App/Pages), API routes (REST), SSR/handlers.
- **MCP**: integração com LLM, NLU/intent, planner, SQL seguro, executor, resposta natural e trilhas (traceability).
- **Supabase**: Postgres + Auth + Storage + Realtime + `pgvector`.
- **Observability**: logs (Loki/Datadog), métricas (Prometheus/Grafana).
- **Workers**: jobs longos (reindex, importações, relatórios).
- **CI/CD**: GitHub Actions/GitLab CI.
- **Storage**: Supabase Storage.

### 6. MCP — design detalhado
- **Subcomponentes**: Session Manager, NLU/Intent Extractor, Policy/Authorization, Planner/Grounding, SQL Generator/Query Builder, Executor, Response Generator, Traceability.
- **Fluxo**: input → NLU → autorização → plano (SQL/RAG/fluxo) → geração de SQL parametrizado → execução com `app.current_store` → resposta natural + gráficos/tabelas → auditoria.
- **Proteções**: nunca executar SQL livre; prepared statements; checagem AST; rate limit; confirmação para mutações; whitelists de tabelas/procedures.

### 7. API design (REST)
- Autenticado via Bearer JWT.
- Endpoints principais de `stores`, `products`, `customers`, `sales` e `mcp` (mensagens e histórico).
- `GET /api/stores/{id}/sales?from=&to=&group_by=` para agregações comuns.

### 8. UI/UX
- **Painel por store** com telas condicionadas por role.
- **Chat MCP** com histórico, quick-actions, confirmação para mutações e painel de explicabilidade (SQL, link para dados brutos).
- **Visualizações**: tabelas/gráficos client-side a partir de dados da API.

### 9. Infra, deploy e escala
- **Ambientes**: dev, staging, prod.
- **Deploy**: Vercel (serverless) ou containers/Kubernetes/ECS (preferível para MCP/Workers).
- **DB**: Supabase gerenciado; pooling de conexões.
- **Workers**: Fargate/Cloud Run para jobs.
- **Cache**: Redis para métricas/consultas recorrentes.
- **Rate limit**: Cloudflare/AWS API GW.
- **Escala MCP**: fila + workers para chamadas LLM.

### 10. Observability, logs e auditoria
- **Audit logs**: registrar ações/SQL/prompt (hash/criptografia quando necessário), exportar para ELK/Datadog.
- **Métricas**: latência, erros 5xx, tokens LLM, uso por tenant.
- **Tracing distribuído** para fluxos com LLM/external.
- **Alertas**: latência alta, falhas auth, quotas/limites.

### 11. Testes e segurança
- **Unit/e2e** com Playwright/Cypress.
- **Pentest básico**: SQLi, privilege escalation.
- **MCP**: testes adversariais (prompts maliciosos), bloqueios de SQL proibido.
- **Backups** e DR (RPO/RTO).

### 12. LGPD e dados sensíveis
- **Consentimento** e base legal.
- **Right to be forgotten**: anonimização/remoção de clientes.
- **Criptografia**: em repouso (Supabase) e em trânsito (TLS).
- **Masking**: ocultar dados sensíveis em logs.

### 13. Exemplo prático: prompt → SQL seguro
- **Intent**: `get_sales`, período: últimos 7 dias, agrupado por dia.
- **Template SQL** parametrizado, nunca concatenação de strings.
- **Execução** com parâmetros `[storeId, start_date]` e `app.current_store` configurado.
- **Resposta** natural + gráfico, com auditoria do que foi feito.



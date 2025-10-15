## Backend Plan (Next.js API + Supabase)

### Objetivo
Implementar API segura multi-tenant com RBAC e RLS, dando suporte ao MCP e ao painel web.

### Etapas
1) Fundações e autenticação
- Configurar Supabase (projeto, Auth, Postgres, Storage, pgvector).
- Definir `.env` seguros (chaves Supabase, JWT secret, Redis opcional).
- Middleware de autenticação no Next.js (validação de JWT, extração de `user_id`, `store_id`, `role`).

2) Multi-tenancy e RLS
- Criar tabelas `stores`, `users_meta`, `products`, `customers`, `sales`, `audit_logs`, `embeddings`.
- Habilitar RLS nas tabelas sensíveis e políticas `USING (store_id = current_setting('app.current_store')::uuid)`.
- No pool/conexão por request, executar `set_config('app.current_store', <store_id>, true)`.

3) RBAC e autorização
- Definir roles: `owner`, `manager`, `cashier`.
- Implementar guardas por endpoint (p.ex., `owner` pode criar `stores`; `cashier` não deleta produtos).
- Centralizar policy em utilitário (`can(user, action, resource)`), reutilizado pelo MCP.

4) Endpoints REST (handlers Next.js API routes)
- `POST /api/stores` (owner) — criar estabelecimento.
- `GET /api/stores` — listar stores do usuário (owner/admin).
- `GET /api/stores/{id}` — detalhes.
- `POST /api/stores/{id}/products` — criar produto.
- `GET /api/stores/{id}/products` — listar.
- `GET /api/stores/{id}/products/{productId}` — detalhes.
- `POST /api/stores/{id}/customers` — criar cliente.
- `GET /api/stores/{id}/customers` — listar.
- `POST /api/stores/{id}/sales` — criar venda (valida estoque e atualiza `stock`).
- `GET /api/stores/{id}/sales?from=&to=&group_by=` — consultas agregadas comuns.
- `POST /api/mcp/message` — roteia para MCP.
- `GET /api/mcp/session/{sessionId}/history` — histórico de conversa.

5) Acesso a dados
- Usar `@supabase/postgrest-js` ou `pg` com prepared statements.
- Evitar concatenar SQL; preferir query builder/ORM leve ou templates parametrizados.
- Stored procedures para operações críticas (ex.: ajuste de estoque, criação de venda atômica).

6) Auditoria e logs
- Em cada mutação: inserir em `audit_logs` com `user_id`, `store_id`, `action`, `details`.
- Integrar logger estruturado (p.ex., Pino) e exporter para observability.

7) Performance
- Indexes (datas, `store_id`, `sku`, `customer_id`).
- Redis opcional para caches de queries populares.
- Paginação e limites nas listagens.

8) Segurança
- Validação de inputs (Zod/Yup) nos handlers.
- Rate limit por IP/usuário/tenant.
- Cabeçalhos de segurança e CORS configurados.

### Critérios de aceite
- Todos endpoints protegidos por autenticação.
- RLS ativo e verificado por testes.
- RBAC aplicado e testado.
- Auditoria gravada em mutações e acessível para consultas.



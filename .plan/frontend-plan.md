## Frontend Plan (Next.js UI)

### Objetivo
Painel web por loja com CRUDs principais e chat MCP com explicabilidade.

### Etapas
1) Fundações
- Setup Next.js (App Router), Shadcn/UI (for components), auth com Supabase.
- Layout com seleção de `store` quando usuário possuir múltiplas.

2) Navegação e RBAC de telas
- Guardas por `role` (owner/manager/cashier) para rotas/sessões.

3) Telas CRUD
- Produtos: listar, criar/editar, detalhe (estoque, atributos).
- Clientes: listar, criar/editar.
- Vendas: criar venda (itens, pagamento), listar e agregações por período.

4) Chat MCP
- Janela de chat com histórico persistente por `session_id`.
- Quick-actions ("Vendas hoje", "Criar produto").
- Modal de confirmação para mutações.
- Painel de explicabilidade: exibir SQL e link "ver dados brutos".
- Renderização de `actions` (tabela/gráfico) a partir do payload do MCP.

5) UX e performance
- Skeletons, toasts, paginação e busca.
- Acessibilidade e internacionalização (pt-BR).

### Critérios de aceite
- Fluxos CRUD funcionais e protegidos por RBAC.
- Chat MCP com confirmação e explicabilidade.
- Tempo de resposta aceitável nas operações comuns.



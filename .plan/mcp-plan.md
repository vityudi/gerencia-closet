## MCP Plan (Middleware Conversacional)

### Objetivo
Converter mensagens em intenções seguras e explicáveis, executar ações e responder com linguagem natural.

### Componentes
- Session Manager: contexto (histórico, `user_id`, `store_id`, limites de tokens).
- NLU/Intent Extractor: chamada a LLM para extrair `{intent, entities, actionType}`.
- Policy/Authorization: verificar se o `role` permite a ação.
- Planner/Grounding: decidir entre SQL direto, RAG (`pgvector`) ou fluxo (mutações com confirmação).
- SQL Generator/Query Builder: gerar SQL parametrizado; checagem AST.
- Executor: executar query com `app.current_store`; registrar auditoria.
- Response Generator: resposta natural + dados estruturados (para gráfico/tabela).
- Traceability: salvar prompts, SQL, snapshot/hash do resultado, `trace_id`.

### Fluxos principais
1) Consulta (read-only)
- Receber mensagem → NLU → Policy ok → selecionar template SQL → gerar parâmetros → executar → formatar resposta + `actions` (ex.: chart) → auditar.

2) Comando mutante (write)
- Receber mensagem → NLU (ex.: "criar produto") → Policy ok → planejar → solicitar confirmação (a menos que explicitamente confirmado) → executar procedure/SQL parametrizado → auditar.

### Implementação passo a passo
1) DSL de intents e entidades (ex.: `get_sales`, `create_product`).
2) Prompt de sistema para NLU com instruções de segurança (sem SQL livre, extrair campos canônicos).
3) Templates SQL whitelisted e/ou stored procedures nomeadas.
4) Sandbox SQL (parser AST) que rejeita `DROP/ALTER/GRANT/COPY/pg_*`.
5) Adaptador de LLM (OpenAI/Anthropic) com timeouts, retries e circuit breaker.
6) Persistência de sessões e histórico (tabela ou storage leve) com TTL.
7) Auditoria detalhada com `trace_id` correlacionado ao logger/tracing.
8) Rate limiting/quota por usuário/tenant.

### Payloads
- Entrada `/api/mcp/message`: `{ session_id, user_id, store_id, message, channel }`.
- Saída: `{ reply, actions, trace_id }`.

### Critérios de aceite
- Nenhum SQL livre é executado.
- Confirmação obrigatória para mutações.
- Auditoria completa para cada ação.
- Testes adversariais cobrindo bypass de políticas e injeções.



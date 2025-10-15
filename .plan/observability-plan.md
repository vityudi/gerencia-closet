## Observability Plan (Logs, Métricas, Tracing, Auditoria)

### Objetivo
Garantir visibilidade operacional, rastreabilidade e auditoria do sistema e do MCP.

### Logs
- Logger estruturado (JSON) com correlação (`trace_id`, `session_id`, `user_id`, `store_id`).
- Export para Loki/Datadog/CloudWatch; retenção por ambiente.
- Sanitização/masking de PII.

### Métricas
- Latência p95/p99 por endpoint e por tenant.
- Erros 4xx/5xx; throughput; uso de tokens LLM.
- Filas (lag, taxa de consumo) e jobs (tempo/erro).

### Tracing
- OpenTelemetry com spans para API → MCP → DB/LLM.
- Amostragem ajustável; baggage com `store_id`.

### Auditoria
- Tabela `audit_logs` com ação, detalhes, prompt/SQL (hash/criptografia quando aplicável).
- Exportação periódica para SIEM.

### Dashboards e alertas
- Dashboards por domínio (auth, CRUD, MCP, DB, filas).
- Alertas: latência alta, taxa de erro, picos de tokens, falhas de auth, quota.



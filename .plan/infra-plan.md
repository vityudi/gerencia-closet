## Infra Plan (Deploy, Escala, Conectividade)

### Objetivo
Provisionar infraestrutura resiliente e escalável para o monólito Next.js, MCP e serviços adjacentes.

### Ambientes
- `dev`, `staging`, `prod` com configurações separadas de chaves/secrets e bases.

### Deploy e runtime
- Serverless (Vercel/Netlify) para UI/API leves.
- Containers (ECS/Kubernetes) preferíveis quando MCP/Workers requerem conexões longas ou fila.
- Imagens baseadas em Node LTS, com multi-stage build.

### Banco de dados
- Supabase gerenciado (Postgres + Auth + Storage + Realtime).
- Connection pooling habilitado.
- Backups automáticos e testes periódicos de restore.

### Workers e filas
- Fargate/Cloud Run para jobs (reindex embeddings, importações, relatórios).
- Fila gerenciada (SQS/PubSub) para desacoplar chamadas LLM e evitar bloquear requisições.

### Cache e rate limit
- Redis gerenciado para cache de queries e sessões MCP.
- Rate limit via Cloudflare/AWS API Gateway por IP/usuário/tenant.

### Rede e segurança
- TLS obrigatório; WAF/CDN na borda.
- CORS restrito; headers de segurança (CSP, HSTS, etc.).

### Segredos e configuração
- Armazenar em Secret Manager/SSM Parameter Store/Vercel Env.
- Rotação de chaves e segregação por ambiente.

### Observabilidade
- Logs estruturados (JSON) exportados para Loki/Datadog.
- Métricas em Prometheus/Grafana; tracing com OpenTelemetry.

### Escalabilidade
- Auto-scaling por CPU/memória/latência.
- Separar o MCP em deployment próprio com horizontal scaling.

### DR e continuidade
- RPO/RTO definidos; playbooks de incidente.
- Testes de failover e restauração.



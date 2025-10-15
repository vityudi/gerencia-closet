## Security & Compliance Plan (RBAC, RLS, LGPD)

### Objetivo
Endurecer segurança de app/dados e alinhar com princípios da LGPD.

### Controles de app
- RBAC: `owner`, `manager`, `cashier`; centralizar `can(action, resource)`.
- RLS: policies por `store_id` e checagens por sessão (`app.current_store`).
- Validação de input (Zod/Yup), sanitização, prepared statements.
- Rate limit, proteção contra brute force e enumeration.
- Headers de segurança; CORS; CSP; CSRF onde aplicável.

### Dados sensíveis
- Criptografia em repouso (Supabase) e em trânsito (TLS).
- Opção de criptografia de colunas (email/telefone) e masking em logs.

### LGPD
- Consentimento/base legal; política de privacidade.
- Direitos do titular: acesso, correção, portabilidade, eliminação/anonimização.
- Retenção e minimização de dados.
- Registro de atividades de tratamento.

### Auditoria e incidentes
- `audit_logs` para cada mutação e consultas sensíveis.
- Plano de resposta a incidentes; notificação conforme severidade/regulação.

### Terceiros
- Avaliar DPAs com provedores (LLM, observability, cloud).
- Revisar transferências internacionais e sub-processadores.



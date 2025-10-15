## Data Model Plan (Postgres/Supabase)

### Objetivo
Definir schema, políticas RLS e migrações com índices e constraints adequados.

### Etapas
1) Tabelas
- `stores (id, name, owner_user_id, metadata, created_at)`
- `users_meta (id, email, role, store_id, created_at)`
- `products (id, store_id, sku, name, description, price, stock, attributes, created_at)`
- `customers (id, store_id, full_name, phone, email, metadata, created_at)`
- `sales (id, store_id, customer_id, total, items, payment_method, status, created_at, created_by)`
- `audit_logs (id, store_id, user_id, action, details, created_at)`
- `embeddings (id, store_id, doc_id, embedding, content, metadata, created_at)`

2) RLS
- Habilitar RLS em tabelas com `store_id`.
- Políticas `USING (store_id = current_setting('app.current_store')::uuid)`.
- Policies específicas para leitura/escrita conforme role (se necessário).

3) Índices e integridade
- Índices por `store_id`, datas, `sku`, `customer_id`.
- FKs com `ON DELETE CASCADE` onde aplicável.
- Constraints de domínio (ex.: `price >= 0`, `stock >= 0`).

4) Migrações
- Scripts SQL versionados (Supabase CLI) para criar/alterar schema e policies.
- Seeds opcionais para ambientes de dev.

5) Segurança de dados
- Avaliar criptografia de colunas sensíveis (email/telefone).
- Masking para logs e views redigidas quando necessário.

### Critérios de aceite
- RLS efetiva e testada.
- Consultas comuns com planos eficientes (EXPLAIN/ANALYZE aceitáveis).
- Migrações idempotentes e versionadas.



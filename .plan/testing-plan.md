## Testing Plan (Unit, Integration, E2E, Segurança)

### Objetivo
Assegurar corretude funcional, segurança e resiliência, incluindo o MCP.

### Pirâmide de testes
- Unit: serviços, utils, autorização `can()`.
- Integração: handlers API, DB com RLS (testes de acesso cruzado).
- E2E: fluxos do painel (CRUD, vendas) com Playwright/Cypress.

### Testes MCP
- Adversariais: prompts para injeção/bypass de políticas.
- Verificação de sandbox SQL (AST) e proibição de comandos perigosos.
- Confirmação obrigatória para mutações.

### Segurança
- SAST (CodeQL/semgrep), DAST (ZAP/Burp autom.).
- Dependabot/renovate e SBOM.

### Performance e escala
- Carga (k6/Locust) nos endpoints críticos.
- Observabilidade validada (métricas e traces presentes).

### Migrações
- Rodar migrações em ambiente efêmero e validar reversão.



## CI/CD Plan (Pipelines, Gates, Versionamento)

### Objetivo
Automatizar build, testes, segurança e deploy com qualidade e rollback seguro.

### Fluxo de branches
- `main` (prod), `develop` (staging), feature branches com PRs e reviews.

### Pipeline CI (por PR)
- Lint/Typecheck.
- Testes unitários e integração.
- SAST/secret scan, SBOM.
- Build do app e preview (quando aplicável).

### Pipeline CD
- Staging: migrações -> deploy -> smoke/E2E -> gates.
- Produção: canary/blue-green -> migrações -> verificação -> promover.
- Rollback automatizado em caso de regressão (métrica/alerta).

### Artefatos e versões
- Imagens versionadas (SemVer + commit SHA).
- Infra como código (manifests Helm/Terraform quando aplicável).



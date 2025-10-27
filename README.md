# Gerencia Closet

Um painel de gestão multi-loja construído para lojas de varejo gerenciar produtos, vendas, clientes, membros da equipe e configurações específicas de loja.

## Visão Geral do Projeto

Gerencia Closet é um sistema abrangente de gestão de varejo que permite aos negócios:
- Gerenciar múltiplas lojas de varejo a partir de um painel centralizado
- Acompanhar o inventário de produtos entre lojas
- Monitorar transações de vendas e métodos de pagamento
- Gerenciar relacionamento com clientes e informações de contato
- Organizar e acompanhar o desempenho dos membros da equipe
- Configurar definições e integrações específicas da loja

## Stack Tecnológico

### Framework Principal
- **Next.js 15** - App Router com React Server Components
- **React 19** - Biblioteca UI moderna com hooks
- **TypeScript** - Modo strict habilitado para segurança de tipos

### Banco de Dados e Backend
- **Supabase** - Banco de dados PostgreSQL com Row Level Security (RLS)
- **Supabase Auth** - Autenticação de usuários e gerenciamento de sessão

### Frontend e Estilos
- **shadcn/ui** - Biblioteca de componentes compostos construída em primitivos Radix UI
- **Tailwind CSS v4** - Framework CSS utilitário
- **Tabler Icons React** - Biblioteca de ícones para elementos UI

### Dados e Visualização
- **TanStack Table (React Table v8)** - Componente de tabela poderoso com ordenação, filtragem e paginação
- **Recharts** - Biblioteca de gráficos para visualização de dados

### Gerenciamento de Estado
- **React Context API** - Seleção de loja global e estado da aplicação
- **Local Storage** - Preferências de usuário persistentes

## Início Rápido

### Pré-requisitos
- Node.js 18+ e npm
- Projeto Supabase com banco de dados PostgreSQL

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd gerencia-closet
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente em `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Desenvolvimento

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Produção

Construir e executar para produção:
```bash
npm run build
npm start
```

### Qualidade de Código

Execute o ESLint para verificar a qualidade do código:
```bash
npm run lint
```

## Arquitetura do Projeto

### Estrutura de Diretórios

```
app/
├── api/                  # Rotas de API do Next.js (Route Handlers)
│   └── stores/[id]/      # Endpoints de API com escopo de loja
├── dashboard/            # Páginas do painel com layout compartilhado
├── layout.tsx            # Layout raiz com provedores
└── page.tsx              # Página inicial

components/
├── ui/                   # Componentes base shadcn/ui
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   └── ...
└── [features]/           # Componentes específicos de funcionalidade
    ├── app-sidebar.tsx
    ├── products-table.tsx
    ├── sales-table.tsx
    ├── customers-table.tsx
    └── ...

contexts/
└── store-context.tsx     # Estado global de seleção de loja

hooks/
└── use-store.ts          # Hook de seleção de loja e sincronização de URL

lib/
├── supabase/
│   ├── client.ts         # Cliente Supabase do navegador
│   └── server.ts         # Clientes Supabase do lado do servidor
└── utils.ts              # Funções utilitárias (cn, formatação)
```

### Contexto Multi-Loja

A aplicação usa um contexto global (`StoreContext`) para gerenciar a seleção de loja:
- A seleção de loja é mantida em `localStorage`
- O parâmetro de query de URL `store_id` pode sobrescrever a seleção armazenada
- Use o hook `useStore()` para acessar `selectedStore`, `stores` e métodos de seleção
- Use o hook `useSelectedStoreId()` para obter o ID da loja ativa

### Esquema do Banco de Dados

Tabelas principais:
- **stores** - Entidades de loja com nome, endereço e metadados
- **products** - Produtos com escopo de loja via `store_id`
- **customers** - Informações de cliente com escopo de loja
- **sales** - Registros de transações de vendas com referências a produtos e membros da equipe
- **team_members** - Membros da equipe com escopo de loja
- **settings** - Configurações específicas da loja

### Padrões de Rotas de API

As rotas de API RESTful seguem um padrão consistente:
```typescript
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('store_id', id)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ items: data ?? [] })
}
```

Endpoints comuns:
- `GET /api/stores` - Listar todas as lojas
- `GET /api/stores/[id]/products` - Obter produtos de uma loja específica
- `GET /api/stores/[id]/sales` - Obter transações de vendas
- `GET /api/stores/[id]/customers` - Obter clientes
- `GET /api/stores/[id]/team` - Obter membros da equipe

### Páginas do Painel

#### Produtos (`/dashboard/products`)
- Exibir produtos em uma tabela pesquisável
- Pesquisar em: nome do produto, SKU
- Recursos: ordenação, paginação, menu de ações
- Status de estoque com badges codificadas por cor
- Exibição de preço em Real Brasileiro (BRL)

#### Clientes (`/dashboard/customers`)
- Gerenciar informações de clientes em uma tabela
- Pesquisar em: nome, email, telefone
- Exibir informações de contato com ícones
- Ações para gerenciamento de clientes

#### Vendas (`/dashboard/sales`)
- Acompanhar todas as transações de vendas
- Pesquisar em: data, hora, nome do vendedor, método de pagamento, valor
- Exibir: data/hora, valor (BRL), método de pagamento, informações do vendedor, status
- Badges de status codificadas por cor
- Integração com membros da equipe para informações do vendedor

#### Equipe (`/dashboard/team`)
- Gerenciar membros da equipe e visualizar desempenho
- Exibir: nome, email, telefone, cargo, data de contratação, status
- Estatísticas de vendas: valor total de vendas, quantidade de vendas, ticket médio
- Layout baseado em cartões para visão rápida

#### Configurações (`/dashboard/settings`)
- Configurar propriedades de produto e regras de validação
- Gerenciar visibilidade e ordem de colunas de tabela
- Configurar integrações: API de mensagens, gateways de pagamento, email/SMS
- Configurações e preferências específicas da loja
- Preferências do usuário: tema, idioma, notificações

## Principais Funcionalidades

### Gerenciamento Multi-Loja
- Alternar entre múltiplas lojas com seleção persistente
- Isolamento de dados específico da loja via chaves estrangeiras `store_id`
- Painel centralizado para todas as lojas

### Dados em Tempo Real
- Assinaturas em tempo real do Supabase para atualizações ao vivo
- Sincronização automática de dados entre clientes

### Segurança em Nível de Linha
- Políticas de segurança no nível do banco de dados
- Cliente de função de serviço para operações de admin
- Cliente anônimo para operações autenticadas pelo usuário

### Localização
- Formatação de data e hora em português brasileiro (pt-BR)
- Formatação de moeda em Real Brasileiro (BRL)
- Usando `Intl.NumberFormat` e `Intl.DateTimeFormat`

### Design Responsivo
- UI amigável para mobile com barra lateral retrátil
- Tabelas responsivas com menu de ações dropdown
- Botões e entradas amigáveis ao toque

## Padrões de Componentes

Todos os componentes seguem estas diretrizes:
- Usar componentes shadcn/ui como blocos de construção
- Usar Tabler Icons para toda a iconografia
- Componentes clientes marcados com diretiva `"use client"`
- Usar utilitário `cn()` para mesclagem condicional de classes
- Modo strict do TypeScript para segurança de tipos

### Padrão de Componente de Tabela

```typescript
// 1. Definir tipo correspondente ao esquema do banco de dados
type Item = {
  id: string
  // ... campos
}

// 2. Definir colunas com filtragem personalizada
const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "field_name",
    header: "Nome de Exibição",
    cell: ({ row }) => <div>{row.getValue("field_name")}</div>,
    filterFn: (row, id, value) => {
      // Lógica de pesquisa em múltiplos campos
      return field1.includes(value) || field2.includes(value)
    },
  },
]

// 3. Configurar tabela com filtragem
const table = useReactTable({
  data,
  columns,
  onColumnFiltersChange: setColumnFilters,
  getFilteredRowModel: getFilteredRowModel(),
  state: { columnFilters },
})
```

## Variáveis de Ambiente

Configuração necessária em `.env.local`:

```env
# Configuração Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

## Licença



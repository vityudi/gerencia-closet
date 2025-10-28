-- Script para limpar e reinserir dados de teste
-- Execute este script no SQL Editor do Supabase

-- ========================================
-- LIMPEZA DO BANCO DE DADOS
-- ========================================
-- Ordem de limpeza respeitando as foreign keys

-- 1. Limpar vendas primeiro (tem referências a team_members)
DELETE FROM sales;

-- 2. Limpar membros da equipe
DELETE FROM team_members;

-- 3. Limpar produtos
DELETE FROM products;

-- 4. Limpar clientes
DELETE FROM customers;

-- 5. Limpar lojas (por último, pois outros dependem dela)
-- DELETE FROM stores; -- Descomente se quiser limpar as lojas também

-- ========================================
-- CRIAÇÃO DAS ESTRUTURAS
-- ========================================

-- Criar tabela product_attributes (configuração de atributos de produto por loja)
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  is_variation BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, name)
);

-- Criar tabela product_attribute_options (opções predefinidas para atributos)
CREATE TABLE IF NOT EXISTS product_attribute_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela product_variations (variações de produtos como Tamanho, Cor, etc)
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, attribute_id, value)
);

-- Criar tabela product_columns (configuração de colunas da tabela de produtos)
CREATE TABLE IF NOT EXISTS product_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  label TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  column_type TEXT DEFAULT 'text', -- text, number, currency, date, select, textarea
  width TEXT DEFAULT 'auto', -- auto, sm, md, lg, xl
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, field_name)
);

-- Criar tabela product_column_options (opções predefinidas para colunas select)
CREATE TABLE IF NOT EXISTS product_column_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES product_columns(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela team_members se não existir
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'Vendedor',
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Férias', 'Licença')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna team_member_id na tabela sales se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'sales' AND column_name = 'team_member_id') THEN
        ALTER TABLE sales ADD COLUMN team_member_id UUID REFERENCES team_members(id);
    END IF;
END $$;

-- Adicionar colunas de produto se não existirem (refatoração de produtos)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'codigo') THEN
        ALTER TABLE products ADD COLUMN codigo TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'marca') THEN
        ALTER TABLE products ADD COLUMN marca TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'categoria') THEN
        ALTER TABLE products ADD COLUMN categoria TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'subcategoria') THEN
        ALTER TABLE products ADD COLUMN subcategoria TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'grupo') THEN
        ALTER TABLE products ADD COLUMN grupo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'subgrupo') THEN
        ALTER TABLE products ADD COLUMN subgrupo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'departamento') THEN
        ALTER TABLE products ADD COLUMN departamento TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'secao') THEN
        ALTER TABLE products ADD COLUMN secao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'estacao') THEN
        ALTER TABLE products ADD COLUMN estacao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'colecao') THEN
        ALTER TABLE products ADD COLUMN colecao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'descricao') THEN
        ALTER TABLE products ADD COLUMN descricao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'observacao') THEN
        ALTER TABLE products ADD COLUMN observacao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'fabricante') THEN
        ALTER TABLE products ADD COLUMN fabricante TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'fornecedor') THEN
        ALTER TABLE products ADD COLUMN fornecedor TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'ncm') THEN
        ALTER TABLE products ADD COLUMN ncm TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'cest') THEN
        ALTER TABLE products ADD COLUMN cest TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'custo') THEN
        ALTER TABLE products ADD COLUMN custo NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'preco1') THEN
        ALTER TABLE products ADD COLUMN preco1 NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'preco2') THEN
        ALTER TABLE products ADD COLUMN preco2 NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'preco3') THEN
        ALTER TABLE products ADD COLUMN preco3 NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- ========================================
-- INSERÇÃO DOS DADOS
-- ========================================

-- Criar loja principal (se não existir)
INSERT INTO stores (id, name, owner_user_id, metadata) VALUES
('33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Loja Principal', '11111111-1111-1111-1111-111111111111', '{}')
ON CONFLICT (id) DO NOTHING;

-- Criar produtos de exemplo (13 produtos no total)
INSERT INTO products (id, store_id, name, sku, price, stock) VALUES
('11111111-1111-1111-1111-111111111110', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Camiseta Básica', 'CAM-001', 29.90, 50),
('11111111-1111-1111-1111-111111111111', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Calça Jeans', 'CAL-001', 89.90, 25),
('11111111-1111-1111-1111-111111111112', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Tênis Esportivo', 'TEN-001', 159.90, 15),
('11111111-1111-1111-1111-111111111113', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Blusa Feminina', 'BLU-001', 45.90, 30),
('11111111-1111-1111-1111-111111111114', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Shorts Jeans', 'SHO-001', 59.90, 20),
('11111111-1111-1111-1111-111111111115', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Vestido Casual', 'VES-001', 79.90, 15),
('11111111-1111-1111-1111-111111111116', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Camisa Social', 'CAM-002', 69.90, 18),
('11111111-1111-1111-1111-111111111117', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Saia Midi', 'SAI-001', 55.90, 22),
('11111111-1111-1111-1111-111111111118', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Jaqueta Jeans', 'JAQ-001', 129.90, 12),
('11111111-1111-1111-1111-111111111119', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Sandália Feminina', 'SAN-001', 89.90, 25),
('11111111-1111-1111-1111-111111111120', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Bolsa de Couro', 'BOL-001', 199.90, 8),
('11111111-1111-1111-1111-111111111121', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Relógio Digital', 'REL-001', 299.90, 5),
('11111111-1111-1111-1111-111111111122', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Óculos de Sol', 'OCU-001', 149.90, 20);

-- Criar clientes de exemplo
INSERT INTO customers (id, store_id, full_name, email, phone) VALUES
('11111111-1111-1111-1111-111111111130', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'João Silva', 'joao@email.com', '(11) 99999-9999'),
('11111111-1111-1111-1111-111111111131', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Maria Santos', 'maria@email.com', '(11) 88888-8888'),
('11111111-1111-1111-1111-111111111132', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Pedro Costa', 'pedro@email.com', '(11) 77777-7777'),
('11111111-1111-1111-1111-111111111133', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ana Oliveira', 'ana.oliveira@email.com', '(11) 66666-6666'),
('11111111-1111-1111-1111-111111111134', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Carlos Lima', 'carlos.lima@email.com', '(11) 55555-5555');

-- Criar membros da equipe (inserir primeiro para existirem antes das vendas)
INSERT INTO team_members (id, store_id, full_name, email, phone, role, hire_date, status) VALUES
('11111111-1111-1111-1111-111111111140', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ana Silva', 'ana.silva@email.com', '(11) 99999-1111', 'Vendedora', '2024-01-15', 'Ativo'),
('11111111-1111-1111-1111-111111111141', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Carlos Santos', 'carlos.santos@email.com', '(11) 99999-2222', 'Gerente de Vendas', '2023-06-01', 'Ativo'),
('11111111-1111-1111-1111-111111111142', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Beatriz Costa', 'beatriz.costa@email.com', '(11) 99999-3333', 'Vendedora', '2024-03-20', 'Férias'),
('11111111-1111-1111-1111-111111111143', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Roberto Lima', 'roberto.lima@email.com', '(11) 99999-4444', 'Vendedor', '2023-11-10', 'Ativo'),
('11111111-1111-1111-1111-111111111144', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Fernanda Oliveira', 'fernanda.oliveira@email.com', '(11) 99999-5555', 'Supervisora', '2023-08-05', 'Ativo');


-- Criar vendas de exemplo (com team_member_id)
INSERT INTO sales (id, store_id, team_member_id, total, payment_method, status, created_at) VALUES
-- Outubro 2024
('11111111-1111-1111-1111-111111111200', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 119.80, 'Cartão de Crédito', 'Concluída', '2024-10-01 09:15:00'),
('11111111-1111-1111-1111-111111111201', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 29.90, 'PIX', 'Concluída', '2024-10-01 10:30:00'),
('11111111-1111-1111-1111-111111111202', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 159.90, 'Dinheiro', 'Concluída', '2024-10-01 14:20:00'),
('11111111-1111-1111-1111-111111111203', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 75.50, 'Cartão de Débito', 'Concluída', '2024-10-02 11:45:00'),
('11111111-1111-1111-1111-111111111204', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 220.00, 'PIX', 'Concluída', '2024-10-02 16:10:00'),
('11111111-1111-1111-1111-111111111205', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111142', 45.90, 'Dinheiro', 'Concluída', '2024-10-03 08:30:00'),
('11111111-1111-1111-1111-111111111206', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 89.90, 'Cartão de Crédito', 'Concluída', '2024-10-03 13:15:00'),
('11111111-1111-1111-1111-111111111207', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 134.70, 'PIX', 'Concluída', '2024-10-04 09:45:00'),
('11111111-1111-1111-1111-111111111208', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 67.80, 'Cartão de Débito', 'Concluída', '2024-10-04 15:20:00'),
('11111111-1111-1111-1111-111111111209', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 199.90, 'Cartão de Crédito', 'Concluída', '2024-10-05 10:10:00'),
('11111111-1111-1111-1111-111111111210', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 55.40, 'PIX', 'Concluída', '2024-10-05 14:30:00'),
('11111111-1111-1111-1111-111111111211', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 178.50, 'Dinheiro', 'Concluída', '2024-10-06 11:25:00'),
('11111111-1111-1111-1111-111111111212', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 92.30, 'Cartão de Débito', 'Concluída', '2024-10-07 09:50:00'),
('11111111-1111-1111-1111-111111111213', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 145.60, 'PIX', 'Concluída', '2024-10-07 16:40:00'),
('11111111-1111-1111-1111-111111111214', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111142', 78.90, 'Cartão de Crédito', 'Concluída', '2024-10-08 08:15:00'),
('11111111-1111-1111-1111-111111111215', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 234.50, 'Dinheiro', 'Concluída', '2024-10-08 13:55:00'),
('11111111-1111-1111-1111-111111111216', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 167.80, 'PIX', 'Concluída', '2024-10-09 10:35:00'),
('11111111-1111-1111-1111-111111111217', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 89.90, 'Cartão de Débito', 'Concluída', '2024-10-09 15:10:00'),
('11111111-1111-1111-1111-111111111218', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 123.40, 'Cartão de Crédito', 'Concluída', '2024-10-10 09:20:00'),
('11111111-1111-1111-1111-111111111219', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 198.70, 'PIX', 'Concluída', '2024-10-10 14:45:00'),
('11111111-1111-1111-1111-111111111220', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 67.50, 'Dinheiro', 'Concluída', '2024-10-11 11:30:00'),
('11111111-1111-1111-1111-111111111221', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 156.80, 'Cartão de Crédito', 'Concluída', '2024-10-11 16:15:00'),
('11111111-1111-1111-1111-111111111222', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111142', 43.20, 'PIX', 'Concluída', '2024-10-12 08:40:00'),
('11111111-1111-1111-1111-111111111223', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 289.90, 'Cartão de Débito', 'Concluída', '2024-10-12 13:25:00'),
('11111111-1111-1111-1111-111111111224', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 87.60, 'Dinheiro', 'Concluída', '2024-10-13 09:55:00'),
('11111111-1111-1111-1111-111111111225', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 178.30, 'Cartão de Crédito', 'Concluída', '2024-10-13 15:30:00'),
('11111111-1111-1111-1111-111111111226', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 134.50, 'PIX', 'Concluída', '2024-10-14 10:20:00'),
('11111111-1111-1111-1111-111111111227', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 76.90, 'Cartão de Débito', 'Concluída', '2024-10-14 14:50:00'),
('11111111-1111-1111-1111-111111111228', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 203.40, 'Dinheiro', 'Concluída', '2024-10-15 09:10:00'),
('11111111-1111-1111-1111-111111111229', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111142', 98.70, 'Cartão de Crédito', 'Concluída', '2024-10-15 13:40:00'),
-- Algumas vendas pendentes/canceladas
('11111111-1111-1111-1111-111111111230', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 145.60, 'PIX', 'Pendente', '2024-10-15 16:00:00'),
('11111111-1111-1111-1111-111111111231', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111140', 67.80, 'Cartão de Crédito', 'Cancelada', '2024-10-15 17:30:00'),
('11111111-1111-1111-1111-111111111232', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111144', 189.90, 'Dinheiro', 'Pendente', '2024-10-15 18:15:00'),
('11111111-1111-1111-1111-111111111233', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111141', 234.50, 'PIX', 'Concluída', '2024-10-15 19:20:00'),
('11111111-1111-1111-1111-111111111234', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', '11111111-1111-1111-1111-111111111143', 156.30, 'Cartão de Débito', 'Concluída', '2024-10-15 20:10:00');
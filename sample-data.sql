-- ========================================
-- COMPLETE DATABASE RESET & INITIALIZATION
-- Wipes all data and starts fresh
-- ========================================

-- ========================================
-- STEP 1: DROP ALL DATA (Reverse order of dependencies)
-- ========================================

DELETE FROM sales;
DELETE FROM product_variations;
DELETE FROM product_column_options;
DELETE FROM product_columns;
DELETE FROM product_attribute_options;
DELETE FROM product_attributes;
DELETE FROM team_members;
DELETE FROM products;
DELETE FROM customers;

-- Note: Do NOT delete stores table - it's assumed to exist from initial setup

-- ========================================
-- STEP 2: CREATE TABLES (if they don't exist)
-- ========================================

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

CREATE TABLE IF NOT EXISTS product_attribute_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, attribute_id, value)
);

CREATE TABLE IF NOT EXISTS product_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  label TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0,
  column_type TEXT DEFAULT 'text',
  width TEXT DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, field_name)
);

CREATE TABLE IF NOT EXISTS product_column_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES product_columns(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: ADD MISSING COLUMNS TO PRODUCTS
-- ========================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'codigo') THEN
        ALTER TABLE products ADD COLUMN codigo TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'marca') THEN
        ALTER TABLE products ADD COLUMN marca TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'categoria') THEN
        ALTER TABLE products ADD COLUMN categoria TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'subcategoria') THEN
        ALTER TABLE products ADD COLUMN subcategoria TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'grupo') THEN
        ALTER TABLE products ADD COLUMN grupo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'subgrupo') THEN
        ALTER TABLE products ADD COLUMN subgrupo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'departamento') THEN
        ALTER TABLE products ADD COLUMN departamento TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'secao') THEN
        ALTER TABLE products ADD COLUMN secao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'estacao') THEN
        ALTER TABLE products ADD COLUMN estacao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colecao') THEN
        ALTER TABLE products ADD COLUMN colecao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'descricao') THEN
        ALTER TABLE products ADD COLUMN descricao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'observacao') THEN
        ALTER TABLE products ADD COLUMN observacao TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fabricante') THEN
        ALTER TABLE products ADD COLUMN fabricante TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'fornecedor') THEN
        ALTER TABLE products ADD COLUMN fornecedor TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ncm') THEN
        ALTER TABLE products ADD COLUMN ncm TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cest') THEN
        ALTER TABLE products ADD COLUMN cest TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custo') THEN
        ALTER TABLE products ADD COLUMN custo NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'preco1') THEN
        ALTER TABLE products ADD COLUMN preco1 NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'preco2') THEN
        ALTER TABLE products ADD COLUMN preco2 NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'preco3') THEN
        ALTER TABLE products ADD COLUMN preco3 NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add team_member_id to sales if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'team_member_id') THEN
        ALTER TABLE sales ADD COLUMN team_member_id UUID REFERENCES team_members(id);
    END IF;
END $$;

-- ========================================
-- STEP 4: INSERT FRESH DATA
-- ========================================

-- Customers (7 customers)
INSERT INTO customers (id, store_id, full_name, email, phone) VALUES
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a110', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'João Silva', 'joao.silva@email.com', '(11) 99999-9999'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a111', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Maria Santos', 'maria.santos@email.com', '(11) 99999-8888'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a112', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Pedro Costa', 'pedro.costa@email.com', '(11) 99999-7777'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a113', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ana Oliveira', 'ana.oliveira@email.com', '(11) 99999-6666'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a114', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Carlos Lima', 'carlos.lima@email.com', '(11) 99999-5555'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a115', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Patricia Gomes', 'patricia.gomes@email.com', '(11) 99999-4444'),
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a116', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ricardo Sousa', 'ricardo.sousa@email.com', '(11) 99999-3333');

-- Team Members (5 team members)
INSERT INTO team_members (id, store_id, full_name, email, phone, role, hire_date, status) VALUES
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ana Silva', 'ana.silva@stg.com', '(11) 99999-1111', 'Vendedora', '2024-01-15', 'Ativo'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Carlos Santos', 'carlos.santos@stg.com', '(11) 99999-2222', 'Gerente de Vendas', '2023-06-01', 'Ativo'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b212', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Beatriz Costa', 'beatriz.costa@stg.com', '(11) 99999-3333', 'Vendedora', '2024-03-20', 'Férias'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Roberto Lima', 'roberto.lima@stg.com', '(11) 99999-4444', 'Vendedor', '2023-11-10', 'Ativo'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Fernanda Oliveira', 'fernanda.oliveira@stg.com', '(11) 99999-5555', 'Supervisora', '2023-08-05', 'Ativo');

-- Products (20 detailed products)
INSERT INTO products (id, store_id, codigo, name, marca, categoria, subcategoria, grupo, subgrupo, departamento, secao, estacao, colecao, descricao, fabricante, fornecedor, ncm, cest, custo, preco1, preco2, preco3, stock, sku, price) VALUES
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-001', 'Camiseta Básica Masculina', 'StyledUp', 'Vestuário', 'Camisetas', 'Camisetas', 'Básicas', 'Moda Masculina', 'Tops', 'Verão', '2024 Básico', 'Camiseta 100% algodão básica, confortável', 'Têxti Brasil', 'Fornecedor A', '6109100090', '0500800', 12.50, 29.90, 25.90, 22.90, 150, 'CAM-001', 29.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c311', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-002', 'Camiseta Gráfica Premium', 'StyledUp', 'Vestuário', 'Camisetas', 'Camisetas', 'Estampadas', 'Moda Masculina', 'Tops', 'Verão', '2024 Premium', 'Camiseta com estampa exclusiva em alta resolução', 'Têxti Brasil', 'Fornecedor A', '6109100090', '0500800', 15.80, 45.90, 39.90, 34.90, 85, 'CAM-002', 45.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c312', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAL-001', 'Calça Jeans Skinny', 'JennyBlue', 'Vestuário', 'Calças', 'Calças', 'Jeans', 'Moda Feminina', 'Bottoms', 'Outono', '2024 Tendência', 'Calça jeans skinny cintura alta', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 35.00, 89.90, 79.90, 69.90, 120, 'CAL-001', 89.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c313', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAL-002', 'Calça Jeans Flare', 'JennyBlue', 'Vestuário', 'Calças', 'Calças', 'Jeans', 'Moda Feminina', 'Bottoms', 'Primavera', '2024 Retrô', 'Calça jeans flare com acabamento desfiado', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 38.00, 99.90, 89.90, 79.90, 95, 'CAL-002', 99.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c314', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'VES-001', 'Vestido Casual Midi', 'FashionLine', 'Vestuário', 'Vestidos', 'Vestidos', 'Casual', 'Moda Feminina', 'Dresses', 'Verão', '2024 Casual', 'Vestido midi em algodão puro com bolsos', 'Têxti Brasil', 'Fornecedor C', '6209300090', '0500800', 32.00, 79.90, 69.90, 59.90, 65, 'VES-001', 79.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c315', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'VES-002', 'Vestido Social Festa', 'Elegância', 'Vestuário', 'Vestidos', 'Vestidos', 'Social', 'Moda Feminina', 'Dresses', 'Inverno', '2024 Festivo', 'Vestido social em crepe preto com detalhes', 'Têxti Brasil', 'Fornecedor C', '6209300090', '0500800', 55.00, 149.90, 129.90, 109.90, 40, 'VES-002', 149.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c316', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-003', 'Camisa Social Branca', 'Professional', 'Vestuário', 'Camisas', 'Camisas', 'Social', 'Moda Masculina', 'Tops', 'Inverno', '2024 Corporate', 'Camisa social 100% algodão branca premium', 'Têxti Brasil', 'Fornecedor A', '6105200090', '0500800', 28.00, 69.90, 59.90, 49.90, 78, 'CAM-003', 69.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c317', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-004', 'Camisa Casual Xadrez', 'Casual Wear', 'Vestuário', 'Camisas', 'Camisas', 'Casual', 'Moda Masculina', 'Tops', 'Outono', '2024 Casual', 'Camisa xadrez em algodão com manga comprida', 'Têxti Brasil', 'Fornecedor D', '6105200090', '0500800', 22.00, 55.90, 49.90, 44.90, 92, 'CAM-004', 55.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c318', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'SHO-001', 'Shorts Jeans Curto', 'JennyBlue', 'Vestuário', 'Shorts', 'Shorts', 'Jeans', 'Moda Feminina', 'Bottoms', 'Verão', '2024 Summer', 'Shorts jeans corte curto desfiado', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 18.00, 59.90, 49.90, 42.90, 110, 'SHO-001', 59.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c319', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'SHO-002', 'Shorts Cargo Masculino', 'Adventure', 'Vestuário', 'Shorts', 'Shorts', 'Cargo', 'Moda Masculina', 'Bottoms', 'Verão', '2024 Action', 'Shorts cargo com múltiplos bolsos', 'Têxti Brasil', 'Fornecedor E', '6203301090', '0500800', 24.00, 74.90, 64.90, 54.90, 88, 'SHO-002', 74.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c320', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'JAQ-001', 'Jaqueta Jeans Masculina', 'DenimClass', 'Vestuário', 'Jaquetas', 'Jaquetas', 'Jeans', 'Moda Masculina', 'Outerwear', 'Inverno', '2024 Clássico', 'Jaqueta jeans azul royal com bolsos', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 45.00, 129.90, 109.90, 94.90, 55, 'JAQ-001', 129.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c321', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'JAQ-002', 'Jaqueta Bomber', 'Modern Style', 'Vestuário', 'Jaquetas', 'Jaquetas', 'Bomber', 'Moda Unissex', 'Outerwear', 'Inverno', '2024 Urban', 'Jaqueta bomber em nylon com forro', 'Têxti Brasil', 'Fornecedor F', '6101904090', '0500800', 52.00, 149.90, 129.90, 114.90, 42, 'JAQ-002', 149.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'TEN-001', 'Tênis Esportivo Branco', 'AthleticGear', 'Calçados', 'Tênis', 'Tênis', 'Esportivo', 'Esportes', 'Calçados Esporte', 'Verão', '2024 Sport', 'Tênis branco com tecnologia de conforto', 'Calçados Brasil', 'Fornecedor G', '6402991090', '0500800', 65.00, 159.90, 139.90, 119.90, 98, 'TEN-001', 159.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c323', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'TEN-002', 'Tênis Running Premium', 'SpeedX', 'Calçados', 'Tênis', 'Tênis', 'Running', 'Esportes', 'Calçados Esporte', 'Verão', '2024 Performance', 'Tênis running com amortecimento avançado', 'Calçados Brasil', 'Fornecedor G', '6402991090', '0500800', 85.00, 199.90, 179.90, 159.90, 65, 'TEN-002', 199.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c324', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'SAN-001', 'Sandália Feminina Conforto', 'ComfortWalk', 'Calçados', 'Sandálias', 'Sandálias', 'Conforto', 'Moda Feminina', 'Calçados Casual', 'Verão', '2024 Comfort', 'Sandália com palmilha anatômica', 'Calçados Brasil', 'Fornecedor H', '6402202090', '0500800', 35.00, 89.90, 79.90, 69.90, 125, 'SAN-001', 89.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c325', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'BOL-001', 'Bolsa de Couro Genuíno', 'LeatherLux', 'Acessórios', 'Bolsas', 'Bolsas', 'Couro', 'Moda Feminina', 'Acessórios', 'Inverno', '2024 Luxe', 'Bolsa em couro genuíno caramelo', 'Malas Brasil', 'Fornecedor I', '4202112090', '0500800', 85.00, 199.90, 179.90, 159.90, 35, 'BOL-001', 199.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c326', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'REL-001', 'Relógio Digital Esporte', 'TimeX', 'Acessórios', 'Relógios', 'Relógios', 'Digital', 'Acessórios Unissex', 'Acessórios', 'Verão', '2024 Tech', 'Relógio digital com cronômetro e alarme', 'Relógios Import', 'Fornecedor J', '9104001090', '0500800', 120.00, 299.90, 269.90, 239.90, 48, 'REL-001', 299.90),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c327', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'OCU-001', 'Óculos de Sol Aviador', 'VisionPro', 'Acessórios', 'Óculos', 'Óculos', 'Sol', 'Acessórios Unissex', 'Acessórios', 'Verão', '2024 Trend', 'Óculos aviador com proteção UV', 'Óptica Brasil', 'Fornecedor K', '9007001090', '0500800', 55.00, 149.90, 129.90, 109.90, 72, 'OCU-001', 149.90);

-- Product Attributes (Variations: Tamanho and Cor)
INSERT INTO product_attributes (id, store_id, name, label, is_variation, is_required, position) VALUES
('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'tamanho', 'Tamanho', true, true, 0),
('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cor', 'Cor', true, true, 1);

-- Product Attribute Options (Sizes)
INSERT INTO product_attribute_options (id, attribute_id, value, position) VALUES
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e510', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'PP', 0),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e511', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'P', 1),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e512', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'M', 2),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e513', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'G', 3),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e514', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'GG', 4),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e515', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'XG', 5);

-- Product Attribute Options (Colors)
INSERT INTO product_attribute_options (id, attribute_id, value, position) VALUES
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e520', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Preto', 0),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e521', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Branco', 1),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e522', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Azul', 2),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e523', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Vermelho', 3),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e524', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Verde', 4),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e525', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Amarelo', 5),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e526', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Cinza', 6),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e527', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Rosa', 7),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e528', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Roxo', 8),
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e529', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Bege', 9);

-- Product Variations (Sample variations for key products)
INSERT INTO product_variations (id, product_id, attribute_id, value) VALUES
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f610', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'P'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f611', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'M'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f612', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'G'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f613', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'GG'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f614', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Preto'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f615', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Branco'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f616', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Azul'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f617', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c310', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Cinza'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f620', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c311', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'P'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f621', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c311', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'M'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f622', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c311', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'G'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f630', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c312', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'P'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f631', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c312', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'M'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f632', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c312', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', 'G'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f633', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c312', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d411', 'Azul'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f640', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '37'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f641', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '38'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f642', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '39'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f643', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '40'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f644', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '41'),
('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f645', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c322', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d410', '42');

-- Sales Data (35 sales with valid UUIDs)
INSERT INTO sales (id, store_id, team_member_id, total, payment_method, status, created_at) VALUES
('00000001-0000-0000-0000-000000000001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 119.80, 'Cartão de Crédito', 'Concluída', '2024-10-01 09:15:00'),
('00000001-0000-0000-0000-000000000002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 45.90, 'PIX', 'Concluída', '2024-10-01 10:30:00'),
('00000001-0000-0000-0000-000000000003', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 159.90, 'Dinheiro', 'Concluída', '2024-10-01 14:20:00'),
('00000001-0000-0000-0000-000000000004', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 89.90, 'Cartão de Débito', 'Concluída', '2024-10-02 11:45:00'),
('00000001-0000-0000-0000-000000000005', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 249.70, 'PIX', 'Concluída', '2024-10-02 16:10:00'),
('00000001-0000-0000-0000-000000000006', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b212', 139.80, 'Dinheiro', 'Concluída', '2024-10-03 08:30:00'),
('00000001-0000-0000-0000-000000000007', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 299.80, 'Cartão de Crédito', 'Concluída', '2024-10-03 13:15:00'),
('00000001-0000-0000-0000-000000000008', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 179.80, 'PIX', 'Concluída', '2024-10-07 09:45:00'),
('00000001-0000-0000-0000-000000000009', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 129.90, 'Cartão de Débito', 'Concluída', '2024-10-07 15:20:00'),
('00000001-0000-0000-0000-000000000010', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 349.80, 'Cartão de Crédito', 'Concluída', '2024-10-08 10:10:00'),
('00000001-0000-0000-0000-000000000011', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 199.80, 'PIX', 'Concluída', '2024-10-08 14:30:00'),
('00000001-0000-0000-0000-000000000012', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 259.80, 'Dinheiro', 'Concluída', '2024-10-09 11:25:00'),
('00000001-0000-0000-0000-000000000013', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 149.90, 'Cartão de Débito', 'Concluída', '2024-10-09 09:50:00'),
('00000001-0000-0000-0000-000000000014', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 379.80, 'PIX', 'Concluída', '2024-10-10 16:40:00'),
('00000001-0000-0000-0000-000000000015', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b212', 89.90, 'Cartão de Crédito', 'Concluída', '2024-10-14 08:15:00'),
('00000001-0000-0000-0000-000000000016', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 299.80, 'Dinheiro', 'Concluída', '2024-10-14 13:55:00'),
('00000001-0000-0000-0000-000000000017', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 229.80, 'PIX', 'Concluída', '2024-10-15 10:35:00'),
('00000001-0000-0000-0000-000000000018', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 159.90, 'Cartão de Débito', 'Concluída', '2024-10-15 15:10:00'),
('00000001-0000-0000-0000-000000000019', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 199.80, 'Cartão de Crédito', 'Concluída', '2024-10-16 09:20:00'),
('00000001-0000-0000-0000-000000000020', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 329.70, 'PIX', 'Concluída', '2024-10-16 14:45:00'),
('00000001-0000-0000-0000-000000000021', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 119.90, 'Dinheiro', 'Concluída', '2024-10-17 11:30:00'),
('00000001-0000-0000-0000-000000000022', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 269.80, 'Cartão de Crédito', 'Concluída', '2024-10-21 16:15:00'),
('00000001-0000-0000-0000-000000000023', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b212', 79.90, 'PIX', 'Concluída', '2024-10-22 08:40:00'),
('00000001-0000-0000-0000-000000000024', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 399.80, 'Cartão de Débito', 'Concluída', '2024-10-22 13:25:00'),
('00000001-0000-0000-0000-000000000025', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 149.80, 'Dinheiro', 'Concluída', '2024-10-23 09:55:00'),
('00000001-0000-0000-0000-000000000026', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 279.70, 'Cartão de Crédito', 'Concluída', '2024-10-23 15:30:00'),
('00000001-0000-0000-0000-000000000027', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 229.80, 'PIX', 'Concluída', '2024-10-24 10:20:00'),
('00000001-0000-0000-0000-000000000028', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 109.90, 'Cartão de Débito', 'Concluída', '2024-10-24 14:50:00'),
('00000001-0000-0000-0000-000000000029', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 319.80, 'PIX', 'Pendente', '2024-10-25 16:00:00'),
('00000001-0000-0000-0000-000000000030', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b210', 99.90, 'Cartão de Crédito', 'Cancelada', '2024-10-25 17:30:00'),
('00000001-0000-0000-0000-000000000031', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b214', 249.80, 'Dinheiro', 'Pendente', '2024-10-26 18:15:00'),
('00000001-0000-0000-0000-000000000032', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b211', 369.70, 'PIX', 'Concluída', '2024-10-26 19:20:00'),
('00000001-0000-0000-0000-000000000033', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b213', 189.90, 'Cartão de Débito', 'Concluída', '2024-10-27 20:10:00');

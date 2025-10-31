-- ========================================
-- COMPLETE DATABASE RESET & INITIALIZATION
-- Wipes all data and starts fresh
-- ========================================

-- ========================================
-- STEP 1: DROP ALL DATA & TABLES (Reverse order of dependencies)
-- ========================================

DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS product_column_options CASCADE;
DROP TABLE IF EXISTS product_columns CASCADE;
DROP TABLE IF EXISTS product_attribute_options CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Note: Do NOT delete stores table - it's assumed to exist from initial setup

-- ========================================
-- STEP 2: CREATE TABLES (if they don't exist)
-- ========================================

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
  attribute_id TEXT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price NUMERIC(10,2),
  stock INTEGER DEFAULT 0,
  codigo TEXT UNIQUE,
  marca TEXT,
  categoria TEXT,
  subcategoria TEXT,
  grupo TEXT,
  subgrupo TEXT,
  departamento TEXT,
  secao TEXT,
  estacao TEXT,
  colecao TEXT,
  descricao TEXT,
  observacao TEXT,
  fabricante TEXT,
  fornecedor TEXT,
  ncm TEXT,
  cest TEXT,
  custo NUMERIC(10,2),
  preco1 NUMERIC(10,2),
  preco2 NUMERIC(10,2),
  preco3 NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_option_id TEXT NOT NULL REFERENCES product_attribute_options(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, attribute_option_id)
);

CREATE TABLE IF NOT EXISTS product_columns (
  id TEXT PRIMARY KEY,
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
  id TEXT PRIMARY KEY,
  column_id TEXT NOT NULL REFERENCES product_columns(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id TEXT REFERENCES customers(id),
  team_member_id TEXT REFERENCES team_members(id),
  total NUMERIC(10,2),
  payment_method TEXT,
  status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 3: INSERT FRESH DATA
-- ========================================

-- Customers (7 customers)
INSERT INTO customers (id, store_id, full_name, email, phone) VALUES
('cust_001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'João Silva', 'joao.silva@email.com', '(11) 99999-9999'),
('cust_002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Maria Santos', 'maria.santos@email.com', '(11) 99999-8888'),
('cust_003', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Pedro Costa', 'pedro.costa@email.com', '(11) 99999-7777'),
('cust_004', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ana Oliveira', 'ana.oliveira@email.com', '(11) 99999-6666'),
('cust_005', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Carlos Lima', 'carlos.lima@email.com', '(11) 99999-5555'),
('cust_006', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Patricia Gomes', 'patricia.gomes@email.com', '(11) 99999-4444'),
('cust_007', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ricardo Sousa', 'ricardo.sousa@email.com', '(11) 99999-3333');

-- Team Members (5 team members)
INSERT INTO team_members (id, store_id, full_name, email, phone, role, hire_date, status) VALUES
('tm_001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Ana Silva', 'ana.silva@stg.com', '(11) 99999-1111', 'Vendedora', '2024-01-15', 'Ativo'),
('tm_002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Carlos Santos', 'carlos.santos@stg.com', '(11) 99999-2222', 'Gerente de Vendas', '2023-06-01', 'Ativo'),
('tm_003', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Beatriz Costa', 'beatriz.costa@stg.com', '(11) 99999-3333', 'Vendedora', '2024-03-20', 'Férias'),
('tm_004', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Roberto Lima', 'roberto.lima@stg.com', '(11) 99999-4444', 'Vendedor', '2023-11-10', 'Ativo'),
('tm_005', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'Fernanda Oliveira', 'fernanda.oliveira@stg.com', '(11) 99999-5555', 'Supervisora', '2023-08-05', 'Ativo');

-- Product Columns Configuration (10 visible columns for products table)
INSERT INTO product_columns (id, store_id, field_name, label, is_visible, is_editable, position, column_type, width) VALUES
('pcol_001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'codigo', 'Código', true, true, 0, 'text', '80px'),
('pcol_002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'name', 'Nome', true, true, 1, 'text', '200px'),
('pcol_003', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'marca', 'Marca', true, true, 2, 'text', '120px'),
('pcol_004', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'categoria', 'Categoria', true, true, 3, 'text', '120px'),
('pcol_005', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'preco1', 'Preço', true, true, 4, 'currency', '100px'),
('pcol_006', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'custo', 'Custo', true, true, 5, 'currency', '100px'),
('pcol_007', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'stock', 'Estoque', true, true, 6, 'number', '80px'),
('pcol_008', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'sku', 'SKU', true, true, 7, 'text', '100px'),
('pcol_009', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'descricao', 'Descrição', true, true, 8, 'textarea', '200px'),
('pcol_010', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'created_at', 'Criado em', true, false, 9, 'date', '120px');

-- Products (18 detailed products)
INSERT INTO products (id, store_id, codigo, name, marca, categoria, subcategoria, grupo, subgrupo, departamento, secao, estacao, colecao, descricao, fabricante, fornecedor, ncm, cest, custo, preco1, preco2, preco3, stock, sku, price) VALUES
('prod_001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-001', 'Camiseta Básica Masculina', 'StyledUp', 'Vestuário', 'Camisetas', 'Camisetas', 'Básicas', 'Moda Masculina', 'Tops', 'Verão', '2024 Básico', 'Camiseta 100% algodão básica, confortável', 'Têxti Brasil', 'Fornecedor A', '6109100090', '0500800', 12.50, 29.90, 25.90, 22.90, 150, 'CAM-001', 29.90),
('prod_002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-002', 'Camiseta Gráfica Premium', 'StyledUp', 'Vestuário', 'Camisetas', 'Camisetas', 'Estampadas', 'Moda Masculina', 'Tops', 'Verão', '2024 Premium', 'Camiseta com estampa exclusiva em alta resolução', 'Têxti Brasil', 'Fornecedor A', '6109100090', '0500800', 15.80, 45.90, 39.90, 34.90, 85, 'CAM-002', 45.90),
('prod_003', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAL-001', 'Calça Jeans Skinny', 'JennyBlue', 'Vestuário', 'Calças', 'Calças', 'Jeans', 'Moda Feminina', 'Bottoms', 'Outono', '2024 Tendência', 'Calça jeans skinny cintura alta', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 35.00, 89.90, 79.90, 69.90, 120, 'CAL-001', 89.90),
('prod_004', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAL-002', 'Calça Jeans Flare', 'JennyBlue', 'Vestuário', 'Calças', 'Calças', 'Jeans', 'Moda Feminina', 'Bottoms', 'Primavera', '2024 Retrô', 'Calça jeans flare com acabamento desfiado', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 38.00, 99.90, 89.90, 79.90, 95, 'CAL-002', 99.90),
('prod_005', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'VES-001', 'Vestido Casual Midi', 'FashionLine', 'Vestuário', 'Vestidos', 'Vestidos', 'Casual', 'Moda Feminina', 'Dresses', 'Verão', '2024 Casual', 'Vestido midi em algodão puro com bolsos', 'Têxti Brasil', 'Fornecedor C', '6209300090', '0500800', 32.00, 79.90, 69.90, 59.90, 65, 'VES-001', 79.90),
('prod_006', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'VES-002', 'Vestido Social Festa', 'Elegância', 'Vestuário', 'Vestidos', 'Vestidos', 'Social', 'Moda Feminina', 'Dresses', 'Inverno', '2024 Festivo', 'Vestido social em crepe preto com detalhes', 'Têxti Brasil', 'Fornecedor C', '6209300090', '0500800', 55.00, 149.90, 129.90, 109.90, 40, 'VES-002', 149.90),
('prod_007', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-003', 'Camisa Social Branca', 'Professional', 'Vestuário', 'Camisas', 'Camisas', 'Social', 'Moda Masculina', 'Tops', 'Inverno', '2024 Corporate', 'Camisa social 100% algodão branca premium', 'Têxti Brasil', 'Fornecedor A', '6105200090', '0500800', 28.00, 69.90, 59.90, 49.90, 78, 'CAM-003', 69.90),
('prod_008', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'CAM-004', 'Camisa Casual Xadrez', 'Casual Wear', 'Vestuário', 'Camisas', 'Camisas', 'Casual', 'Moda Masculina', 'Tops', 'Outono', '2024 Casual', 'Camisa xadrez em algodão com manga comprida', 'Têxti Brasil', 'Fornecedor D', '6105200090', '0500800', 22.00, 55.90, 49.90, 44.90, 92, 'CAM-004', 55.90),
('prod_009', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'SHO-001', 'Shorts Jeans Curto', 'JennyBlue', 'Vestuário', 'Shorts', 'Shorts', 'Jeans', 'Moda Feminina', 'Bottoms', 'Verão', '2024 Summer', 'Shorts jeans corte curto desfiado', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 18.00, 59.90, 49.90, 42.90, 110, 'SHO-001', 59.90),
('prod_010', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'SHO-002', 'Shorts Cargo Masculino', 'Adventure', 'Vestuário', 'Shorts', 'Shorts', 'Cargo', 'Moda Masculina', 'Bottoms', 'Verão', '2024 Action', 'Shorts cargo com múltiplos bolsos', 'Têxti Brasil', 'Fornecedor E', '6203301090', '0500800', 24.00, 74.90, 64.90, 54.90, 88, 'SHO-002', 74.90),
('prod_011', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'JAQ-001', 'Jaqueta Jeans Masculina', 'DenimClass', 'Vestuário', 'Jaquetas', 'Jaquetas', 'Jeans', 'Moda Masculina', 'Outerwear', 'Inverno', '2024 Clássico', 'Jaqueta jeans azul royal com bolsos', 'Têxti Brasil', 'Fornecedor B', '6204620090', '0500800', 45.00, 129.90, 109.90, 94.90, 55, 'JAQ-001', 129.90),
('prod_012', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'JAQ-002', 'Jaqueta Bomber', 'Modern Style', 'Vestuário', 'Jaquetas', 'Jaquetas', 'Bomber', 'Moda Unissex', 'Outerwear', 'Inverno', '2024 Urban', 'Jaqueta bomber em nylon com forro', 'Têxti Brasil', 'Fornecedor F', '6101904090', '0500800', 52.00, 149.90, 129.90, 114.90, 42, 'JAQ-002', 149.90),
('prod_013', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'TEN-001', 'Tênis Esportivo Branco', 'AthleticGear', 'Calçados', 'Tênis', 'Tênis', 'Esportivo', 'Esportes', 'Calçados Esporte', 'Verão', '2024 Sport', 'Tênis branco com tecnologia de conforto', 'Calçados Brasil', 'Fornecedor G', '6402991090', '0500800', 65.00, 159.90, 139.90, 119.90, 98, 'TEN-001', 159.90),
('prod_014', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'TEN-002', 'Tênis Running Premium', 'SpeedX', 'Calçados', 'Tênis', 'Tênis', 'Running', 'Esportes', 'Calçados Esporte', 'Verão', '2024 Performance', 'Tênis running com amortecimento avançado', 'Calçados Brasil', 'Fornecedor G', '6402991090', '0500800', 85.00, 199.90, 179.90, 159.90, 65, 'TEN-002', 199.90),
('prod_015', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'SAN-001', 'Sandália Feminina Conforto', 'ComfortWalk', 'Calçados', 'Sandálias', 'Sandálias', 'Conforto', 'Moda Feminina', 'Calçados Casual', 'Verão', '2024 Comfort', 'Sandália com palmilha anatômica', 'Calçados Brasil', 'Fornecedor H', '6402202090', '0500800', 35.00, 89.90, 79.90, 69.90, 125, 'SAN-001', 89.90),
('prod_016', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'BOL-001', 'Bolsa de Couro Genuíno', 'LeatherLux', 'Acessórios', 'Bolsas', 'Bolsas', 'Couro', 'Moda Feminina', 'Acessórios', 'Inverno', '2024 Luxe', 'Bolsa em couro genuíno caramelo', 'Malas Brasil', 'Fornecedor I', '4202112090', '0500800', 85.00, 199.90, 179.90, 159.90, 35, 'BOL-001', 199.90),
('prod_017', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'REL-001', 'Relógio Digital Esporte', 'TimeX', 'Acessórios', 'Relógios', 'Relógios', 'Digital', 'Acessórios Unissex', 'Acessórios', 'Verão', '2024 Tech', 'Relógio digital com cronômetro e alarme', 'Relógios Import', 'Fornecedor J', '9104001090', '0500800', 120.00, 299.90, 269.90, 239.90, 48, 'REL-001', 299.90),
('prod_018', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'OCU-001', 'Óculos de Sol Aviador', 'VisionPro', 'Acessórios', 'Óculos', 'Óculos', 'Sol', 'Acessórios Unissex', 'Acessórios', 'Verão', '2024 Trend', 'Óculos aviador com proteção UV', 'Óptica Brasil', 'Fornecedor K', '9007001090', '0500800', 55.00, 149.90, 129.90, 109.90, 72, 'OCU-001', 149.90);

-- Product Attributes (Variations: Tamanho and Cor)
INSERT INTO product_attributes (id, store_id, name, label, is_variation, is_required, position) VALUES
('pattr_001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'tamanho', 'Tamanho', true, true, 0),
('pattr_002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cor', 'Cor', true, true, 1);

-- Product Attribute Options (Sizes)
INSERT INTO product_attribute_options (id, attribute_id, value, position) VALUES
('popt_001', 'pattr_001', 'PP', 0),
('popt_002', 'pattr_001', 'P', 1),
('popt_003', 'pattr_001', 'M', 2),
('popt_004', 'pattr_001', 'G', 3),
('popt_005', 'pattr_001', 'GG', 4),
('popt_006', 'pattr_001', 'XG', 5);

-- Product Attribute Options (Colors)
INSERT INTO product_attribute_options (id, attribute_id, value, position) VALUES
('popt_007', 'pattr_002', 'Preto', 0),
('popt_008', 'pattr_002', 'Branco', 1),
('popt_009', 'pattr_002', 'Azul', 2),
('popt_010', 'pattr_002', 'Vermelho', 3),
('popt_011', 'pattr_002', 'Verde', 4),
('popt_012', 'pattr_002', 'Amarelo', 5),
('popt_013', 'pattr_002', 'Cinza', 6),
('popt_014', 'pattr_002', 'Rosa', 7),
('popt_015', 'pattr_002', 'Roxo', 8),
('popt_016', 'pattr_002', 'Bege', 9);

-- Product Variations (Sample variations for key products)
INSERT INTO product_variations (id, product_id, attribute_option_id) VALUES
-- Product 1 (CAM-001) sizes: P, M, G, GG
('pvar_001', 'prod_001', 'popt_002'),
('pvar_002', 'prod_001', 'popt_003'),
('pvar_003', 'prod_001', 'popt_004'),
('pvar_004', 'prod_001', 'popt_005'),
-- Product 1 (CAM-001) colors: Preto, Branco, Azul, Cinza
('pvar_005', 'prod_001', 'popt_007'),
('pvar_006', 'prod_001', 'popt_008'),
('pvar_007', 'prod_001', 'popt_009'),
('pvar_008', 'prod_001', 'popt_013'),
-- Product 2 (CAM-002) sizes: P, M, G
('pvar_009', 'prod_002', 'popt_002'),
('pvar_010', 'prod_002', 'popt_003'),
('pvar_011', 'prod_002', 'popt_004'),
-- Product 3 (CAL-001) sizes: P, M, G
('pvar_012', 'prod_003', 'popt_002'),
('pvar_013', 'prod_003', 'popt_003'),
('pvar_014', 'prod_003', 'popt_004'),
-- Product 3 (CAL-001) color: Azul
('pvar_015', 'prod_003', 'popt_009');

-- Sales Data (33 sales with valid IDs)
INSERT INTO sales (id, store_id, customer_id, team_member_id, total, payment_method, status, created_at) VALUES
('sale_001', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_001', 'tm_001', 119.80, 'Cartão de Crédito', 'Concluída', '2024-10-01 09:15:00'),
('sale_002', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_002', 'tm_002', 45.90, 'PIX', 'Concluída', '2024-10-01 10:30:00'),
('sale_003', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_003', 'tm_003', 159.90, 'Dinheiro', 'Concluída', '2024-10-01 14:20:00'),
('sale_004', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_004', 'tm_001', 89.90, 'Cartão de Débito', 'Concluída', '2024-10-02 11:45:00'),
('sale_005', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_005', 'tm_004', 249.70, 'PIX', 'Concluída', '2024-10-02 16:10:00'),
('sale_006', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_006', 'tm_005', 139.80, 'Dinheiro', 'Concluída', '2024-10-03 08:30:00'),
('sale_007', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_007', 'tm_003', 299.80, 'Cartão de Crédito', 'Concluída', '2024-10-03 13:15:00'),
('sale_008', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_001', 'tm_002', 179.80, 'PIX', 'Concluída', '2024-10-07 09:45:00'),
('sale_009', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_002', 'tm_004', 129.90, 'Cartão de Débito', 'Concluída', '2024-10-07 15:20:00'),
('sale_010', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_003', 'tm_001', 349.80, 'Cartão de Crédito', 'Concluída', '2024-10-08 10:10:00'),
('sale_011', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_004', 'tm_002', 199.80, 'PIX', 'Concluída', '2024-10-08 14:30:00'),
('sale_012', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_005', 'tm_003', 259.80, 'Dinheiro', 'Concluída', '2024-10-09 11:25:00'),
('sale_013', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_006', 'tm_001', 149.90, 'Cartão de Débito', 'Concluída', '2024-10-09 09:50:00'),
('sale_014', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_007', 'tm_004', 379.80, 'PIX', 'Concluída', '2024-10-10 16:40:00'),
('sale_015', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_001', 'tm_005', 89.90, 'Cartão de Crédito', 'Concluída', '2024-10-14 08:15:00'),
('sale_016', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_002', 'tm_003', 299.80, 'Dinheiro', 'Concluída', '2024-10-14 13:55:00'),
('sale_017', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_003', 'tm_002', 229.80, 'PIX', 'Concluída', '2024-10-15 10:35:00'),
('sale_018', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_004', 'tm_001', 159.90, 'Cartão de Débito', 'Concluída', '2024-10-15 15:10:00'),
('sale_019', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_005', 'tm_004', 199.80, 'Cartão de Crédito', 'Concluída', '2024-10-16 09:20:00'),
('sale_020', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_006', 'tm_002', 329.70, 'PIX', 'Concluída', '2024-10-16 14:45:00'),
('sale_021', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_007', 'tm_003', 119.90, 'Dinheiro', 'Concluída', '2024-10-17 11:30:00'),
('sale_022', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_001', 'tm_001', 269.80, 'Cartão de Crédito', 'Concluída', '2024-10-21 16:15:00'),
('sale_023', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_002', 'tm_005', 79.90, 'PIX', 'Concluída', '2024-10-22 08:40:00'),
('sale_024', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_003', 'tm_004', 399.80, 'Cartão de Débito', 'Concluída', '2024-10-22 13:25:00'),
('sale_025', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_004', 'tm_002', 149.80, 'Dinheiro', 'Concluída', '2024-10-23 09:55:00'),
('sale_026', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_005', 'tm_003', 279.70, 'Cartão de Crédito', 'Concluída', '2024-10-23 15:30:00'),
('sale_027', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_006', 'tm_001', 229.80, 'PIX', 'Concluída', '2024-10-24 10:20:00'),
('sale_028', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_007', 'tm_002', 109.90, 'Cartão de Débito', 'Concluída', '2024-10-24 14:50:00'),
('sale_029', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_001', 'tm_004', 319.80, 'PIX', 'Pendente', '2024-10-25 16:00:00'),
('sale_030', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_002', 'tm_001', 99.90, 'Cartão de Crédito', 'Cancelada', '2024-10-25 17:30:00'),
('sale_031', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_003', 'tm_004', 249.80, 'Dinheiro', 'Pendente', '2024-10-26 18:15:00'),
('sale_032', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_004', 'tm_002', 369.70, 'PIX', 'Concluída', '2024-10-26 19:20:00'),
('sale_033', '33b61ae2-175d-4dc8-991e-2c4453feb0c5', 'cust_005', 'tm_003', 189.90, 'Cartão de Débito', 'Concluída', '2024-10-27 20:10:00');

-- Sale Items (one item per sale for simplicity)
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, subtotal) VALUES
('sitem_001', 'sale_001', 'prod_001', 4, 29.90, 119.80),
('sitem_002', 'sale_002', 'prod_002', 1, 45.90, 45.90),
('sitem_003', 'sale_003', 'prod_003', 2, 79.95, 159.90),
('sitem_004', 'sale_004', 'prod_004', 1, 89.90, 89.90),
('sitem_005', 'sale_005', 'prod_005', 3, 83.23, 249.70),
('sitem_006', 'sale_006', 'prod_001', 5, 27.96, 139.80),
('sitem_007', 'sale_007', 'prod_002', 7, 42.83, 299.80),
('sitem_008', 'sale_008', 'prod_003', 2, 89.90, 179.80),
('sitem_009', 'sale_009', 'prod_004', 1, 129.90, 129.90),
('sitem_010', 'sale_010', 'prod_005', 4, 87.45, 349.80),
('sitem_011', 'sale_011', 'prod_006', 1, 199.80, 199.80),
('sitem_012', 'sale_012', 'prod_007', 2, 129.90, 259.80),
('sitem_013', 'sale_013', 'prod_008', 2, 74.95, 149.90),
('sitem_014', 'sale_014', 'prod_009', 3, 126.60, 379.80),
('sitem_015', 'sale_015', 'prod_010', 1, 89.90, 89.90),
('sitem_016', 'sale_016', 'prod_011', 2, 149.90, 299.80),
('sitem_017', 'sale_017', 'prod_012', 2, 114.90, 229.80),
('sitem_018', 'sale_018', 'prod_013', 1, 159.90, 159.90),
('sitem_019', 'sale_019', 'prod_014', 1, 199.80, 199.80),
('sitem_020', 'sale_020', 'prod_015', 2, 164.85, 329.70),
('sitem_021', 'sale_021', 'prod_016', 1, 119.90, 119.90),
('sitem_022', 'sale_022', 'prod_017', 1, 269.80, 269.80),
('sitem_023', 'sale_023', 'prod_018', 1, 79.90, 79.90),
('sitem_024', 'sale_024', 'prod_001', 4, 99.95, 399.80),
('sitem_025', 'sale_025', 'prod_002', 3, 49.93, 149.80),
('sitem_026', 'sale_026', 'prod_003', 3, 93.23, 279.70),
('sitem_027', 'sale_027', 'prod_004', 2, 114.90, 229.80),
('sitem_028', 'sale_028', 'prod_005', 1, 109.90, 109.90),
('sitem_029', 'sale_029', 'prod_006', 1, 319.80, 319.80),
('sitem_030', 'sale_030', 'prod_007', 1, 99.90, 99.90),
('sitem_031', 'sale_031', 'prod_008', 1, 249.80, 249.80),
('sitem_032', 'sale_032', 'prod_009', 2, 184.85, 369.70),
('sitem_033', 'sale_033', 'prod_010', 2, 94.95, 189.90);

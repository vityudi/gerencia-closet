-- Sample data for testing
-- This should be run in your Supabase SQL editor

-- Create sample stores
INSERT INTO stores (id, name, owner_user_id, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Loja Centro', '550e8400-e29b-41d4-a716-446655440000', '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'Loja Shopping', '550e8400-e29b-41d4-a716-446655440000', '{}');

-- Create sample products
INSERT INTO products (id, store_id, name, sku, price, stock) VALUES
('prod-001', '550e8400-e29b-41d4-a716-446655440001', 'Camiseta Básica', 'CAM-001', 29.90, 50),
('prod-002', '550e8400-e29b-41d4-a716-446655440001', 'Calça Jeans', 'CAL-001', 89.90, 25),
('prod-003', '550e8400-e29b-41d4-a716-446655440002', 'Tênis Esportivo', 'TEN-001', 159.90, 15);

-- Create sample customers
INSERT INTO customers (id, store_id, full_name, email, phone) VALUES
('cust-001', '550e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao@email.com', '(11) 99999-9999'),
('cust-002', '550e8400-e29b-41d4-a716-446655440001', 'Maria Santos', 'maria@email.com', '(11) 88888-8888'),
('cust-003', '550e8400-e29b-41d4-a716-446655440002', 'Pedro Costa', 'pedro@email.com', '(11) 77777-7777');

-- Create sample sales
INSERT INTO sales (id, store_id, total, payment_method, status) VALUES
('sale-001', '550e8400-e29b-41d4-a716-446655440001', 119.80, 'Cartão de Crédito', 'Concluída'),
('sale-002', '550e8400-e29b-41d4-a716-446655440001', 29.90, 'PIX', 'Concluída'),
('sale-003', '550e8400-e29b-41d4-a716-446655440002', 159.90, 'Dinheiro', 'Pendente');
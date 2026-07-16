-- ============================================================
-- 027_varchar_pk_to_uuid
-- 001 迁移的 9 张表 VARCHAR(50) PK → UUID，FK 链全量更新
-- ============================================================

-- PART 1: 各主表添加 UUID 列并生成 UUID
ALTER TABLE institutions ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE resources ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE orders ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE authorizations ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE withdrawals ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE banners ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- 用 MD5 生成确定性 UUID，保证多次运行一致
UPDATE institutions SET new_id = md5(id)::uuid;
UPDATE resources SET new_id = md5(id)::uuid;
UPDATE orders SET new_id = md5(id)::uuid;
UPDATE authorizations SET new_id = md5(id)::uuid;
UPDATE withdrawals SET new_id = md5(id)::uuid;
UPDATE banners SET new_id = md5(id)::uuid;

-- PART 2: 引用表添加 UUID FK 列
ALTER TABLE institution_expertise_tags ADD COLUMN institution_id_new UUID;
ALTER TABLE resources ADD COLUMN institution_id_new UUID;
ALTER TABLE resource_tags ADD COLUMN resource_id_new UUID;
ALTER TABLE orders ADD COLUMN resource_id_new UUID;
ALTER TABLE orders ADD COLUMN buyer_id_new UUID;
ALTER TABLE orders ADD COLUMN seller_id_new UUID;
ALTER TABLE authorizations ADD COLUMN order_id_new UUID;
ALTER TABLE authorizations ADD COLUMN buyer_id_new UUID;
ALTER TABLE authorizations ADD COLUMN resource_id_new UUID;
ALTER TABLE withdrawals ADD COLUMN institution_id_new UUID;
ALTER TABLE users ADD COLUMN institution_id_new UUID;

-- 写回 FK 值（用 MD5 保持与 PK 一致）
UPDATE institution_expertise_tags SET institution_id_new = md5(institution_id)::uuid WHERE institution_id IS NOT NULL;
UPDATE resources SET institution_id_new = md5(institution_id)::uuid WHERE institution_id IS NOT NULL;
UPDATE resource_tags SET resource_id_new = md5(resource_id)::uuid WHERE resource_id IS NOT NULL;
UPDATE orders SET resource_id_new = md5(resource_id)::uuid WHERE resource_id IS NOT NULL;
UPDATE orders SET buyer_id_new = md5(buyer_id)::uuid WHERE buyer_id IS NOT NULL;
UPDATE orders SET seller_id_new = md5(seller_id)::uuid WHERE seller_id IS NOT NULL;
UPDATE authorizations SET order_id_new = md5(order_id)::uuid WHERE order_id IS NOT NULL;
UPDATE authorizations SET buyer_id_new = md5(buyer_id)::uuid WHERE buyer_id IS NOT NULL;
UPDATE authorizations SET resource_id_new = md5(resource_id)::uuid WHERE resource_id IS NOT NULL;
UPDATE withdrawals SET institution_id_new = md5(institution_id)::uuid WHERE institution_id IS NOT NULL;
UPDATE users SET institution_id_new = md5(institution_id)::uuid WHERE institution_id IS NOT NULL;

-- PART 3: 删除旧约束，设 NOT NULL
ALTER TABLE institutions ALTER COLUMN new_id SET NOT NULL;
ALTER TABLE resources ALTER COLUMN new_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN new_id SET NOT NULL;
ALTER TABLE authorizations ALTER COLUMN new_id SET NOT NULL;
ALTER TABLE withdrawals ALTER COLUMN new_id SET NOT NULL;
ALTER TABLE banners ALTER COLUMN new_id SET NOT NULL;

-- 确保所有 FK 值已填充(非空)
UPDATE institution_expertise_tags SET institution_id_new = '00000000-0000-0000-0000-000000000000' WHERE institution_id_new IS NULL;
UPDATE resources SET institution_id_new = '00000000-0000-0000-0000-000000000000' WHERE institution_id_new IS NULL;
UPDATE resource_tags SET resource_id_new = '00000000-0000-0000-0000-000000000000' WHERE resource_id_new IS NULL;

-- PART 4: 删除旧 PK，设新 PK
ALTER TABLE institutions DROP CONSTRAINT IF EXISTS institutions_pkey;
ALTER TABLE institutions ADD PRIMARY KEY (new_id);
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_pkey;
ALTER TABLE resources ADD PRIMARY KEY (new_id);
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE orders ADD PRIMARY KEY (new_id);
ALTER TABLE authorizations DROP CONSTRAINT IF EXISTS authorizations_pkey;
ALTER TABLE authorizations ADD PRIMARY KEY (new_id);
ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS withdrawals_pkey;
ALTER TABLE withdrawals ADD PRIMARY KEY (new_id);
ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_pkey;
ALTER TABLE banners ADD PRIMARY KEY (new_id);

-- PART 5: 删除旧 FK，设新 FK
-- institutions.institution_expertise_tags
ALTER TABLE institution_expertise_tags DROP CONSTRAINT IF EXISTS institution_expertise_tags_institution_id_fkey;
ALTER TABLE institution_expertise_tags ADD FOREIGN KEY (institution_id_new) REFERENCES institutions(new_id) ON DELETE CASCADE;

-- resources.institution_id
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_institution_id_fkey;
ALTER TABLE resources ADD FOREIGN KEY (institution_id_new) REFERENCES institutions(new_id) ON DELETE SET NULL;

-- resource_tags.resource_id
ALTER TABLE resource_tags DROP CONSTRAINT IF EXISTS resource_tags_resource_id_fkey;
ALTER TABLE resource_tags ADD FOREIGN KEY (resource_id_new) REFERENCES resources(new_id) ON DELETE CASCADE;

-- orders FKs
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_resource_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_buyer_id_fkey;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_seller_id_fkey;
ALTER TABLE orders ADD FOREIGN KEY (resource_id_new) REFERENCES resources(new_id);
ALTER TABLE orders ADD FOREIGN KEY (buyer_id_new) REFERENCES institutions(new_id);
ALTER TABLE orders ADD FOREIGN KEY (seller_id_new) REFERENCES institutions(new_id);

-- authorizations FKs
ALTER TABLE authorizations DROP CONSTRAINT IF EXISTS authorizations_order_id_fkey;
ALTER TABLE authorizations DROP CONSTRAINT IF EXISTS authorizations_buyer_id_fkey;
ALTER TABLE authorizations DROP CONSTRAINT IF EXISTS authorizations_resource_id_fkey;
ALTER TABLE authorizations ADD FOREIGN KEY (order_id_new) REFERENCES orders(new_id) ON DELETE CASCADE;
ALTER TABLE authorizations ADD FOREIGN KEY (buyer_id_new) REFERENCES institutions(new_id);
ALTER TABLE authorizations ADD FOREIGN KEY (resource_id_new) REFERENCES resources(new_id);

-- withdrawals.institution_id
ALTER TABLE withdrawals DROP CONSTRAINT IF EXISTS withdrawals_institution_id_fkey;
ALTER TABLE withdrawals ADD FOREIGN KEY (institution_id_new) REFERENCES institutions(new_id);

-- users.institution_id
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_institution_id_fkey;
ALTER TABLE users ADD FOREIGN KEY (institution_id_new) REFERENCES institutions(new_id) ON DELETE SET NULL;

-- PART 6: 交换列名
ALTER TABLE institutions DROP COLUMN IF EXISTS id;
ALTER TABLE institutions RENAME COLUMN new_id TO id;
ALTER TABLE resources DROP COLUMN IF EXISTS id;
ALTER TABLE resources RENAME COLUMN new_id TO id;
ALTER TABLE orders DROP COLUMN IF EXISTS id;
ALTER TABLE orders RENAME COLUMN new_id TO id;
ALTER TABLE authorizations DROP COLUMN IF EXISTS id;
ALTER TABLE authorizations RENAME COLUMN new_id TO id;
ALTER TABLE withdrawals DROP COLUMN IF EXISTS id;
ALTER TABLE withdrawals RENAME COLUMN new_id TO id;
ALTER TABLE banners DROP COLUMN IF EXISTS id;
ALTER TABLE banners RENAME COLUMN new_id TO id;

ALTER TABLE resources DROP COLUMN IF EXISTS institution_id;
ALTER TABLE resources RENAME COLUMN institution_id_new TO institution_id;
ALTER TABLE institution_expertise_tags DROP COLUMN IF EXISTS institution_id;
ALTER TABLE institution_expertise_tags RENAME COLUMN institution_id_new TO institution_id;
ALTER TABLE resource_tags DROP COLUMN IF EXISTS resource_id;
ALTER TABLE resource_tags RENAME COLUMN resource_id_new TO resource_id;
ALTER TABLE orders DROP COLUMN IF EXISTS resource_id;
ALTER TABLE orders RENAME COLUMN resource_id_new TO resource_id;
ALTER TABLE orders DROP COLUMN IF EXISTS buyer_id;
ALTER TABLE orders RENAME COLUMN buyer_id_new TO buyer_id;
ALTER TABLE orders DROP COLUMN IF EXISTS seller_id;
ALTER TABLE orders RENAME COLUMN seller_id_new TO seller_id;
ALTER TABLE authorizations DROP COLUMN IF EXISTS order_id;
ALTER TABLE authorizations RENAME COLUMN order_id_new TO order_id;
ALTER TABLE authorizations DROP COLUMN IF EXISTS buyer_id;
ALTER TABLE authorizations RENAME COLUMN buyer_id_new TO buyer_id;
ALTER TABLE authorizations DROP COLUMN IF EXISTS resource_id;
ALTER TABLE authorizations RENAME COLUMN resource_id_new TO resource_id;
ALTER TABLE withdrawals DROP COLUMN IF EXISTS institution_id;
ALTER TABLE withdrawals RENAME COLUMN institution_id_new TO institution_id;
ALTER TABLE users DROP COLUMN IF EXISTS institution_id;
ALTER TABLE users RENAME COLUMN institution_id_new TO institution_id;

-- PART 7: 重建索引
CREATE INDEX IF NOT EXISTS idx_resources_institution_status ON resources(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_authorizations_buyer_resource ON authorizations(buyer_id, resource_id);

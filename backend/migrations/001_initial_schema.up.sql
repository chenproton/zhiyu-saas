CREATE TYPE institution_type AS ENUM ('school', 'enterprise');
CREATE TYPE institution_status AS ENUM ('pending', 'approved', 'disabled');
CREATE TYPE resource_status AS ENUM ('draft', 'reviewing', 'rejected', 'pending_publish', 'published', 'offlined');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
CREATE TYPE user_role AS ENUM ('school', 'enterprise', 'operator');

CREATE TABLE institutions (
    id VARCHAR(50) PRIMARY KEY,
    type institution_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    credit_code VARCHAR(50) NOT NULL UNIQUE,
    logo VARCHAR(500),
    intro TEXT,
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    qualification_file VARCHAR(500),
    status institution_status NOT NULL DEFAULT 'pending',
    org_code VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_spent DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_income DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE institution_expertise_tags (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    tag_value VARCHAR(100) NOT NULL,
    UNIQUE(institution_id, tag_value)
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) REFERENCES institutions(id) ON DELETE SET NULL,
    role user_role NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resources (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    intro TEXT,
    category VARCHAR(50) NOT NULL,
    cover_image VARCHAR(500),
    attachment VARCHAR(500),
    attachment_name VARCHAR(255),
    price DECIMAL(15,2) NOT NULL DEFAULT 0,
    version VARCHAR(50) NOT NULL DEFAULT 'v1.0',
    status resource_status NOT NULL DEFAULT 'draft',
    reject_reason TEXT,
    sales_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resource_tags (
    id VARCHAR(50) PRIMARY KEY,
    resource_id VARCHAR(50) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_type VARCHAR(50) NOT NULL,
    tag_value VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    order_no VARCHAR(100) NOT NULL UNIQUE,
    buyer_id VARCHAR(50) NOT NULL REFERENCES institutions(id),
    seller_id VARCHAR(50) NOT NULL REFERENCES institutions(id),
    resource_id VARCHAR(50) NOT NULL REFERENCES resources(id),
    price DECIMAL(15,2) NOT NULL,
    platform_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    seller_income DECIMAL(15,2) NOT NULL DEFAULT 0,
    status order_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE authorizations (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id VARCHAR(50) NOT NULL REFERENCES institutions(id),
    resource_id VARCHAR(50) NOT NULL REFERENCES resources(id),
    auth_code VARCHAR(100) NOT NULL UNIQUE,
    status INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(buyer_id, resource_id)
);

CREATE TABLE withdrawals (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL REFERENCES institutions(id),
    amount DECIMAL(15,2) NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    account_info VARCHAR(500) NOT NULL,
    status withdrawal_status NOT NULL DEFAULT 'pending',
    handled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE banners (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    link VARCHAR(500),
    sort INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE platform_configs (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_institution_status ON resources(institution_id, status);
CREATE INDEX idx_resources_status_created ON resources(status, created_at);
CREATE INDEX idx_resource_tags_resource ON resource_tags(resource_id, tag_type);
CREATE INDEX idx_resource_tags_lookup ON resource_tags(tag_type, tag_value);
CREATE INDEX idx_orders_buyer ON orders(buyer_id, status);
CREATE INDEX idx_orders_seller ON orders(seller_id, status);
CREATE INDEX idx_authorizations_buyer_resource ON authorizations(buyer_id, resource_id);
CREATE INDEX idx_withdrawals_institution ON withdrawals(institution_id, status);

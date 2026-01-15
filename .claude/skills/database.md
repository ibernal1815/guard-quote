# GuardQuote Database Skill

Use this skill when working with the database, running queries, or managing schema.

## Connection Info

| Property | Value |
|----------|-------|
| Host | 192.168.2.70 (Pi1) |
| Port | 5432 (direct) or 6432 (PgBouncer) |
| Database | guardquote |
| User | guardquote |
| Password | WPU8bj3nbwFyZFEtHZQz |

**Connection String (PgBouncer - recommended):**
```
postgresql://guardquote:WPU8bj3nbwFyZFEtHZQz@192.168.2.70:6432/guardquote
```

## Schema

### users
Admin and client accounts.
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',  -- 'admin', 'user'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### clients
Business clients requesting quotes.
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### quotes
Security service quotes.
```sql
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  event_type VARCHAR(100),
  event_date DATE,
  location TEXT,
  guest_count INTEGER,
  duration_hours INTEGER,
  base_price DECIMAL(10,2),
  risk_multiplier DECIMAL(4,2),
  final_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### event_types
Event categories with base pricing.
```sql
CREATE TABLE event_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  base_rate DECIMAL(10,2),
  risk_factor DECIMAL(4,2),
  description TEXT
);
```

### locations
Service areas with risk modifiers.
```sql
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  risk_modifier DECIMAL(4,2) DEFAULT 1.0
);
```

## Common Queries

### Connect via psql
```bash
# From local machine
psql postgresql://guardquote:WPU8bj3nbwFyZFEtHZQz@192.168.2.70:5432/guardquote

# From Pi1
ssh pi1 "sudo -u postgres psql guardquote"
```

### List all tables
```sql
\dt
```

### View table schema
```sql
\d users
\d quotes
```

### Get all users
```sql
SELECT id, email, first_name, last_name, role, is_active, created_at FROM users;
```

### Get recent quotes
```sql
SELECT q.*, c.name as client_name
FROM quotes q
LEFT JOIN clients c ON q.client_id = c.id
ORDER BY q.created_at DESC
LIMIT 20;
```

### Dashboard stats
```sql
SELECT
  COUNT(*) as total_quotes,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  SUM(CASE WHEN status = 'approved' THEN final_price ELSE 0 END) as revenue
FROM quotes;
```

### Create admin user
```sql
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('admin@guardquote.com', '<argon2_hash>', 'Admin', 'User', 'admin', true);
```

## Drizzle ORM

Schema file: `backend/src/db/schema.ts`

### Run migrations
```bash
cd backend
bunx drizzle-kit push
```

### Generate migration
```bash
cd backend
bunx drizzle-kit generate
```

### View pending changes
```bash
cd backend
bunx drizzle-kit check
```

## Troubleshooting

### Connection timeout
1. Check Pi1 is reachable: `ping 192.168.2.70`
2. Check PostgreSQL running: `ssh pi1 "systemctl status postgresql"`
3. Check UFW allows your IP: `ssh pi1 "sudo ufw status"`
4. Check pg_hba.conf: `ssh pi1 "sudo cat /etc/postgresql/15/main/pg_hba.conf"`

### Add network to pg_hba.conf
```bash
ssh pi1 "echo 'host guardquote guardquote 192.168.1.0/24 md5' | sudo tee -a /etc/postgresql/15/main/pg_hba.conf"
ssh pi1 "sudo systemctl reload postgresql"
```

### Reset user password
```sql
-- Must generate hash via Bun.password.hash() first
UPDATE users SET password_hash = '<new_hash>' WHERE email = 'user@example.com';
```

---

*Last updated: January 15, 2026*

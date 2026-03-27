-- Dramix Database Schema
-- Executar no console do Cloudflare D1

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- free | basic | premium
  plan_expires_at TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Perfis (múltiplos por conta, estilo Netflix)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'robot',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Categorias
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Dramas (séries completas em um único vídeo)
CREATE TABLE IF NOT EXISTS dramas (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration_seconds INTEGER,
  is_dubbed INTEGER NOT NULL DEFAULT 0,
  is_new INTEGER NOT NULL DEFAULT 0,
  is_exclusive INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Relação drama <-> categoria (muitos para muitos)
CREATE TABLE IF NOT EXISTS drama_categories (
  drama_id TEXT NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (drama_id, category_id)
);

-- Drama em destaque (hero da home)
CREATE TABLE IF NOT EXISTS featured_drama (
  id INTEGER PRIMARY KEY DEFAULT 1,
  drama_id TEXT NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Lista "Minha Lista" de cada perfil
CREATE TABLE IF NOT EXISTS user_list (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drama_id TEXT NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (profile_id, drama_id)
);

-- Histórico de visualização (progresso)
CREATE TABLE IF NOT EXISTS watch_history (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drama_id TEXT NOT NULL REFERENCES dramas(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  watched_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (profile_id, drama_id)
);

-- Assinaturas / pagamentos
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- basic | premium
  status TEXT NOT NULL DEFAULT 'active', -- active | cancelled | expired
  syncpay_id TEXT,
  amount_cents INTEGER NOT NULL,
  starts_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_drama_categories_drama ON drama_categories(drama_id);
CREATE INDEX IF NOT EXISTS idx_drama_categories_category ON drama_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_user_list_profile ON user_list(profile_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_profile ON watch_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_dramas_created ON dramas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- Categorias padrão
INSERT OR IGNORE INTO categories (id, name, slug, sort_order) VALUES
  ('cat_novos',      'Novos Na Plataforma',  'novos',              1),
  ('cat_dublados',   'Dublados',             'dublados',           2),
  ('cat_romance',    'Romance',              'romance',            3),
  ('cat_suspense',   'Suspense',             'suspense',           4),
  ('cat_comedia',    'Comédia',              'comedia',            5),
  ('cat_acao',       'Ação',                 'acao',               6),
  ('cat_animes',     'Animes',               'animes',             7),
  ('cat_bl_gl',      'BL & GL',              'bl-gl',              8),
  ('cat_identidade', 'Identidade Escondida', 'identidade-escondida',9),
  ('cat_amor',       'Amor à Primeira Vista','amor-primeira-vista', 10),
  ('cat_bebes',      'Bebês e Gravidezes',   'bebes-gravidezes',   11),
  ('cat_tabu',       'Relacionamento Tabu',  'relacionamento-tabu', 12),
  ('cat_lobos',      'Homem-lobo e Vampiro', 'homem-lobo-vampiro',  13);

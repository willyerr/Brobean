-- P10.2.1 — Brew Log foundation
-- Preparation methods own their parameter configuration. Each Brew stores
-- the values used at the time of brewing, so later configuration changes do
-- not rewrite historical records.

CREATE TABLE IF NOT EXISTS preparations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    note TEXT,
    style_type TEXT NOT NULL DEFAULT 'CUSTOM_PREPARATION',
    is_builtin INTEGER NOT NULL DEFAULT 0 CHECK (is_builtin IN (0, 1)),
    use_custom_parameters INTEGER NOT NULL DEFAULT 0 CHECK (use_custom_parameters IN (0, 1)),
    archived_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brew_parameter_definitions (
    parameter_key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    value_type TEXT NOT NULL CHECK (value_type IN ('text', 'number', 'duration', 'boolean', 'text_list')),
    unit TEXT,
    phase TEXT NOT NULL CHECK (phase IN ('before', 'during', 'after')),
    default_enabled INTEGER NOT NULL DEFAULT 0 CHECK (default_enabled IN (0, 1)),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS preparation_parameters (
    preparation_id INTEGER NOT NULL,
    parameter_key TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
    phase TEXT NOT NULL CHECK (phase IN ('before', 'during', 'after')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required INTEGER NOT NULL DEFAULT 0 CHECK (is_required IN (0, 1)),
    PRIMARY KEY (preparation_id, parameter_key),
    FOREIGN KEY (preparation_id) REFERENCES preparations(id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_key) REFERENCES brew_parameter_definitions(parameter_key) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS brews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bean_id INTEGER NOT NULL,
    preparation_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    brewed_at TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bean_id) REFERENCES beans(id) ON DELETE RESTRICT,
    FOREIGN KEY (preparation_id) REFERENCES preparations(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS brew_parameter_values (
    brew_id INTEGER NOT NULL,
    parameter_key TEXT NOT NULL,
    value_json TEXT NOT NULL,
    PRIMARY KEY (brew_id, parameter_key),
    FOREIGN KEY (brew_id) REFERENCES brews(id) ON DELETE CASCADE,
    FOREIGN KEY (parameter_key) REFERENCES brew_parameter_definitions(parameter_key) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_preparations_active
    ON preparations(archived_at, name);
CREATE INDEX IF NOT EXISTS idx_preparation_parameters_order
    ON preparation_parameters(preparation_id, phase, sort_order);
CREATE INDEX IF NOT EXISTS idx_brews_bean_date
    ON brews(bean_id, brewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_brews_preparation_date
    ON brews(preparation_id, brewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_brews_date
    ON brews(brewed_at DESC);

-- Parameter catalogue adapted from BeanConqueror's brew model and
-- before / during / after parameter ordering.
INSERT OR IGNORE INTO brew_parameter_definitions
    (parameter_key, label, value_type, unit, phase, default_enabled, sort_order)
VALUES
    ('bean_weight_in', 'Coffee dose', 'number', 'g', 'before', 0, 1),
    ('grind_weight', 'Grind weight', 'number', 'g', 'before', 1, 2),
    ('mill', 'Grinder', 'text', NULL, 'before', 1, 3),
    ('grind_size', 'Grind size', 'text', NULL, 'before', 1, 4),
    ('mill_timer', 'Grinder timer', 'duration', 's', 'before', 0, 5),
    ('mill_speed', 'Grinder speed', 'number', 'rpm', 'before', 0, 6),
    ('water', 'Water', 'text', NULL, 'before', 0, 7),
    ('vessel_name', 'Vessel', 'text', NULL, 'before', 0, 8),
    ('vessel_weight', 'Vessel weight', 'number', 'g', 'before', 0, 9),
    ('pressure_profile', 'Pressure profile', 'text', NULL, 'before', 0, 10),
    ('brew_temperature', 'Brew temperature', 'number', '°C', 'before', 1, 11),
    ('brew_temperature_time', 'Temperature surfing time', 'duration', 's', 'during', 0, 1),
    ('brew_time', 'Brew time', 'duration', 's', 'during', 1, 2),
    ('coffee_blooming_time', 'Blooming time', 'duration', 's', 'during', 1, 3),
    ('coffee_first_drip_time', 'First drip time', 'duration', 's', 'during', 1, 4),
    ('coffee_type', 'Coffee type', 'text', NULL, 'after', 0, 1),
    ('coffee_concentration', 'Coffee concentration', 'text', NULL, 'after', 0, 2),
    ('brew_quantity', 'Brew quantity', 'number', 'g', 'after', 1, 3),
    ('brew_quantity_type', 'Brew quantity unit', 'text', NULL, 'after', 0, 4),
    ('brew_beverage_quantity', 'Beverage quantity', 'number', 'g', 'after', 1, 5),
    ('brew_beverage_quantity_type', 'Beverage quantity unit', 'text', NULL, 'after', 0, 6),
    ('tds', 'TDS', 'number', '%', 'after', 0, 7),
    ('note', 'Notes', 'text', NULL, 'after', 1, 8),
    ('attachments', 'Attachments', 'text_list', NULL, 'after', 0, 9),
    ('method_of_preparation_tool', 'Preparation tools', 'text_list', NULL, 'before', 0, 12);

-- Initial built-in methods. Users will be able to create their own methods
-- in the later Preparation Management phase.
INSERT OR IGNORE INTO preparations (name, slug, style_type, is_builtin)
VALUES
    ('V60', 'v60', 'V60', 1),
    ('Espresso', 'espresso', 'PORTAFILTER', 1),
    ('AeroPress', 'aeropress', 'AEROPRESS', 1),
    ('AeroPress Inverted', 'aeropress-inverted', 'AEROPRESS_INVERTED', 1),
    ('Chemex', 'chemex', 'CHEMEX', 1),
    ('French Press', 'french-press', 'FRENCH_PRESS', 1),
    ('Kalita Wave', 'kalita-wave', 'KALITA_WAVE', 1),
    ('Moka Pot', 'moka-pot', 'BIALETTI', 1),
    ('Cold Brew', 'cold-brew', 'COLD_BREW', 1),
    ('Clever Dripper', 'clever-dripper', 'DRIPPER', 1);

-- Start each built-in method with BeanConqueror-inspired defaults.
-- The parameter set and ordering remain independently editable per method.
INSERT OR IGNORE INTO preparation_parameters
    (preparation_id, parameter_key, is_enabled, phase, sort_order, is_required)
SELECT
    p.id,
    d.parameter_key,
    d.default_enabled,
    d.phase,
    d.sort_order,
    0
FROM preparations p
CROSS JOIN brew_parameter_definitions d
WHERE p.is_builtin = 1;

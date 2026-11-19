CREATE TABLE IF NOT EXISTS beans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    roastery TEXT NOT NULL,

    origin_country TEXT,
    origin_region TEXT,
    origin_farm TEXT,

    variety TEXT,
    process TEXT,
    roast_level TEXT,
    roast_date TEXT,

    bag_weight_grams REAL,
    price REAL,

    photo_base64 TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (bag_weight_grams IS NULL OR bag_weight_grams > 0),
    CHECK (price IS NULL OR price >= 0)
);

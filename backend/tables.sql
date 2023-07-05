-- tableSchema.sql

-- users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    imageurl TEXT,
    bio TEXT
);

-- CREATE TABLE IF NOT EXISTS users123 (
--     id SERIAL PRIMARY KEY,
--     email VARCHAR(255) NOT NULL,
--     name VARCHAR(255) NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     role VARCHAR(255) NOT NULL,
--     imageurl TEXT,
--     bio TEXT
-- );
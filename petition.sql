DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE signatures (
    id SERIAL primary key,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (first != ''),
    signature VARCHAR(255) NOT NULL CHECK (first != '')
    user_id VARCHAR NOT NULL CHECK (first != '')
);

CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (first != ''),
    password VARCHAR NOT NULL CHECK (first != '')
)
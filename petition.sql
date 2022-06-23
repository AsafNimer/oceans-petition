DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;

CREATE TABLE signatures (
    id SERIAL primary key,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    signature VARCHAR NOT NULL CHECK (signature != ''),
    user_id INT NOT NULL
);

CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    email VARCHAR NOT NULL CHECK (email != '') UNIQUE,
    password VARCHAR NOT NULL CHECK (password != '')
);




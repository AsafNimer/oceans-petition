DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profile;


CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    email VARCHAR NOT NULL CHECK (email != '') UNIQUE,
    password VARCHAR NOT NULL CHECK (password != '')
);

CREATE TABLE signatures (
    id SERIAL primary key,
    user_id INT NOT NULL REFERENCES users(id) UNIQUE,
    signature VARCHAR NOT NULL CHECK (signature != '')
);


CREATE TABLE user_profile (
    id SERIAL primary key,
    user_id INT NOT NULL REFERENCES users(id) UNIQUE,
    city VARCHAR,
    age VARCHAR,
    profilepage VARCHAR
);



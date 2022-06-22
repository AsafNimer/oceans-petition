const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSigner = (first, last, signature) => {
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id;`;
    const param = [first, last, signature];
    return db.query(q, param);
};

module.exports.showSignatures = ([id]) => {
    return db.query(`SELECT * FROM signatures WHERE id = $1`, [id]);
};

module.exports.countSigners = () => {
    return db.query(` SELECT COUNT(id)
FROM signatures;`);
};

module.exports.getSigner = () => {
    return db.query(`SELECT first, last FROM signatures`);
};
module.exports.getSignatureData = (signId) => {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const param = [signId];
    return db.query(q, param);
};

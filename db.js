// //DATABASE & QUERIES

const spicedPg = require("spiced-pg");
// below we have information that we need for out db connection
// which db do we talk to?
const database = "petition";
// which user is running our queries in the db
const username = "postgres";
// what's the users password
const password = "postgres";

const db = spicedPg(
    `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log("[db] connecting to:", database);

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSignatures = (first, last, signature) => {
    console.log(
        "[db] first name, ",
        first,
        "[db] lastName",
        last,
        "signature",
        signature
    );
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)`;
    const param = [first, last, signature];
    return db.query(q, param);
};

module.exports.showSignatures = ([id]) => {
    return db.query(`SELECT * FROM signatures WHERE id = $1`, [id]);
};

module.exports.signaturesCount = () => {
    return db.query(`SELECT count(*) FROM signatures`);
};

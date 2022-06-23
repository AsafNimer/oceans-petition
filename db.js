const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    process.env.DATABASE_URL ||
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
//-------------------part 3-----------------------------------
module.exports.insrtHshPassToDb = () => {
    const q = `INSERT INTO users (first, last, email, hashedPass) VALUES ($1, $2, $3) RETURNING id;`;
    // const param = [req.body.first, req.body.last, req.body.email];
    // return db.query(q, param);
};

// call a function to insert the hashed password that bcrypt.hash
// returned plus the first, last, and email from req.body into the
// database and create a new user

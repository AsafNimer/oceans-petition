const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

/* ---------------------------------------------
            User Table
------------------------------------------------*/
module.exports.addNewUser = (first, last, email, password) => {
    console.log("(first, last, email, password)", first, last, email, password);
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [first, last, email, password];
    return db.query(q, param);
};
// varifyUserEmail
module.exports.getUserByEmil = (userEmail) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [userEmail]);
};

/* ---------------------------------------------
            Signature Table
------------------------------------------------*/

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addSigner = (user_id, signature) => {
    const q = `INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id`;
    const param = [user_id, signature];
    return db.query(q, param);
};

module.exports.countSigners = () => {
    return db.query(` SELECT COUNT(id) FROM signatures`);
};

module.exports.getSignatureById = (signId) => {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const param = [signId];
    return db.query(q, param);
};
/* ---------------------------------------------
            Profile Table
------------------------------------------------*/
module.exports.userProfileDetails = (data, userSessionId) => {
      const q = `INSERT INTO signatures (user_id, signature) VALUES ($1, $2) RETURNING id`;
      const param = [user_id, signature];
      return db.query(q, param);
    /* pass the data from req.body (city AND/OR age AND/OR website) + users id from the session --> 
    /* to a function that:   inserts the data into new table (user_profile table).
    
};
/* ---------------------------------------------
            Join Table
------------------------------------------------*/

// REVIEW See ifwe need it.
module.exports.getSigner = () => {
    return db.query(`SELECT first, last FROM signatures`);
};

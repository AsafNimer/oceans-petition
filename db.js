const spicedPg = require("spiced-pg");
const database = "petition";
const username = "postgres";
const password = "postgres";

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

/* ---------------------------------------------
            Users Table
------------------------------------------------*/
module.exports.addNewUser = (first, last, email, password) => {
    console.log("(first, last, email, password)", first, last, email, password);
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4)
    RETURNING id`;
    const param = [first, last, email, password];
    return db.query(q, param);
};

module.exports.getUserByEmail = (userEmail) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [userEmail]);
};

module.exports.updateUsers = (first, last, email, userId) => {
    const q = `UPDATE users
                SET first=$1, last=$2, email=$3
                WHERE id = $4;`;
    const param = [first, last, email, userId];
    return db.query(q, param);
};

module.exports.updateUserPassword = (first, last, email, password, userId) => {
    const q = `UPDATE users
                SET first=$1, last=$2, email=$3, password=$4
                WHERE id = $5;`;
    const param = [first, last, email, password, userId];
    return db.query(q, param);
};
/* ---------------------------------------------
            Signature Table
------------------------------------------------*/

module.exports.getSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.getSignaturesForLogin = (userId) => {
    const q = `SELECT * 
                FROM signatures 
                WHERE user_id = $1`;
    const param = [userId];
    return db.query(q, param);
};

module.exports.addSigner = (signature, user_id) => {
    const q = `INSERT into signatures (signature, user_id)
                VALUES ($1, $2) 
                RETURNING id, signature, user_id`;
    const param = [signature, user_id];
    return db.query(q, param);
};
//-----------------------------------------------------------
module.exports.countSigners = () => {
    return db.query(` SELECT COUNT(id) FROM signatures`);
};

module.exports.getSignatureById = (signId) => {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const param = [signId];
    return db.query(q, param);
};

module.exports.getSignatureById = (idSignature) => {
    return db.query(
        `SELECT * FROM signatures 
                    WHERE id = $1`,
        [idSignature]
    );
};

module.exports.totalNumofSignatures = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};
//-----------------------------------------------------------
module.exports.deleteSignature = (userId) => {
    const q = `DELETE FROM signatures WHERE user_id = $1;`;
    const param = [userId];
    return db.query(q, param);
};

module.exports.checkForSignature = (user_id) => {
    const q = `SELECT id
                FROM signatures 
                WHERE user_id = $1`;
    const param = [user_id];
    return db.query(q, param);
};
/* ---------------------------------------------
            Profile Table
------------------------------------------------*/
module.exports.userProfileDetails = (age, city, profilepage, userId) => {
    console.log(age, city, profilepage, userId);
    const q = `INSERT INTO user_profile (age, city, profilepage, user_id) VALUES ($1, $2, $3, $4) RETURNING id`;
    const param = [age, city, profilepage, userId];
    return db.query(q, param);
};

module.exports.updateProfile = (age, city, profilepage, userId) => {
    const q = `INSERT INTO user_profiles (age, city, profilepage, user_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id)
                DO UPDATE SET age = $1, city = $2, url = $3;`;
    const param = [age, city, profilepage, userId];
    return db.query(q, param);
};

/* ---------------------------------------------
            Join Tables
------------------------------------------------*/
module.exports.getSigners = () => {
    return db.query(
        `SELECT users.first, users.last, signatures.id AS "signatureId", user_profile.age, user_profile.city, user_profile.profilepage
FROM users
RIGHT JOIN signatures
ON signatures.user_id = users.id
LEFT JOIN user_profile
ON user_profile.user_id = users.id
ORDER BY users.last`
    );
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, signatures.id AS "signatureId", user_profile.city, user_profile.age, user_profile.profilepage
FROM users
RIGHT JOIN signatures
ON signatures.user_id=users.id
JOIN user_profile
ON user_profile.user_id = users.id
WHERE user_profile.city = $1
ORDER BY users.last`,
        [city]
    );
};

module.exports.getUserByEmail = (email) => {
    return db.query(
        `SELECT users.*, signatures.id AS "signatureId"
FROM users
LEFT JOIN signatures
ON signatures.user_id = users.id
WHERE email = $1`,
        [email]
    );
};

module.exports.getProfileForEdit = (userId) => {
    const q = `SELECT users.first, users.last, users.email, user_profile.age, user_profile.city, user_profile.profilepage
                FROM users
                LEFT OUTER JOIN user_profile
                ON users.id = user_profile.user_id
                WHERE users.id = $1;`;
    const param = [userId];
    return db.query(q, param);
};

module.exports.findSignature = (user_id) => {
    const q = `SELECT 
                FROM signatures 
                WHERE user_id = $1`;
    const param = [user_id];
    return db.query(q, param);
};

const bcrypt = require("bcryptjs");

//when user register
exports.hash = (password) => {
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

exports.compare = bcrypt.compare; //when user logs in

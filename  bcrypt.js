const bcrypt = require("bcryptjs");

exports.hash = (password) => {
    //when user register
    return bcrypt.genSalt().then((salt) => {
        return bcrypt.hash(password, salt);
    });
};

// exports.compare = bcrypt.compare; //when user logs in

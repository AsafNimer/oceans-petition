module.exports.isObjectEmpty = (obj) => {
    for (let key in obj) {
        if (obj[key]) {
            // return console.log("object isn't empty", obj[key]), false;
            return false;
        }
    }
    return true;
};

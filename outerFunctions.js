module.exports.isObjectEmpty = (obj) => {
    for (let key in obj) {
        if (obj[key]) {
            return false;
        }
    }
    return true;
};

module.exports.firstLetterToUpperCase = function (strOrArray) {
    if (typeof strOrArray === "string") {
        let newUpperCasedStr = "";
        if (strOrArray.split(" ").length > 1) {
            let subArr = strOrArray.trim().split(" ");
            for (let j = 0; j < subArr.length; j++) {
                if (subArr[j][0] === subArr[j][0].toLowerCase()) {
                    newUpperCasedStr +=
                        subArr[j][0].toUpperCase() + subArr[j].slice(1) + " ";
                }
            }
        } else {
            newUpperCasedStr =
                strOrArray[0].toUpperCase() + strOrArray.slice(1);
        }
        return newUpperCasedStr.trim();
    } else if (Array.isArray(strOrArray)) {
        for (let i = 0; i < strOrArray.length; i++) {
            for (let key in strOrArray[i]) {
                if (key === "first" || key === "last" || key === "city") {
                    if (strOrArray[i][key] === null) {
                        strOrArray[i][key] = "Unknown";
                    }
                    let subArr = strOrArray[i][key].trim().split(" ");
                    if (subArr.length > 1) {
                        for (let j = 0; j < subArr.length; j++) {
                            if (
                                strOrArray[i][key][0] ===
                                strOrArray[i][key][0].toLowerCase()
                            ) {
                                strOrArray[i][key] =
                                    subArr[j][0].toUpperCase() +
                                    subArr[j].slice(1) +
                                    " " +
                                    subArr[subArr.length - 1][0].toUpperCase() +
                                    subArr[subArr.length - 1].slice(1);
                            }
                        }
                    } else {
                        if (
                            strOrArray[i][key][0] ==
                            strOrArray[i][key][0].toLowerCase()
                        ) {
                            strOrArray[i][key] =
                                strOrArray[i][key][0].toUpperCase() +
                                strOrArray[i][key].slice(1);
                        }
                    }
                }
            }
        }
        return strOrArray;
    }
};

module.exports.userCity = (str) => {
    if (str === "Unknown") {
        return false;
    } else {
        return str;
    }
};

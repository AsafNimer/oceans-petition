const express = require("express");
const app = express();
const db = require("./db");
const outerFunctions = require("./outerFunctions");
const bcrypt = require("./bcrypt");
const { engine } = require("express-handlebars");
const cookieSession = require("cookie-session");

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

app.use((req, res, next) => {
    next();
});

app.use((req, res, next) => {
    if (!req.session.userId) {
        if (
            req.url != "/register" &&
            req.url != "/login" &&
            req.url != "/home"
        ) {
            res.redirect("/home");
        }
    }
    next();
});

app.get("/home", (req, res) => {
    res.render("home", { header: false });
});

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            loggedIn: true,
            header: true,
        });
    }
});

app.get("/thanks", (req, res) => {
    if (req.session.signatureId) {
        Promise.all([
            db.getSignatureById(req.session.signatureId),
            db.countSigners(),
            db.getUserName(req.session.userId),
        ])
            .then((result) => {
                res.render("thanks", {
                    title: "thanks",
                    totalSigners: result[1].rows[0].count,
                    signatureSrc: result[0].rows[0].signature,
                    cookie: true,
                    loggedIn: true,
                    first: outerFunctions.firstLetterToUpperCase(
                        result[2].rows[0].first
                    ),
                });
            })
            .catch((err) => console.log("ERROR promiseAll", err));
    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/home");
});
app.get("/register", (req, res) => {
    res.render("register", { notLoggedIn: true, header: true });
});

app.get("/login", (req, res) => {
    res.render("login", { notLoggedIn: true, header: true });
});

app.get("/profile", (req, res) => {
    res.render("profile", { notLoggedIn: true, header: true });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then((result) => {
            res.render("signers", {
                title: "Signers",
                listOfSigners: outerFunctions.firstLetterToUpperCase(
                    result.rows
                ),
                renderSigners: true,
                loggedIn: true,
            });
        })
        .catch((err) => console.log("Error:", err));
});

app.get("/petition/signers/:city", (req, res) => {
    if (req.session.signatureId) {
        db.getSignersByCity(req.params.city)
            .then((result) => {
                res.render("signers", {
                    title: "Signers City",
                    results: outerFunctions.firstLetterToUpperCase(result.rows),
                    city: outerFunctions.userCity(req.params.city),
                    renderSignersCity: true,
                    loggedIn: true,
                });
            })
            .catch((err) => {
                console.log("error is ", err);
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/edit", (req, res) => {
    db.getProfileForEdit(req.session.userId)
        .then((result) => {
            res.render("edit", {
                userResults: result.rows,
                loggedIn: true,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/home", (req, res) => {
    res.redirect("/register");
});

app.post("/petition", (req, res) => {
    db.addSigner(req.body.signature, req.session.userId)
        .then((results) => {
            req.session.signatureId = results.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log(err);
            res.render("petition", {
                error: true,
            });
        });
});

app.post("/register", (req, res) => {
    bcrypt
        .hash(req.body.password)
        .then((hashedPassword) => {
            return db
                .addNewUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashedPassword
                )
                .then((result) => {
                    req.session.userId = result.rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("ERROR WITH ADDING THE USER ", err);
                    res.render("register", {
                        title: "Registration Form",
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("ERROR WITH BCRYPT ", err);
        });
});

app.post("/login", (req, res) => {
    db.getUserByEmail(req.body.email)
        .then((result) => {
            if (result.rows[0]) {
                bcrypt
                    .compare(req.body.password, result.rows[0].password)
                    .then((correct) => {
                        if (correct) {
                            req.session.login = true;
                            req.session.userId = result.rows[0].id;
                            db.checkForSignature(req.session.userId)
                                .then((results) => {
                                    if (results.rows[0]) {
                                        req.session.signed = true;
                                        req.session.signatureId =
                                            results.rows[0].id;
                                        res.redirect("/thanks");
                                    } else {
                                        res.redirect("/petition");
                                    }
                                })
                                .catch((err) => {
                                    console.log(err);
                                });
                        } else {
                            console.log("HASHED PASS HAS NO MATCH");
                            res.render("login", { error: true, header: true });
                        }
                    });
            } else {
                res.render("login", {
                    error: true,
                });
            }
        })
        .catch((err) => {
            console.log("err in login", err);
        });
});

app.post("/profile", (req, res) => {
    if (!outerFunctions.isObjectEmpty(req.body)) {
        return db
            .userProfileDetails(
                req.body.age,
                req.body.city,
                req.body.url,
                req.session.userId
            )
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log(err);
                res.render("profile", {
                    error: true,
                });
            });
    } else {
        return res.redirect("petition");
    }
});

app.post("/edit", (req, res) => {
    if (req.body.password) {
        bcrypt
            .hash(req.body.password)
            .then((hashed) => {
                db.updateUserPassword(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hashed,
                    req.session.userId
                )
                    .then(() => {
                        db.updateProfile(
                            req.body.age,
                            req.body.city,
                            req.body.profilepage,
                            req.session.userId
                        )
                            .then(() => {
                                res.redirect("/login");
                            })
                            .catch((err) => {
                                console.log("ERROR in updateProfile", err);
                            });
                    })
                    .catch((err) => {
                        console.log("ERROR in updateUserPassword ", err);
                    });
            })
            .catch((err) => {
                console.log("ERROR in bcrypt", err);
            });
    } else {
        db.updateUsers(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userId
        )
            .then(() => {
                db.updateProfile(
                    req.body.age,
                    req.body.city,
                    req.body.profilepage,
                    req.session.userId
                )
                    .then(() => {
                        res.redirect("/petition");
                    })
                    .catch((err) => {
                        console.log("ERROR in updateProfile ", err);
                    });
            })
            .catch((err) => {
                console.log("ERROR in updateUser ", err);
            });
    }
});

app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.userId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("ERROR ON DELETE SIGNATURE ", err);
            res.render("error");
        });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("you got this petition...")
);

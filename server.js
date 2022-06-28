const express = require("express");
const app = express();
const db = require("./db");
const outerFunction = require("./outerFunction");
const PORT = 8080;

// BCRYPT
const bcrypt = require("./bcrypt.js");

//setup HB-EXPRESS
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// linking 'public' directory for css and script.js
app.use(express.static("./public"));

//for parsing the form POST request
app.use(express.urlencoded({ extended: false }));

//--------COOKIES AND SHOW SIGNATURE----------
const cookieSession = require("cookie-session");
console.log(cookieSession);

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("---------------------");
    next();
});

app.use((req, res, next) => {
    if (!req.session.userId) {
        if (req.url != "/register" && req.url != "/login") {
            res.redirect("/register");
        }
    }
    next();
});
/* -------------------------------
          APP     GET
-------------------------------*/
app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
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
                console.log("Result all promise", result[0].rows[0]);
                console.log("Result all promise", result[1].rows[0]);
                console.log("Result all promise FIRST", result[2].rows[0]);

                res.render("thanks", {
                    title: "thanks",
                    totalSigners: result[1].rows[0].count,
                    signatureSrc: result[0].rows[0].signature,
                    cookie: true,
                    first: result[2].rows[0].first,
                });
            })
            .catch((err) => console.log("ERROR promiseAll", err));
    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then((result) => {
            res.render("signers", {
                title: "Signers",
                listOfSigners: result.rows,
                renderSigners: true,
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
                    results: result.rows,
                    city: req.params.city,
                    renderSignersCity: true,
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
            console.log(result.rows);
            res.render("edit", {
                userResults: result.rows,
            });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/profile", (req, res) => {
    res.render("profile");
});
/* -------------------------------
          APP     POST
-------------------------------*/
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
    console.log("REQ.BODY: ", req.body);
    console.log(
        "req.body.first, req.body.last, req.body.email, req.body.password",
        req.body.first,
        req.body.last,
        req.body.email,
        req.body.password
    );
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
        .then((results) => {
            if (results.rows[0]) {
                console.log(
                    "USER'S PASSWORD FROM DATABASE",
                    results.rows[0].password
                );
                bcrypt
                    .compare(req.body.password, results.rows[0].password)
                    .then((correct) => {
                        if (correct) {
                            req.session.login = true;
                            req.session.userId = results.rows[0].id;

                            db.checkForSignature(req.session.userId)
                                .then((results) => {
                                    console.log(
                                        "results.rows[0]",
                                        results.rows[0]
                                    );
                                    if (results.rows[0]) {
                                        req.session.signed = true;
                                        console.log(
                                            "user has signed and log in",
                                            results.rows[0]
                                        );
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
                            res.render("login");
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
    console.log(req.body);
    if (!outerFunction.isObjectEmpty(req.body)) {
        console.log("HELLO");
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
                console.log("sth went wrong", err);
                res.render("profile", {
                    error: true,
                });
            });
    } else {
        return res.redirect("petition");
    }
});

app.post("/edit", (req, res) => {
    console.log("BODY in EDIT: ", req.body);
    if (req.body.password) {
        bcrypt
            .hash(req.body.password)
            .then((hashed) => {
                console.log("PASSWORD HASHED");
                /* ----------?"hash"?-----------*/
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
                            req.session.userId // req.session.id
                        )
                            .then(() => {
                                console.log("Hello!");
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
            req.session.userId // req.session.id????
        )
            .then(() => {
                db.updateProfile(
                    req.body.age,
                    req.body.city,
                    req.body.profilepage,
                    req.session.userId // req.session.id
                )
                    .then(() => {
                        res.redirect("/login");
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

app.listen(PORT, () => console.log("you got this petition..."));

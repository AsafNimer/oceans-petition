const express = require("express");
const app = express();
const db = require("./db");
const PORT = 8080;

// BCRYPT
const bcrypt = require("./bcrypt");
console.log(bcrypt);

bcrypt
    .hash()
    .then(function (hash) {
        console.log(hash);
        return bcrypt.compare("funkychicken", hash);
    })
    .then(function (isCorrect) {
        if (isCorrect) {
            console.log("correct!");
        } else {
            console.log("WRONG!");
        }
    });

//setup HB-EXPRESS
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// linking public directory for css and script.js
app.use(express.static("./public"));

//for parsing the form POST request
app.use(express.urlencoded({ extended: false }));

//--------COOKIES AND SHOW SIGNATURE----------
const cookieSession = require("cookie-session");
console.log(cookieSession);

app.use(
    cookieSession({
        secret: `I'm always angry`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
//-----------setup my routes-----------

app.get("/petition", (req, res) => {
    if (req.session.signId) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.post("/petition", (req, res) => {
    console.log("req.body: ", req.body);
    db.addSigner(req.body.first, req.body.last, req.body.signature)
        .then(function (results) {
            req.session.signId = results.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(function (err) {
            console.log(err);
            res.render("petition", {
                error: true,
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.signId) {
        console.log("in read cookie route");
        console.log("req.session.signId ", req.session.signId);
        db.getSignatureData(req.session.signId).then((result) => {
            const signId = result.rows;

            db.countSigners().then((result) => {
                const countRows = result.rows;
                res.render("thanks", {
                    title: "thanks",
                    countRows,
                    signId,
                    cookie: true,
                });
            });
        });
    } else {
        res.redirect("/");
    }
});

app.get("/signers", (req, res) => {
    if (req.session.signId) {
        db.getSigner()
            .then((result) => {
                const signers = result.rows;
                console.log("SIGNERSSSSS:", signers);
                res.render("signers", {
                    title: "signers",
                    signers,
                    cookie: true,
                });
            })
            .catch(function (err) {
                console.log(err);
            });
    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/petition");
});

//----------------PART 3------------

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    console.log("REQ.BODY: ", req.body);
    bcrypt.hash(req.body.password).then(() => {
        db.insrtHshPassToDb();
    });
    res.redirect("login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    console.log(req.body);
    res.redirect("petition");
});
//----------------PART 4--------------

app.listen(PORT, () => console.log("you got this petition..."));

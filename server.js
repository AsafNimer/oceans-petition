//SERVER
const express = require("express");
const app = express();
const db = require("./db");
const PORT = 8080;
const bcrypt = require("./bcrypt");
console.log(bcrypt);

//setup HB-EXPRESS
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// importing css
app.use(express.static("./public"));

//for parsing the form POST request
app.use(express.urlencoded({ extended: false }));

//--------------COOKIES AND SHOW SIGNATURE---------------------------
const cookieSession = require("cookie-session");
console.log(cookieSession);

// app.use(
//     cookieSession({
//         secret: `I'm always angry`,
//         maxAge: 1000 * 60 * 60 * 24 * 14,
//         signed: true,
//     })
// );

//-----------rendering my HB templates-----------

app.get("/petition", (req, res) => {
    res.render("petition");
});

// app.get("/petition", (res, req) => {
//     if (req.session.signed === true) {
//         res.redirect("/thanks");
//     } else {
//         res.render("/petition");
//     }
// });

app.get("/petition/thanks", (req, res) => {
    res.render("thanks");
});

// app.get("/petition/thanks", (req, res) => {
//     if (req.session.signedPetition) {
//         //get signature, then amount of rows

//         db.displaySignature(req.session.signatureId).then((result) => {
//             const sendResults = result.rows[0];
//             db.countSigners().then((result) => {
//                 const count = result.rows[0].count;

//                 res.render("thanks", {
//                     title: "thanks",
//                     sendResults,
//                     count,
//                 });
//             });
//         });
//     } else {
//         res.redirect("/petition");
//     }
// });

app.get("/signers", (req, res) => {
    res.render("signers");
});

//--------------serving the GET and POST req-----------
app.get("/signers", (req, res) => {
    console.log("running GET / signers");
    db.getSignatures(req.body.first, req.body.last, req.body.signature)
        .then((result) => {
            // our actual data is to be found under the rows property
            console.log("result.rows from getActors:", result.rows);
            const results = result.rows;
            res.render("signers", {
                title: "signers",
                results,
            });
        })
        .catch((err) => console.log("err in db.getSignatures:", err));
});

// app.get("/petition/signers", (req, res) => {
//     if (req.session.signed) {
//         db.getSignatures()
//             .then((result) => {
//                 const results = result.rows;

//                 res.render("signers", {
//                     title: "signers",
//                     results,
//                 });
//             })
//             .catch((err) => {
//                 console.log("ERROR ", err);
//             });
//     } else {
//         res.redirect("/petition");
//     }
// });

app.post("/petition", (req, res) => {
    console.log("running POST / petition");
    console.log(req.body);

    db.addSignatures(req.body.first, req.body.last, req.body.signature)
        .then(() => {
            db.getSignatures();
            res.redirect("/petition/thanks");
        })
        .catch((err) => {
            console.log(err);
        });
});

// app.post("/petition", (req, res) => {
//     db.addSignature(req.body.fName, req.body.lName, req.body.signature)
//         .then((result) => {
//             db.getSignatures();

//             //id key from object inside an array x[0].id

//             req.session.signatureId = result.rows[0].id;
//             req.session.signedPetition = true;
//             res.redirect("/petition/thanks");
//         })
//         .catch((err) => {
//             console.log("error in db.add actor ", err);
//             res.render("petition", {
//                 title: "petition",
//                 error: true,
//             });
//         });
// });
//-------------------------------------------------------
app.listen(PORT, () => console.log("you got this petition..."));

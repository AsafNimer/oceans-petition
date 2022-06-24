const express = require("express");
const app = express();
const db = require("./db");
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

//-----------setup my routes-----------
/* -------------------------------
          APP     GET
-------------------------------*/

app.get("/petition", (req, res) => {
    if (req.session.signId) {
        res.redirect("/thanks");
    } else {
        res.render("petition");
    }
});

app.get("/thanks", (req, res) => {
    if (req.session.signId) {
        console.log("in read cookie route");
        console.log("req.session.signId ", req.session.signId);

        Promise.all([
            db.getSignatureById(req.session.signId),
            db.countSigners(),
        ])
            .then((result) => {
                console.log("Result all promise", result[0].rows[0]);
                console.log("Result all promise", result[1].rows[0]);

                res.render("thanks", {
                    title: "thanks",
                    totalSigners: result[1].rows[0].count,
                    signatureSrc: result[0].rows[0].signature,
                    cookie: true,
                });
            })
            .catch((err) => console.log("All prom Error", err));
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
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.redirect("/");
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
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

/* -------------------------------
          APP     POST
-------------------------------*/
app.post("/petition", (req, res) => {
    // console.log("req.session.userId: ", req.session.userId);
    // console.log("req.session.signId ", req.session.userIdd);
    // We have to grab what ir in the hidden input.
    // console.log("bodx submit petition", req.body.signature);
    db.addSigner(req.session.userId, req.body.signature)
        .then((results) => {
            // signId = signatureId
            req.session.signId = results.rows[0].id;
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
                });
        })
        .catch((err) => {
            //give a msg on HB that user exists, then redirect with 2 sec delay
            console.log("User exists. redirect to log-in ", err);
            res.redirect("login");
        });
});

app.post("/login", (req, res) => {
    db.getUserByEmil(req.body.email).then((result) => {
        return bcrypt
            .compare(req.body.password, result.row[0].password)
            .then((hashedPass) => {
                if (!hashedPass) {
                    console.log("ERROR, FAIL TO LOAD PETITION");
                    res.render("login");
                    //adding with HB ERROR msg
                } else if (hashedPass) {
                    if (req.session.signId) {
                        res.render("thanks");
                    } else {
                        req.session.userId = result.row[0];
                        res.redirect("petition");
                    }
                }
            })
            .catch((err) => {
                console.log("CATCH ERROR OF POST LOGIN PAGE QUERY ", err);
                res.redirect("login");
            });
    });
});

app.post("/profile", (req, res) => {
    if(/*user entered data to at least one field*/){
        if(/* if 'http://', 'https://' or '//' present, if not throw it out */){

        }
    db.userProfileDetails(req.body, /* user id from session*/)
        .then(() => {
            res.redirect("petition");
        })
        .catch((err) => {
            console.log("ERROR, PROFILE POST REQUEST FAILED ", err);
        });
    }
    else{
        res.redirect("petition");
    }

});

app.listen(PORT, () => console.log("you got this petition..."));


for (let key  it's in there yeah always going to love your not sure what the fuck I don't know if you're in your ear)
   for(let i = 0; i < req.body.length; i++){ it's in there yeah always cancel love yeah not sure what the fuck I don't know if you're in your ear and it's like mega hots yeah always going to love your not sure what the fuck I don't know if you're in your ear and it's like mega hot rather far is wrong with this what are you up to are you have someone in your computer what the fuck is it like a mega hot milk somebody took my computer. No dude somebody just hacked my computer
  
      if(req.body[i]){
          if(req.bo yeah always going to love your not sure what the fuck I don't know if you're in your ear and it's like mega hot rather far is wrong with this what are you up to are you have someone in your computer what the fuck is it like a mega hot milk somebody took my computer. No dude somebody just hacked my computer what the fuckdy.website && (req.body.website[0] === "h" || req.body.website[0] === "/")){
                db.userProfileDetails().then(()=>{ yeah always going to love your not sure what the fuck I don't know if you're in your ear and it's like mega hot rather far is wrong with this what are you up to are you have someone in your computer
                res.redirect("petition");
        })
    }
        }
        db.userProfileDetails().then(()=>{
            
        })
    
   }
 


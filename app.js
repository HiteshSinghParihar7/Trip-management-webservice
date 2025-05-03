const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const MongoStore = require('connect-mongo');
const methodOverride = require("method-override"); 
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
require('dotenv').config();


app.set("view engine", "ejs");
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
MONGO_URL = "mongodb://127.0.0.1:27017/trips";
//const dbUrl = "mongodb+srv://user77:test1234@cluster0.qwfdrqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main().then((req, res) => {
    console.log("connected to db")
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("Error in Mongo session store", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000 ,
        maxAge: 7*24*60*60*1000 ,
        httpOnly:true
    },
};


app.get("/", (req, res) => {
    res.send("Hi i am root");
});

app.use(session(sessionOptions));
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get("/about", (req, res) => {
    res.render("listings/About.ejs");
});
app.get("/contact", (req, res) => {
    res.render("listings/Contact.ejs");
});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});


app.listen(8080, () => {
    console.log("server is listening");
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs",{err});
});





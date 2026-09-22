if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const dbURL = process.env.ATLASDB_URL;
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const session = require("express-session");
const {MongoStore} = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");


main()
.then(() =>{
    console.log("connected to DB");
})
.catch((err) =>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbURL);
    
}

app.set("view enjine" ,"ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded ({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

      const store =  MongoStore.create({
         mongoUrl:dbURL,
         crypto:{
            secret:process.env.SECRET,
         },
         touchAfter: 24*3600,

     });

     store.on("error" , () =>{
        console.log("ERROR in Mogno Session store", err);
     });

const sessionOptions = {
    store,
     secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie :{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    },
    
};




// app.get("/", (req, res) =>{
//     res.send("working");
// })

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req , res , next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async (req ,res) =>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "student",

//     })

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter );



// app.get("/", (req, res) =>{
//     res.send("working");
// })

 
app.all(/(.*)/ , (req,res,next) =>{
    next(new ExpressError(404, "Page not found!"));
})  

app.use((err, req,res,next) =>{
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong";
    res.status(statusCode).render("lisitngs/error.ejs" , {message});
    // res.status(statusCode).send(message);
});

app.listen("8080", (req ,res) =>{
    console.log("the server is listening");
})
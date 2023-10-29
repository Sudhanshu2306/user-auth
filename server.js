if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


// Important Libraries that we have installed using npm
const express = require('express')
const app = express()
const bcrypt = require("bcryptjs") // importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

initializePassport(
    passport,
    email => users.find(user => user.email ===email),
    id => users.find(user => user.id===id)
)

const users = []

const PORT = 3000

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //We wont recieve the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))


app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

app.post("/register", checkNotAuthenticated, async (req,res)=>{
    try{
        const hashedpassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedpassword,
        })
        console.log(users); //display newly registered users 
        res.redirect("/login")

    } catch(e){
        console.log(e);
        res.redirect("/register")
    }
})

// Routes Start here
app.get('/',checkAuthenticated, (req,res)=>{
    res.render("index.ejs",{name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req,res)=>{
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req,res)=>{
    res.render("register.ejs")
})
// End of Routes

app.delete("/logout", (req,res)=>{
    req.logOut(req.user, err =>{
        if(err) return next(err)
        res.redirect("/login")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}
function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}


app.listen(PORT)
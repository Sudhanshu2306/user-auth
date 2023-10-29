const localStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")

function initialize(passport, getUserByEmail, getUserById){
    // function to authenticate users
    const authenticateUsers = async (email, password, done) =>  {
        // get users by email
        const user = getUserByEmail(email)
        if(user == null){
            return done(null, false, {message: "no user found with that email"})
        }
        try{
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            }
            else{
                return done(null, false, {message: "Password incorrect"})
            }
        }catch(e) {
            console.log(e);
            return done(e)
        }
    }
    passport.use(new localStrategy({usernameField: 'email'}, authenticateUsers))
    passport.serializeUser((user, done) => done(null,user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id))
    })

}

module.exports = initialize
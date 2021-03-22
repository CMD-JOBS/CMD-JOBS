const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')



function initialize(passport,getUserByEmail, getUserById) {
    const aanmakenUser = async (email, password, done) => { 
        const user = getUserByEmail(email)
        if(user == null){
            return done(null, false, {message:"Er is geen gebruiker met deze email"})
        }
        try {
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else{
                return done(null, false, {message:"Wachtwoord incorrect"})
            }
        }   catch{
                return done(e)
        }
    }

    passport.use(new localStrategy({ usernameField:'email'}, 
    aanmakenUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
    })
}

module.exports = initialize
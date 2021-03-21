if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const slug = require('slug');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const app = express();
const passport = require('passport')
const localStrategy = require('passport-local')

const flash = require('express-flash');
const session = require('express-session'); 

// Gebruikt voor Hashen passwords
const bcrypt = require('bcrypt');


const initializepassport = require('./passport-config')
initializepassport (
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)


// Tijdelijke opslag plaats voor gebruikers
const users = []

// const sass = require('node-sass');
const port = 3000;

// Aangeven waar onze statishce files zich bevinden  
app.use(express.static('static'));

// Template engine opgeven
app.engine('hbs', hbs({extname: 'hbs'}));
app.set('view engine', 'hbs');
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


// Zorgt dat je de info uit textvelden mee kan requiren met een post functie
app.use(express.urlencoded({extended: false}))

// Routes
app.get('/',checkNotAuthenticated, (req, res) => {
  res.render('homepagina')
});

app.post('/', passport.authenticate('local', {
  successRedirect: '/resultaten',
  failureRedirect: '/',
  failureFlash: true
}))

app.get('/resultaten',checkAuthenticated, (req, res) => {
  res.render('resultaten')
});

app.get('/account', (req, res) => {
  res.render('account')
});

app.get('/registreren',checkNotAuthenticated, (req, res) => {
  res.render('registreren')
});

app.post('/registreren', async (req, res) => {
  try {
    const hashedWachtwoord = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedWachtwoord
    })
    res.redirect('/')
  } catch{
    res.redirect('/registreren')
  }
  console.log(users)
})

//veiligheid en zorgen dat iemand is ingelogt voordat hij bij de index kan
function checkAuthenticated(req, res, next) {
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
  if(req.isAuthenticated()){
    res.redirect('/resultaten')
  }
  next()
}


// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
})



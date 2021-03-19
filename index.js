const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const slug = require('slug');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const app = express();
// Gebruikt voor Hashen passwords
const bcrypt = require('bcrypt');

// Tijdelijke opslag plaats voor gebruikers
const gebruikers = []

// const sass = require('node-sass');
const port = 3000;

// Aangeven waar onze statishce files zich bevinden  
app.use(express.static('static'));

// Template engine opgeven
app.engine('hbs', hbs({extname: 'hbs'}));
app.set('view engine', 'hbs');

// Zorgt dat je de info uit textvelden mee kan requiren met een post functie
app.use(express.urlencoded({extended: false}))

// Routes
app.get('/', (req, res) => {
  res.render('homepagina')
});

app.post('/', (req, res) => {
  
})

app.get('/resultaten', (req, res) => {
  res.render('resultaten')
});

app.get('/account', (req, res) => {
  res.render('account')
});

app.get('/registreren', (req, res) => {
  res.render('registreren')
});

app.post('/registreren', async (req, res) => {
  try {
    const hashedWachtwoord = await bcrypt.hash(req.body.password, 10)
    gebruikers.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedWachtwoord
    })
    res.redirect('/')
  } catch{
    res.redirect('/registreren')
  }
  console.log(gebruikers)
})


// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
})

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
// const sass = require('node-sass');
const port = 3000;

// Aangeven waar onze statishce files zich bevinden  
app.use(express.static('static'));

// Template engine opgeven
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');


// Routes
app.get('/', (req, res) => {
  res.render('homepagina')
});

app.get('/resultaten', (req, res) => {
  res.render('resultaten')
});

app.get('/account', (req, res) => {
  res.render('account')
});

// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
})

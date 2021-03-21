const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const slug = require('slug');
const multer = require('multer');
const app = express();
const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb')
// const sass = require('node-sass');

console.log(process.env.TESTVAR);

const port = 3000;

app.use(express.static('static'));

// Template engine opgeven
app.engine('hbs', hbs({
  extname: 'hbs'
}));
app.set('view engine', 'hbs');

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
     callback(null, 'static/uploads');
  },

  filename: function (req, file, callback){
     callback(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({
  storage: storage,
  limits: {
     fileSize: 1024 * 1024 * 3,
  },
});

//Database Jorn
// object id is de id van van dne database
// require mongodb

// test voor database
console.log(process.env.TESTVAR);

let db = null;
let resultatenCollection = null;
let opgeslagenCollection = null;
// database dingen* voor collectie, dit moet aangepast worden

// get URI from .env file
const uri = process.env.DB_URI;
// make connection to database
const options = { useUnifiedTopology: true };
const client = new MongoClient(uri, options);
// function conncectDB JORN
async function databaseJorn() {
  await client.connect();
  db = await client.db(process.env.DB_NAME);
  resultatenCollection = await db.collection('resultaten');
  opgeslagenCollection = await db.collection('opgeslagen');
}
// collection moet aangepast worden

// Routes
app.get('/', (req, res) => {
  res.render('homepagina')
});

app.get('/resultaten', (req, res) => {
  res.render('resultaten')
});

// app.get('/profiel', async (req, res) => {
//   let profielen = {}
//   profielen = await db.collection('profielen').find({}, {
//   }).toArray();
//   res.render('profiel', {
//     title: "test",
//     profielen,
//   });
// });


app.get('/profiel', (req, res) => {
  res.render('profiel')
});


app.post('/profiel', async (req, res) => {

  console.log(req.body.functie);

  await databaseJorn()

  .then(() => {
    // if succesful connection is made show a message
    console.log('we have a connection to mongo!');
  })
  .catch((error) => {
    // if connection is unsuccesful, show errors dsds
    console.log(error);
  });

  const profielen = {
    "biografie": req.body.biografie,
    "opleidingsNiveau": req.body.opleidingsNiveau,
    "functie": req.body.functie,
    "dienstverband": req.body.dienstverband,
    "bedrijfsgrootte": req.body.bedrijfsgrootte
  };
  await db.collection('profielen').insertOne(profielen);

  res.render('profiel', {
    title: "test",
    profielen
  })
});


// app.post('/profiel', async (req, res) => {
//   const id = slug(req.body.naam);
//   const profiel = {
//     "voornaam": req.body.vNaam,
//     "achternaam": req.body.aNaam,
//     "biografie": req.body.biografie,
//     "opleidingsNiveau": req.body.opleidingsNiveau,
//     "functie": req.body.functie,
//     "dienstverband": req.body.dienstverband,
//     "bedrijfsgrootte": req.body.bedrijfsgrootte
//   };
//   await db.collection('profielen').insertOne(profiel);
//   res.render('profiel', {
//     title: "hoi",
//     profiel
//   })
// });


// TEST
// TEST

// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
})
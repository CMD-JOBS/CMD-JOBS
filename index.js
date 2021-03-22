const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const slug = require('slug');
const multer = require('multer');
const app = express();
const dotenv = require('dotenv').config();
const {
  MongoClient
} = require('mongodb');
const {
  ObjectID
} = require('mongodb')
// const sass = require('node-sass');

console.log(process.env.TESTVAR);

const port = 3000;


// let db = null;
// let resultatenCollection = null;
// let opgeslagenCollection = null;

//   const uri = process.env.DB_URI
//   const options = {
//     useUnifiedTopology: true
//   };
//   const client = new MongoClient(uri, options)


//   // await client.connect();
//   // db = await client.db(process.env.DB_NAME)


// async function databaseEmre() {
//   await client.connect();
//   db = await client.db(process.env.DB_NAME);
//   resultatenCollection = await db.collection('resultaten');
//   opgeslagenCollection = await db.collection('opgeslagen');
// }

let db = null;

// functie om de database te connecten
async function connectDB() {
  const uri = process.env.DB_URI
  const options = {
    useUnifiedTopology: true
  };
  const client = new MongoClient(uri, options)
  await client.connect();
  db = await client.db(process.env.DB_NAME)
}
connectDB()
  .then(() => {
    // Het verbinden met de DB is gelukt
    console.log('Feest!')
  })
  .catch(error => {
    // Het verbinden met de DB is niet gelukt
    console.log(error)
  });

// Aangeven waar onze statische files zich bevinden  
app.use(express.static('static'));

//BodyParser
app.use(bodyParser.urlencoded({
  extended: false
}));

// Template engine opgeven
app.engine('hbs', hbs({
  extname: 'hbs'
}));
app.set('view engine', 'hbs');

// Routes
app.get('/', (req, res) => {
  res.render('homepagina')
});

app.get('/resultaten', (req, res) => {
  res.render('resultaten')
});

app.get('/profiel', async (req, res) => {

  await connectDB()

    .then(() => {
      // if succesful connection is made show a message
      console.log('we have a connection to mongo!');
    })
    .catch((error) => {
      // if connection is unsuccesful, show errors
      console.log(error);
    });


  // profiel

  let profielen = {};
  profielen = await db.collection('profielen').find().toArray();
  const profiel = profielen.find(profiel => profiel.id == "YunusEmreAlkan");
  if (profiel === undefined) {
    res.status(404).send('Sorry deze pagina is niet beschikbaar!')
  } else {
    res.render('profiel', {
      title: 'Profiel test',
      profiel
    });
  }
});

app.post('/profiel', async (req, res) => {

  await connectDB()

    .then(() => {
      // if succesful connection is made show a message
      console.log('we have a connection to mongo!');
    })
    .catch((error) => {
      // if connection is unsuccesful, show errors
      console.log(error);
    });

  const profiel = {
    "biografie": req.body.biografie,
    "opleidingsNiveau": req.body.opleidingsNiveau,
    "functie": req.body.functie,
    "dienstverband": req.body.dienstverband,
    "bedrijfsgrootte": req.body.bedrijfsgrootte
  };

  await db.collection('profielen').insertOne(profiel);
  console.log("Data is verzonden, voorbeeld: " + req.body.functie);
  res.render('profiel', {
    title: "test",
    profiel
  })
});


// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
})
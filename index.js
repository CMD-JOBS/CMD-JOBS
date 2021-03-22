const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
// const slug = require('slug');
// const multer = require('multer');
// const { MongoClient } = require('mongodb')

const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb')     ;
// object id is de id van van dne database
// require mongodb

const app = express();
// const sass = require('node-sass');
const port = 3000;

// test voor database
console.log(process.env.TESTVAR);

let db = null;
let resultatenCollection = null;
let opgeslagenCollection = null;
// database dingen* voor collectie, dit moet aangepast worden

// function conncectDB
async function connectDB() {
  // get URI from .env file
  const uri = process.env.DB_URI;
  // make connection to database
  const options = { useUnifiedTopology: true };
  const client = new MongoClient(uri, options);
  await client.connect();
  db = await client.db(process.env.DB_NAME);
  resultatenCollection = await db.collection('resultaten');
  opgeslagenCollection = await db.collection('opgeslagen');
}
// collection moet aangepast worden

connectDB()
  .then(() => {
    // if succesful connection is made show a message
    console.log('we have a connection to mongo!');
  })
  .catch((error) => {
    // if connection is unsuccesful, show errors
    console.log(error);
  });


// Aangeven waar onze statische files zich bevinden  
app.use(express.static('static'));

// Template engine opgeven
app.engine('hbs', hbs({extname: 'hbs'}));
app.set('view engine', 'hbs');

// bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
  res.render('homepagina')
});

// ashley werkt in deze route 
app.get('/resultaten', async (req, res) => {
  // de functie voor de opslaan  optie
  const objectID = new ObjectID('6057e96025113f2db486f18d');
 opgeslagenCollection.find({ _id: objectID }, (err, opslaanObject) => {

  if (err) {
    console.log(err); // als er een error dan showt het een error
  } else if (opslaanObject.opgeslagen) {

    resultatenCollection // in de profile collection wordt die profiel verwijdert
      .find({ _id: { $in: opslaanObject.opgeslagen } }) // nin = not in array //find id uit de database
      .toArray((err, users) => {
        // add de gelikede profielen worden in een array geplaatst en in de collectie van likes.
        if (err) {
          console.log(err);
        } else {
          res.render('resultaten', {
            title: 'Een lijst met resultaten',
            users,
          });
        }
      });
  } else {
    // anders wordt het aan een array toegevoed
  resultatenCollection.find({}).toArray((err, users) => {
      if (err) {
        console.log(err);
      } else {
        res.render('resultaten', {
          title: 'Een lijst met resultaten',
          users,
        });
      }
    });
  }
});
});

app.get('/opgeslagenvacatures', async (req, res) => {
  const objectID = new ObjectID('6057e96025113f2db486f18d');
  // object van de eerste id
  opgeslagenCollection.findOne({ _id: objectID }, (err, opslaanObject) => {
    if (err) {
      console.log(err);
    } else if (opslaanObject.opgeslagen) {
      resultatenCollection
        .find({ _id: { $in: opslaanObject.opgeslagen } }) // wanneer er een profiel wordt geliked
        // wordt deze in de saved profiles pagina bewaard
        .toArray((err, users) => {
          if (err) {
            console.log(err);
          } else {
            res.render('opgeslagenvacatures', {
              title: 'opgeslagen vacatures',
              users,
            });
          }
        });
    } else {
      res.render('opgeslagenvacatures', {
        title: 'opgeslagen vacatures',
      });
    }
  });
});

// het submitten van de button
app.post('/opgeslagenvacatures', async (req, res) => {
  const objectID = new ObjectID('66057e96025113f2db486f18d');
  const opgeslagenVacatures = new ObjectID(req.body.userid); // is de button van de like button

  await opgeslagenCollection.update(

    /*
     * het update de database, door de push, door het te pushen wordt er er een
     *  object in de array gezet in de likes profile
     */
    { _id: objectID },
    { $push: { opgeslagen: opgeslagenVacatures } }, // push is om meer objecten in de array.
  );

  opgeslagenCollection.findOne({ _id: objectID }, (err, opslaanObject) => {
    if (err) {
      console.log(err);
    } else {
      resultatenCollection
        .find({ _id: { $in: opslaanObject.opgeslagen } }) // de collectie likes komen in de pagina van de savedprofiles
        .toArray((err, users) => {
          if (err) {
            console.log(err);
          } else {
            res.render('opgeslagenvacatures', {
              // dit is aan andere route
              title: 'opgeslagen vacatures',
              users,
            });
          }
        });

      /*
       * als het in de savedprofile pagina staat, of in de likes collectie
       * wordt het verwijdert ui te de recommendation pagina
       */
      resultatenCollection
        .find({ _id: { $in: opslaanObject.opgeslagen } })
        .toArray((err, users) => {
          if (err) {
            console.log(err);
          } else {
            console.log(users);
          }
        });
    }
  });
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

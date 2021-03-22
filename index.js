 if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const slug = require('slug');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('mongodb');
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


let db = null;
let resultatenCollection = null;
let opgeslagenCollection = null;


// functie om de database te connecten

async function connectDB() {
  const uri = process.env.DB_URI
  const options = {
    useUnifiedTopology: true
  };
  const client = new MongoClient(uri, options)
  await client.connect();
  db = await client.db(process.env.DB_NAME)
  resultatenCollection = await db.collection('resultaten');
  opgeslagenCollection = await db.collection('opgeslagen');
}


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

// Routes
app.get('/',checkNotAuthenticated, (req, res) => {
  res.render('homepagina')
});

app.post('/', passport.authenticate('local', {
  successRedirect: '/resultaten',
  failureRedirect: '/',
  failureFlash: true
}))

// ashley werkt in deze route 
app.get('/resultaten',checkAuthenticated, async (req, res) => {
  // de functie voor de opslaan  optie
  const objectID = new ObjectID('605863f4615b2a027a3008b5');
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
  const objectID = new ObjectID('605863f4615b2a027a3008b5');
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
  const objectID = new ObjectID('605863f4615b2a027a3008b5');
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

app.get('/profielToevoegen', (req, res) => {
  res.render('profielToevoegen')
});

//
app.post('/profielToevoegen', upload.single('pFoto'), async (req,res) => {
  db
  await connectDB()
  .then(() => {
    // if succesful connection is made show a message
    console.log('we have a connection to mongo!');
  })
  .catch((error) => {
    // if connection is unsuccesful, show errors
    console.log(error);
  });
  
  const id = slug(req.body.vNaam + req.body.aNaam);
  const pFotoPath = 'uploads/' + req.file.filename;
  const profiel = {
                    'id': id, 
                    'profielFoto': pFotoPath, 
                    'voornaam': req.body.vNaam, 
                    'achternaam': req.body.aNaam, 
                    'opleidingsNiveau': req.body.opleidingsNiveau, 
                    'biografie': req.body.biografie, 
                    'functie': req.body.functie, 
                    'dienstverband': req.body.dienstverband,
                    'bedrijfsgrootte': req.body.bedrijfsgrootte
                  };
  await db.collection('profielen').insertOne(profiel);
  res.render('homepagina', {title: 'Nieuw Profiel', profiel})
});
  

app.get('/registreren',checkNotAuthenticated, (req, res) => {
  res.render('registreren')
});

app.post('/registreren', async (req, res) => {
  await connectDB()
  .then(() => {
    // if succesful connection is made show a message
    console.log('we have a connection to mongo!');
  })
  .catch((error) => {
    // if connection is unsuccesful, show errors
    console.log(error);
  });
  try {
    // Database inloggen gebruiker
    const hashedWachtwoord = await bcrypt.hash(req.body.password, 10)
    const gebruiker = {
      email: req.body.email,
      password: hashedWachtwoord
    }
    await db.collection('profielen').insertOne(gebruiker);

    //inlog gebruiker

    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedWachtwoord
    })
    res.render('profielToevoegen', {gebruiker});
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



// Profiel pagina

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
    // res.status(404).send('Sorry deze pagina is niet beschikbaar!')
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


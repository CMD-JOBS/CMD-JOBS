if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
};

// requires
const express = require('express');
const hbs = require('express-handlebars');
const slug = require('slug');
const multer = require('multer');
const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const app = express();
const passport = require('passport')
const localStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const session = require('express-session'); 
const bcrypt = require('bcryptjs');
const port = 3000;
// const sass = require('node-sass');

// Aangeven waar onze statishce files zich bevinden  
app.use(express.static('static'));

// Template engine opgeven
app.engine('hbs', hbs({extname: 'hbs'}));
app.set('view engine', 'hbs');

//BodyParser
app.use(express.urlencoded({ extended: false }));

//Express Session
app.use(session({
  secret: 'back-end is echt leuk',
  resave: true,
  saveUninitialized: true
}));

//Passport middelware
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

//Global
app.use((req, res, next) => {
  res.locals.succes_msg = req.flash('succes_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//passport
passport.use(
  new localStrategy({ usernameField: 'email' }, (email, password, done)=>{
    // Match user
    User.findOne({ email: email})
    .then(user => {
      if(!user){
        return done(null, false, {message: 'Email bestaat nog niet'})
      }

      // Match Password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else{
          return done(null, false, {message:'Wachtwoord fout'})
        }
      });
    })
    .catch(err => console.log(err));
  })
);

passport.serializeUser((user, done) =>{
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id,(err, user) => {
    done(err, user);
  });
});

//Authenticate check
function ensureAuthenticated (req, res, next) {
  if(req.isAuthenticated()){
    return next();
  }
  req.flash('error_msg','Werkt niet');
  res.redirect('/')

}

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


//Database connectie functie
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }

});

const User = mongoose.model("User", UserSchema);

const uri = process.env.DB_URI;

mongoose.connect(uri, {useNewUrlParser: true})
.then(() => console.log('MongoDB connectie :)'))
.catch(err => console.log(err));

let db = null;
let resultatenCollection = null;
let opgeslagenCollection = null;


// resultatenCollection = await db.collection('resultaten');
// opgeslagenCollection = await db.collection('opgeslagen');


// Routes

app.get('/', (req, res) => {
  res.render('inloggen')
});

app.get('/registreren', (req, res) => {
  res.render('registreren')
});

app.post('/registreren', (req, res) => {
  const { email, password} = req.body;
  let errors = [];

  //Controleer benodigden velden
  if (!email || !password){
    errors.push({message:'please invullen'});
  }

  //Wachtwoord lengte instellen
  if(password.length <2) {
    errors.push({message: 'wachtwoord te kort'})
  }

  if(errors.length >0){
    res.render('registreren',{
      errors,
      email,
      password
    })
  } else {
    // Inlog goedkeuring
    User.findOne({ email: email })
    .then(user =>{
      if(user) {
        //Gebruiker bestaat
        errors.push({message:"Email al in gebruik"});
        res.render('registreren',{
          errors,
          email,
          password
        });
      } else{
        const newUser = new User({
          email,
          password
        });
        //hashedPassword
        bcrypt.genSalt(10, (err, salt) => 
          bcrypt.hash(newUser.password, salt,(err, hash)=>{
            if(err) throw err;
            // Verander naar Hash password
            newUser.password = hash;
            //save gebruiker
            newUser.save()
              .then(user =>{
                req.flash('succes_msg','geregistreerd');
                res.render('profielToevoegen');
              })
              .catch(err => console.log(err));
        }));
      }
    });
  }
});

// Login handle
app.post('/', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect:'/resultaten',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

app.get('/profielToevoegen', ensureAuthenticated,(req, res) => {
  res.render('profielToevoegen')
});

//
app.post('/profielToevoegen', upload.single('pFoto'), async (req,res) => {
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
  res.redirect('/');
});


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

  let profielen = {};
  profielen = await db.collection('profielen').find().toArray();
  const profiel = profielen.find(profiel => profiel.id == "jornveltrop");
  if (profiel === undefined) {
    res.status(404).send('Sorry deze pagina is niet beschikbaar!')
  } else {
    res.render('profiel', {
      title: 'Profiel test',
      profiel
    });
  }
});

app.post('/profiel', ensureAuthenticated,async (req, res) => {

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

// ashley werkt in deze route 
app.get('/resultaten',ensureAuthenticated, async (req, res) => {
  res.render('resultaten')
  // de functie voor de opslaan  optie
//   const objectID = new ObjectID('6058ba04e8d259e2d0e7def7');
//  opgeslagenCollection.find({ _id: objectID }, (err, opslaanObject) => {

//   if (err) {
//     console.log(err); // als er een error dan showt het een error
//   } else if (opslaanObject.opgeslagen) {

//     resultatenCollection // in de profile collection wordt die profiel verwijdert
//       .find({ _id: { $in: opslaanObject.opgeslagen } }) // nin = not in array //find id uit de database
//       .toArray((err, users) => {
//         // add de gelikede profielen worden in een array geplaatst en in de collectie van likes.
//         if (err) {
//           console.log(err);
//         } else {
//           res.render('resultaten', {
//             title: 'Een lijst met resultaten',
//             users,
//           });
//         }
//       });
//   } else {
//     // anders wordt het aan een array toegevoed
//   resultatenCollection.find({}).toArray((err, users) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.render('resultaten', {
//           title: 'Een lijst met resultaten',
//           users,
//         });
//       }
//     });
//   }
// });
});

app.get('/opgeslagenvacatures',ensureAuthenticated, async (req, res) => {
  const objectID = new ObjectID('6058ba04e8d259e2d0e7def7');
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
  const objectID = new ObjectID('6058ba04e8d259e2d0e7def7');
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

// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
});


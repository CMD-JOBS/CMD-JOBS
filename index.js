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

//passport
passport.use(
  new localStrategy({ usernameField: 'email' }, (email, password, done)=>{
    // Match user
    userModel.findOne({ email: email})
    .then(user => {
      if(!user){
        return done(null, false, {message: 'Email bestaat nog niet'})
      }

      // Match Password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch){
        req.session.user = user
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
  userModel.findById(id,(err, user) => {
    done(err, user);
  });
});

//Authenticate check

function checkAuthenticated (req, res, next) {
  if(req.isAuthenticated()){
  return next()
  }
  res.redirect('/')
  };

function checkNotAuthenticated (req, res, next) {
  if(req.isAuthenticated()){
  res.redirect('/resultaten');
  };
  next();
};

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
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profielFoto: {
    type: String,
    required: false
  },
  voornaam: {
    type: String,
    required: false
  },
  achternaam: {
    type: String,
    required: false
  },
  opleidingsNiveau: {
    type: String,
    required: false
  },
  biografie: {
    type: String,
    required: false
  },
  functie: {
    type: String,
    required: false
  },
  dienstverband: {
    type: String,
    required: false
  },
  bedrijfsgrootte: {
    type: String,
    required: false
  },
  opgeslagen: {
    type: Array,
    required: false
  }
});

const vacaturesSchema = new mongoose.Schema({
  vacatureTitel: {
    type: String,
    required: true
  },
  bedrijfsNaam: {
    type: String,
    required: true
  },
  plaats: {
    type: String,
    required: true
  },
  salaris: {
    type: String,
    required: true
  },
  vacatureInformatie: {
    type: String,
    required: true
  }
});

const opgeslagenSchema = new mongoose.Schema({
  opgeslagen: {
    type: Array,
    required: false
  }
});

const userModel = mongoose.model('users', userSchema);
const vacaturesCollection = mongoose.model('vacatures', vacaturesSchema);
const opgeslagenCollection = mongoose.model('opgeslagen', opgeslagenSchema);
const uri = process.env.DB_URI;

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB connectie :)'))
.catch(err => console.log(err));

// Routes
app.get('/', checkNotAuthenticated, (req, res) => {
  const errors = req.flash();
  res.render('inloggen', { errors })
});

// Login handle
app.post('/', (req, res, next) => {
  passport.use(
    new localStrategy({ usernameField: 'email' }, (email, password, done)=>{
      // Match user
      userModel.findOne({ email: email})
      .then(user => {
        if(!user){
          return done(null, false, {message: 'Email bestaat nog niet'})
        }
  
        // Match Password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch){
          req.session.user = user
            return done(null, user);
          } else{
            return done(null, false, {message:'Wachtwoord fout'})
          }
        });
      })
      .catch(err => console.log(err));
    })
  );
  passport.authenticate('local', {
    successRedirect:'/resultaten',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

app.get('/registreren', checkNotAuthenticated, (req, res) => {
  res.render('registreren')
});

app.post('/registreren', async (req, res) => {
  const { email, password, password2} = req.body;
  let errors = [];
  
  //Controleer benodigden velden
  if (!email || !password || !password2){
    errors.push({message:'please invullen'});
  }

  //Check passwords match
  if(password !== password2) {
  errors.push({ message:'Wachtwoorden komen niet overeen'});
}

  //Wachtwoord lengte instellen
  if(password.length < 6) {
    errors.push({message: 'wachtwoord te kort'})
  }

  await userModel.findOne({ email: email })
  .then(user =>{
    if(user) {
      //Gebruiker bestaat
      errors.push({message:"Email al in gebruik"});
  }});

  if(errors.length){
    console.log(errors);
    res.render('registreren',{
      errors,
      email,
      password
    })
  } else {
      const newUser = new userModel({
        email,
        password
      });
    //hashedPassword
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt,(err, hash)=>{
        if(err) throw err;
        // Verander naar Hash password
        newUser.password = hash;
        //save gebruiker
        newUser.save()
          .then(user =>{
            req.flash('succes_msg','geregistreerd');
            res.redirect('/');
          })
          .catch(err => console.log(err));
      })
        });
        }
});

app.get('/profielToevoegen', checkAuthenticated,(req, res) => {
  res.render('profielToevoegen')
});

//
app.post('/profielToevoegen', upload.single('pFoto'), async (req,res) => {
  const pFotoPath = 'uploads/' + req.file.filename;
  const huidigeUserData = req.session.user;
  const huidigeUserID = huidigeUserData._id;

  await userModel.findOneAndUpdate({_id: huidigeUserID}, {
      profielFoto: pFotoPath, 
      voornaam: req.body.vNaam, 
      achternaam: req.body.aNaam, 
      opleidingsNiveau: req.body.opleidingsNiveau, 
      biografie: req.body.biografie, 
      functie: req.body.functie, 
      dienstverband: req.body.dienstverband,
      bedrijfsgrootte: req.body.bedrijfsgrootte
    }, (error, data) => {
        if (error) {
          console.log(error);
        }
      }
  );
  await userModel.findOne({ _id: huidigeUserID })
      .then(user => {
        //Fill session with user data
        req.session.user = user
      })
      .catch(err => console.log(err));
  res.redirect('/resultaten');
});


// Profiel pagina
app.get('/profiel', checkAuthenticated, (req, res) => {
  const profiel = req.session.user;
  res.render('profiel', { layout: 'profielMain', profiel });
});

app.post('/profiel', async (req, res) => {
  const huidigeUserData = req.session.user;
  const huidigeUserID = huidigeUserData._id;

  await userModel.findOneAndUpdate({_id: huidigeUserID}, {
      opleidingsNiveau: req.body.opleidingsNiveau, 
      biografie: req.body.biografie, 
      functie: req.body.functie, 
      dienstverband: req.body.dienstverband,
      bedrijfsgrootte: req.body.bedrijfsgrootte
    }, (error, data) => {
        if (error) {
          console.log(error);
        } else {
          console.log(data);
        }
      }
  );
  await userModel.findOne({ _id: huidigeUserID })
      .then(user => {
        req.session.user = user
      })
      .catch(err => console.log(err));
  res.redirect('/profiel');
});

// ashley werkt in deze route 
app.get('/resultaten', checkAuthenticated, async (req, res) => {
  const userData = req.session.user;
  if (userData.voornaam == undefined) {
    res.redirect('/profielToevoegen');
  } else {
    vacaturesCollection.find({})
    .where('opleidingsNiveau').equals(req.session.user.opleidingsNiveau)
    .where('functie').equals(req.session.user.functie)
    .where('dienstVerband').equals(req.session.user.dienstverband)
    /*.where('bedrijfsgrootte').equals(req.session.user.bedrijfsgrootte)*/
    .lean()
    .exec((err, vacatures) => {
      if (err) {
        console.log(err);
      } else {
        if (vacatures.length === 0) {
          console.log(vacatures.length);
          let errors = [];
          errors.push({message:"Helaas er zijn geen vacatures voor jou"});
          console.log(errors)
          res.render('resultaten', { title: 'Een lijst met resultaten', vacatures, errors});
        } 
        res.render('resultaten', { title: 'Een lijst met resultaten', vacatures});
      }
    });
  }
});

app.post('/resultaten', async (req, res) => {
  const huidigeUserData = req.session.user;
  const huidigeUserID = huidigeUserData._id;

  await userModel.findOneAndUpdate({_id: huidigeUserID}, {
    $addToSet: { opgeslagen: req.body.vacatureID }
    }, (error, data) => {
        if (error) {
          console.log(error);
        };
      }
  );
  await userModel.findOne({ _id: huidigeUserID })
      .then(user => {
        //Fill session with user data
        req.session.user = user
      })
      .catch(err => console.log(err));
  res.redirect('/resultaten');
});

app.get('/opgeslagenvacatures',checkAuthenticated, async (req, res) => {
  const huidigeUserData = req.session.user;
  const huidigeUserID = huidigeUserData._id;
  const huidigeUserOpgeslagen = huidigeUserData.opgeslagen;

  vacaturesCollection.find({'_id': { $in: huidigeUserOpgeslagen }}).lean()
  .exec((err, opgeslagenVacatures) => {
    if (err) {
      console.log(err);
    } else {
      if (opgeslagenVacatures.length === 0) {
        //Als er geen opgeslagen vacatures zijn
        let errors = [];
        errors.push({message:"Helaas je hebt nog geen vacatures opgeslagen"});
        res.render('opgeslagenvacatures', { title: 'Een lijst met resultaten', opgeslagenVacatures, errors});
      } 
      res.render('opgeslagenvacatures', { title: 'Een lijst met resultaten', opgeslagenVacatures});
    }
  });
});

// het submitten van de button
app.post('/opgeslagenvacatures', async (req, res) => {
  const huidigeUserData = req.session.user;
  const huidigeUserID = huidigeUserData._id;

  await userModel.updateOne({_id: huidigeUserID}, {
    $pull: { opgeslagen: req.body.vacatureID }
    }, (error, data) => {
        if (error) {
          console.log(error);
        } else {
          console.log(huidigeUserID, req.body.vacatureID);
        }
      }
  );
  await userModel.findOne({ _id: huidigeUserID })
      .then(user => {
        //Fill session with user data
        req.session.user = user
      })
      .catch(err => console.log(err));
  res.redirect('/opgeslagenvacatures');
});

// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
});
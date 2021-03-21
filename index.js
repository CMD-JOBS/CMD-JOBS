const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const slug = require('slug');
const multer = require('multer');
const { MongoClient } = require('mongodb')
const app = express();
// const sass = require('node-sass');
const port = 3000;

// Aangeven waar onze statishce files zich bevinden  
app.use(express.static('static'));

// Template engine opgeven
app.engine('hbs', hbs({extname: 'hbs'}));
app.set('view engine', 'hbs');

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
     callback(null, './uploads');
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
let db = null;

async function databaseJorn() {
  const uri = "mongodb+srv://Ashley:mongodbWW@cluster0.ivfex.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const options = { useNewUrlParser: true, useUnifiedTopology: true };
  const client = new MongoClient(uri, options);
  db = await client.db('users');
};

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

app.get('/profielToevoegen', (req, res) => {
  res.render('profielToevoegen')
});

app.post('/profielToevoegen', upload.single('pFoto'), async (req,res) => {
  await databaseJorn()
   .then(() => {
      //Succesvolle verbinding
      console.log('We have a connection to Mongo!')
   })
   .catch( error => {
      //Error bij verbinden
      console.log(error)
   });

  const id = slug(req.body.vNaam + req.body.aNaam);
  const pFotoPath = '../uploads/' + req.file.filename;
  const profiel = {
                    'id': id, 
                    'profileImg': pFotoPath, 
                    'firstName': req.body.vNaam, 
                    'lastName': req.body.aNaam, 
                    'opleidingsNiveau': req.body.opleidingsNiveau, 
                    'biografie': req.body.biografie, 
                    'functie': req.body.functie, 
                    'dienstverband': req.body.dienstverband,
                    'bedrijfsgrootte': req.body.bedrijfsgrootte
                  };
  await db.collection('profielen').insertOne(profiel);
  res.render('profielPagina', {title: 'Nieuw Profiel', profiel})

  client.close();
});

// 404 pagina
app.use(function (req, res, next) {
  res.status(404).send("Sorry ik heb niks kunnen vinden");
});

// Geeft de port terug die gebruikt wordt
app.listen(port, () => {
  console.log(`Gebruikte poort: ${port}!`)
})

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var deezerRouter = require('./routes/deezer');

var _ = require('underscore');

const MongoClient = require('mongodb').MongoClient;
const { default: axios } = require('axios');
const url = 'mongodb://localhost:27017';
const dbName = 'deezer';
let db;

MongoClient.connect(url, function(err, client) {
  db = client.db(dbName);
  console.log("Connected to mongo");
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/deezer', usersRouter);

app.use(cors({
  origin: 'http://localhost',
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options('*', cors())

app.all('', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  //Auth Each API Request created by user.
  next();
});

var currentCollection = "pop"

app.post('/getTest', (req,res) => {
 
  var body = req.body.body

  var collection =  body.genre

  if (collection !== currentCollection) {
    currentCollection = collection.toLowerCase()
  }  

  if (body.guessedArtists.length > 0) {
    query = { "id": { $nin: body.guessedArtists } }
  }
  else {
    query = {}
  }

  db.collection(currentCollection.toLowerCase()).find(query).toArray(function(err, result) {
    if (err) throw err;

    result = _.shuffle(result)

    res.json({
      choices : _.shuffle(result.slice(0, 3).map(r => r.name)),
      image : result[0].picture_medium,
      id : result[0].id
    })
  });
})

app.get('/getDbData', (req,res) => {
  db.collection(currentCollection).find().toArray(function(err, result) {
    if (err) throw err;
    res.json(result)
  });
})

app.get('/getTopSong', (req,res) => { 
  axios
      .get(`https://api.deezer.com/artist/${req.query.id}/top?limit=1`)
      .then(response =>{
        res.json({
          "title" : response.data.data[0].title,
          "preview" : response.data.data[0].preview
        })
      })
      .catch(e => {
        console.error("frr : "+e.toString())
        res.end(500)
      })
});

app.post('/sendAnswer', (req,res) => {
  var body = req.body.body
  
  db.collection(currentCollection.toLowerCase()).find({"name" : body.choice, "picture_medium" : body.image} ).toArray(function(err, result) {
    if (err) throw err;
    res.json({goodAnswer : result.length > 0} )
  });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

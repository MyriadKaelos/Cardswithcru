// call the packages we need
var express    = require('express')      // call express
var bodyParser = require('body-parser')
var app = express()     // define our app using express
const MongoClient = require('mongodb').MongoClient
const assert = require('assert');

// configure app to use bodyParser() and ejs
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs');

// get an instance of the express Router
var router = express.Router();

router.get('/',function(req, res) {
  res.render('index.ejs');
})

router.post('/logout', function(req,res) {

})
router.post('/startGame', function(req,res) {
  res.render('login.ejs')
})

router.post('/addUser', function(req,res) {
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      var data = req.body.name
      db.collection('users').insertOne({name:data})
      db.collection('users').find({}).toArray((err, users) => {
        if(err) {console.log(err)}
        res.render('add.ejs', {questions: questions,answers: answers,users: users})
      })
    })
  })
})
router.post('/addCards', function(req,res) {
  db.collection('questions').find({}).toArray((err, questions) => {
      db.collection('answers').find({}).toArray((err, answers) => {
        if(err) {console.log(err)}
        res.render('add.ejs', {questions: questions,answers: answers})
      })
    })
})

router.post('/newAnswer', function(req, res) {
  console.log("New answer sent.");  //logs to terminal
  var data = req.body.answer
  db.collection('answers').insertOne({answer:data})
  res.render('add.ejs');  //renders index page in browser
});

router.post('/newQuestion', function(req, res) {
  console.log("New question sent.");  //logs to terminal
  var data = req.body.question
  db.collection('question').insertOne({question:data})
  res.render('add.ejs');  //renders index page in browser
});


// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
//==========================================================
var db
MongoClient.connect('mongodb://yateslough:Yateslough1@ds029638.mlab.com:29638/cardswithcru',{ useNewUrlParser: true }, (err, client) => {
    if(err) console.log(err)
    console.log("Connected successfully to server");

    db = client.db('cardswithcru');
    app.listen(process.env.PORT || 3000,function(){
        console.log("listening on 3000");
        console.log("Our ears are open to your cries");
    });
})

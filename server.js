const MongoClient = require('mongodb').MongoClient;
var express       = require('express');
var bodyParser    = require('body-parser');
var app           = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','ejs');
var router = express.Router();
router.get('/',function(req, res) {
  res.render('index.ejs');
})
app.use('/', router);

router.post('/logout', function(req,res) {

})
router.post('startGame',function(req,res) {
  res.render('game.ejs')
})
//Renders the Log In page.
router.post('/login', function(req,res) {
  res.render('login.ejs', {user: "false"})
})

router.post('/addUser', function(req,res) {
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      var data = req.body.name
      db.collection('users').insertOne({name:data})
      res.render('login.ejs', {user:data})
    })
  })
})

//Renders the Add Cards Page.
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


router.post('/home', function(req, res) {
  res.render('index.ejs');
})
//XMLHttp
//=================
function getUsers() {
  db.collection('users').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
  })
}


//=================
// START THE SERVER
//==========================================================
MongoClient.connect('mongodb://yateslough:Yateslough1@ds029638.mlab.com:29638/cardswithcru', {useNewUrlParser:true}, (err, client) => {
    if(err) { console.log(err) }
    console.log("Connected successfully to server");
    db = client.db('cardswithcru')
    app.listen(process.env.PORT || 5000,function(){
        console.log("listening on 5000");
    });
});

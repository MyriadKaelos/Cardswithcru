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

// app.use('/', router);

router.post('/logout', function(req,res) {
  console.log(req.body.name);
  var data = req.body.name
  db.collection('users').deleteOne({name:data});
  res.render('index.ejs');
})

router.post('/restart', function(req,res) {
  db.collection('users').deleteMany({});
  res.render('index.ejs');
})

router.post('/startGame', function(req,res) {
  db.collection('answers').find({}).toArray((err, answers) => {
    db.collection('questions').find({}).toArray((err, questions) => {
      db.collection('users').find({}).toArray((err, users) => {
        var data = req.body.name
        console.log(data);
        if(data != "false") {
          res.render('game.ejs', {name:data});
        } else {
          res.render('login.ejs', {users:users,myNickName: 'false'})
        }
      })
    })
  })
})

router.post('/enterLogin', function(req,res) {
    db.collection('users').find({}).toArray((err, users) => {
    var data = 'false';
    res.render('login.ejs', {users: users,myNickName: data})
  })
})

router.post('/addUser', function(req,res) {
  var data = req.body.name
  db.collection('users').insertOne({name:data})
  db.collection('users').find({}).toArray((err, users) => {
    res.render('login.ejs', {users: users,myNickName: data})
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
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      res.render('add.ejs', {questions: questions,answers: answers})
    })
  })
});

router.post('/newQuestion', function(req, res) {
  console.log("New question sent.");  //logs to terminal
  var data = req.body.question
  db.collection('questions').insertOne({question:data})
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      res.render('add.ejs', {questions: questions,answers: answers})
    })
  })
});

router.get('/getQuestions', function(req,res){
  db.collection('questions').find({}).toArray((err, questions) => {
    if(err) {console.log(err)}
    var data = questions
    res.send(data)
  })
});

router.get('/getAnswers', function(req,res){
  db.collection('answers').find({}).toArray((err, answers) => {
    if(err) {console.log(err)}
    var data = answers
    res.send(data)
  })
});

router.get('/getPlayers', function(req,res) {
  db.collection('users').find({}).toArray((err, result) => {
    if(err) {console.log(err)}
    var data = result
    res.send(data)
  })
});

// all of our routes will be prefixed with /
app.use('/', router);

// START THE SERVER
//==========================================================
MongoClient.connect('mongodb://yateslough:Yateslough1@ds029638.mlab.com:29638/cardswithcru', {useNewUrlParser:true}, (err, client) => {
  if(err) { console.log(err) }
  console.log("Connected successfully to server");
  db = client.db('cardswithcru')
  app.listen(process.env.PORT || 3000,function(){
    console.log("listening on 3000");
  })
})

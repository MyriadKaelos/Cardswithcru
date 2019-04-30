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
router.post('/home', function(req,res) {
  res.render('index.ejs');
})

router.post('/restart', function(req,res) {
  db.collection('play').updateOne({},{$set: {question:""}});
  db.collection('users').deleteMany({});
  db.collection('deckA').deleteMany({});
  db.collection('deckQ').deleteMany({});
  db.collection('answers').find({}).toArray((err, answers) => {
    for(var i = 0; i < answers.length; i ++) {
      db.collection('deckA').insertOne({answer:answers[i].answer})
    }
  })
  db.collection('questions').find({}).toArray((err, questions) => {
    for(var i = 0; i < questions.length; i ++) {
      db.collection('deckQ').insertOne({question:questions[i].question})
    }
  })
  res.render('index.ejs');
})

router.post('/playCard', function(req,res) {
  db.collection('play').find({}).toArray((err, play) => {
    var move = true;
    for(var i = 0; i < play[0].played.length; i ++) {
      if(play[0].played[i].name==req.body.name) {
        move=false;
      }
    }
    if(move) {
    play[0].played.push({name:req.body.name,answer:req.body.answer})
    db.collection('play').updateOne({},{$set: {played:play[0].played}});
    db.collection('users').find({name:req.body.name}).toArray((err, player) => {
      db.collection('deckA').find({}).toArray((err, answers) => {
        player[0].hand = player[0].hand.filter(cards => cards != req.body.answer);
        var answer = answers[Math.floor(Math.random() * answers.length)].answer;
        player[0].hand.push(answer);
        db.collection('deckA').deleteOne({answer:answer});
        db.collection('users').updateOne({name:req.body.name},{$set:{hand:player[0].hand}});
        db.collection('deckA').insertOne({answer:req.body.answer});
        db.collection('users').find({}).toArray((err, users) => {
          db.collection('users').find({name:req.body.name}).toArray((err, player1) => {
            db.collection('play').find({}).toArray((err, play1) => {
              res.render('game.ejs', {users:users,player:player1[0],play:play1[0]});
            })
          })
        })
      })
    })
  } else {
    db.collection('users').find({}).toArray((err, users) => {
      db.collection('users').find({name:req.body.name}).toArray((err, player1) => {
        res.render('game.ejs', {users:users,player:player1[0],play:play[0]});
      })
    })
  }
  })
})

router.post('/choseCard', function(req,res) {
  db.collection('users').find({name:req.body.name}).toArray((err, winner) => {
    var wins = winner[0].wins;
    wins.push(req.body.question);
    db.collection('play').find({}).toArray((err, play1) => {
      var played = play1[0].played;
      for(var i = 0; i < played.length; i ++) {
        db.collection('deckA').insertOne({answer:played[i].answer});
      }
      db.collection('users').updateOne({name:req.body.player},{$set: {judge:false}});
      db.collection('users').updateOne({name:req.body.name},{$set: {judge:true,wins:wins}})
      db.collection('users').find({}).toArray((err, users) => {
        db.collection('users').find({name:req.body.player}).toArray((err, player) => {
          db.collection('deckQ').find({}).toArray((err, questions) => {
            var question = questions[Math.floor(Math.random() * questions.length)].question;
            db.collection('play').updateOne({},{$set: {question:question,played:[],lastWon:{question:req.body.question,name:req.body.name,answer:req.body.answer}}});
            db.collection('deckQ').deleteOne({question:question});
            db.collection('deckQ').insertOne({question:req.body.question})
            db.collection('play').find({}).toArray((err, play) => {
              res.render('game.ejs', {users:users,player:player[0],play:play[0]});
            })
          })
        })
      })
    })
  })
})

router.post('/logout', function(req,res) {
  console.log(req.body.name + "Logged out!");
  var data = req.body.name
  db.collection('users').deleteOne({name:data});
  res.render('index.ejs');
})

router.post('/startGame', function(req,res) {
  db.collection('users').find({judge:true}).toArray((err, judgeArray) => {
    if(judgeArray.length == 0) {
      db.collection('users').find({}).toArray((err, users) => {
        db.collection('users').updateOne({name:users[Math.floor(Math.random() * users.length)].name},{$set: {judge:true}});
        db.collection('deckQ').find({}).toArray((err, questions) => {
          db.collection('play').find({}).toArray((err, play) => {
            db.collection('users').find({name:req.body.name}).toArray((err, player) => {
              res.render('game.ejs', {users:users,player:player[0],play:play[0]});
            });
          });
        });
      });
    } else {
      db.collection('play').find({}).toArray((err, play) => {
        db.collection('users').find({}).toArray((err, users) => {
          db.collection('users').find({name:req.body.name}).toArray((err, player) => {
            res.render('game.ejs', {users:users,player:player[0],play:play[0]});
          });
        });
      });
    }
  });
});

router.post('/enterLogin', function(req,res) {
  db.collection('users').find({}).toArray((err, users) => {
    db.collection('play').find({}).toArray((err, play) => {
      if(play[0].question=="") {
        db.collection('play').updateOne({},{$set: {question:" "}})
      }
    })
    var data = '';
    res.render('login.ejs', {users: users,name: data})
  })
})

router.post('/addUser', function(req,res) {
  var data = req.body.name;
  var hand = [];
  if(data != '') {
    db.collection('users').find({judge:true}).toArray((err, judgeArray) => {
      if(judgeArray.length == 0) {
        db.collection('deckQ').find({}).toArray((err,questions) => {
          var rand = Math.floor(Math.random() * questions.length);
          db.collection('play').updateOne({},{$set:{question:questions[rand].question,played:[],lastWon:{question:"",name:"",answer:""}}})
          db.collection('deckQ').deleteOne({question:questions[rand].question})
        })
      }
    })
    db.collection('deckA').find({}).toArray((err,answers) => {
      var deckA = answers;
      if(answers.length > 6) {
        for(var i = 0; i < 6; i ++) {
          var int = Math.floor(Math.random() * deckA.length);
          var answer = deckA[int].answer;
          hand.push(answer);
          db.collection('deckA').deleteOne({answer:answer});
          deckA = deckA.filter(cards => cards.answer != answer);
        }
        db.collection('users').find({name:req.body.name}).toArray((err, alreadyNamed) => {
          if(alreadyNamed.length>0) {
            db.collection('users').find({}).toArray((err, users) => {
              res.render('login.ejs', {users: users,name: ""})
            })
          } else {
            db.collection('users').insertOne({name:data,hand:hand,judge:false,wins:[]})
            db.collection('users').find({}).toArray((err, users) => {
              res.render('login.ejs', {users: users,name:data});
            })
          }
        })
      } else {
        res.render('index.ejs');
      }
    })
  } else {
    console.log("Please input a name with more than zero characters. ^_^");
    db.collection('users').find({}).toArray((err, users) => {
      var data = '';
      res.render('login.ejs', {users: users,name: data})
    })
  }
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
  var data = req.body.answer
  db.collection('answers').insertOne({answer:data})
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      res.render('add.ejs', {questions: questions,answers: answers})
    })
  })
});

router.post('/removeAnswer', function(req, res) {
  db.collection('answers').deleteOne({answer:req.body.answer});
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      res.render('add.ejs', {questions: questions,answers: answers})
    })
  })
})

router.post('/newQuestion', function(req, res) {
  var data = req.body.question
  db.collection('questions').insertOne({question:data})
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      res.render('add.ejs', {questions: questions,answers: answers})
    })
  })
});

router.post('/removeQuestion', function(req, res) {
  db.collection('questions').deleteOne({question:req.body.question});
  db.collection('questions').find({}).toArray((err, questions) => {
    db.collection('answers').find({}).toArray((err, answers) => {
      if(err) {console.log(err)}
      res.render('add.ejs', {questions: questions,answers: answers})
    })
  })
})
router.post('/nextRound', function(req, res) {
  db.collection('play').find({}).toArray((err, play) => {
    db.collection('users').find({name:req.body.name}).toArray((err, player) => {
      db.collection('users').find({}).toArray((err, users) => {
        res.render('game.ejs', {users:users,player:player[0],play:play[0]});
      })
    })
  })
})

router.get('/getQuestions', function(req,res){
  db.collection('questions').find({}).toArray((err, questions) => {
    if(err) {console.log(err)}
    if(questions.length == 0) {
      res.send({})
    } else {
      res.send(questions)
    }
  })
});

router.get('/getAnswers', function(req,res){
  db.collection('answers').find({}).toArray((err, answers) => {
    if(err) {console.log(err)}
    if(answers.length == 0) {
      res.send({})
    } else {
      res.send(answers)
    }
  })
});

router.get('/getPlayers', function(req,res) {
  db.collection('users').find({}).toArray((err, result) => {
    if(err) {console.log(err)}
    var data = result
    res.send(data)
  })
});

router.get('/getPLay', function(req,res) {
  db.collection('play').find({}).toArray((err, result) => {
    if(err) {console.log(err)}
    var data = result
    res.send(data[0]);
  })
})

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

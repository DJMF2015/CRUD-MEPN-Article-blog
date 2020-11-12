const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const port = 3000;

mongoose.connect("mongodb://localhost/nodedb");
let db = mongoose.connection;

// check connection
db.once('open', () => {
        console.log('coonected to Mongo database');
    });

//check for connection errors
db.on('error', (err) => {
        console.log(err);
    })

const app = express();


//Bring in Models
let Article = require('./models/article');

//load views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//bodypasrser middleware
app.use(bodyparser.urlencoded({extended: false}))
//parse application/json
app.use(bodyparser.json());

//Home Route
app.get('/', function (req, res) {
    Article.find({}, (err, articles) => {
        if (err) {
            console.log(err)
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

//add Route
app.get('/articles/add', function(req, res){
    res.render('add_article', {
        title: 'Add Articles...'
    });
})

app.post('/articles/add', function(req, res){
   let article = new Article();
   console.log(req.body.title)
   article.title = req.body.title;
   article.author = req.body.author;
   article.body = req.body.body;
   article.save(function(err){
       if(err){
           console.log(err)
       }else{
           res.redirect('/')

       }
   });
});

app.listen(port, function(){
  console.log('server started at port: ' , `${port}`);
});
 
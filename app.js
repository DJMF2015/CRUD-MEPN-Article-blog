const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/database.js');
const flash = require('connect-flash');
const session = require('express-session')
const expressValidator = require('express-validator');

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Check for db errors
db.on('error', function (err) {
    console.log(err);
});

// Iiit App
const app = express();

// Bring in Models
let Article = require('./models/article');
// const { title } = require('process');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//public folder
app.use(express.static(path.join(__dirname, 'public')));

//Session data not saved in cookie itself-stored server side as session ID
app.use(session({
    secret: 'busy beaver3',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//express Validator middleware??
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Home Route
app.get('/', function (req, res) {
    Article.find({}, function (err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

//add article Route
app.get('/article/add', function (req, res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Submit Post Route article
app.post('/article/add', function (req, res) {
    let article = new Article(); 
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(function (err) {
        if (err) {
            console.log(err)
            return;
        } else {
            res.redirect('/')
        }
    });
});

// load edit form
app.get('/article/edit/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

//update article route
app.post('/article/edit/:id', function (req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = { _id: req.params.id }

    Article.update(query, article, function (err) {
        if (err) {
            console.log(err);
            return;
        } else {
            console.log('post updated ' +  article.body)
            res.redirect('/');
        }
    });
});

// Delete single Article
app.delete('/article/:id', function (req, res) {
    let query = { _id: req.params.id }

    Article.remove(query, function (err) {
        if (err) {
            console.log(err);
        }
        res.send('Sucessfuly deleted');
    })
})

// Get a Single Article
app.get('/article/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        res.render('article', {
            article: article
        });
    });
});


const port = 3000;

app.listen(port, function () {
    console.log('server started at port: ', `${port}`);
});

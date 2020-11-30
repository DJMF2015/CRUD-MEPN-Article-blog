const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

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

// init App
const app = express();

// Bring in Models
let Article = require('./models/article');
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
// Note: ‘express - session’ simplifies the process of making HTTP requests stateful.This is done by storing data such as user id in a session cookie and sending it back to the client. 
app.use(session({
    secret: 'busy beaver',
    resave: true,
    saveUninitialized: true
}));

// Express Validator Middleware
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

// Express Messages Middleware  
//passport middleware
require('./config/passport')(passport)
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    //set global variable and request user object else null if false
    res.locals.user = req.user || null;
    next();
});

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});
// Home Route
app.get('/', (req, res) => {
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

//Routers 
let articles = require('./routes/articles')
let users = require('./routes/users')
app.use('/articles', articles);
app.use('/users', users);

//server
const port = 3000;
app.listen(port, function () {
    console.log('server started at port: ', `${port}`);
});

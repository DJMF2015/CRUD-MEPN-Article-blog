const express = require('express')
const router = express.Router();

// Article Model
let Article = require('../models/article');
// // User Model
let User = require('../models/user');

//add article Route
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Submit Post Route article
router.post('/add', function (req, res) {
    //new instance
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function (err) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log('Article Added')
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }
});


// load edit form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {

            console.log('Not Authorised')
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }
        res.render('edit_article', {
            title: 'Edit Article',
            article: article
        });
    });
});

//update article route
router.post('/edit/:id', function (req, res) {
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
            console.log('Success, Article updated')
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

// Delete single Article
router.delete('/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id }

    Article.findById(req.params.id, function (err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function (err) {
                if (err) {
                    console.log(err);
                }
                console.log('Article Deleted')
                // res.render('show_msg', { message: "Article Deleted", type: "error" });
                res.send('Success');
            });
        }
    });
});

// Get a Single Article
router.get('/:id', function (req, res) {
    Article.findById(req.params.id, function (err, article) {
        User.findById(article.author, function (err, user) {
            res.render('article', {
                article: article,
                author: user.name
            });
        });
    });
})
// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log('Please login');
        // req.flash('danger', 'Please login');
    
        res.redirect('/users/login');
    }

   
}

module.exports = router;
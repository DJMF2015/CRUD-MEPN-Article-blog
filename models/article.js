let mongoose = require('mongoose')

//Article model
let articleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author:{
        type: String
    },
    body:{
        type: String
    }
});

let Article = module.exports = mongoose.model('Article', articleSchema);

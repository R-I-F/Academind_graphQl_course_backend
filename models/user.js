const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const  userSchema = new Schema({
    // email, password, name, status, posts
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status : {
        type: String,
        default: 'I am new'
    },
    posts : [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;

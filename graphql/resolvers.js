const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async function ({ userInput }){
        const { email, password, name } = userInput;
        const errors = [];
        if(!validator.isEmail(email)){
            errors.push({message: 'Email is invalid'});
        }

        if(validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
            errors.push({message: 'Password is invalid, min 5 characters'});
        }

        if(errors.length > 0){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

       const userExists = await User.findOne({ email: email });
       if(userExists){
            const error = new Error('User already exists');
            throw error;
       }
       const hashedPassword = await bcrypt.hash(password, 12);
       const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
       });
       const createdUser = await user.save();
       return {...createdUser._doc, _id: createdUser._id.toString()}
    },

    login: async function({ email, password }){
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('User not found.');
            error.code = 404;
            throw error; 
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Invalid Data.');
            error.code = 401;
            throw error; 
        }
        const token = jwt.sign({ 
            userId: user._id.toString(),
            email: user.email,
        }, 'secret', { expiresIn: '1h' });

        return{ token: token,  userId: user._id.toString()};
    }
}
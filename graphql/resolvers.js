const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');

module.exports = {
    createUser: async function ({ userInput }){
        const { email, password, name } = userInput;
        const errors = [];
        if(!validator.isEmail(email)){
            const error = new Error('Email is invalid');
            errors.push(error);
        }

        if(validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
            const error = new Error('Password is invalid, min 5 characters');
            errors.push(error);
        }

        if(errors.length > 0){
            const error = new Error('Invalid input');
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
    }
}
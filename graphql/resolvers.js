const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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
    }
}
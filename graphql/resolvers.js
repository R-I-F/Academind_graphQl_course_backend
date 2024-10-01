const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
    createUser: async function ({ userInput }){
       const userExists = await User.findOne({ email: userInput.email });
       if(userExists){
            const error = new Error('User already exists');
            throw error;
       }
       const hashedPassword = await bcrypt.hash(userInput.password, 12);
       const user = new User({
            email: userInput.email,
            password: hashedPassword,
            name: userInput.name,
       });
       const createdUser = await user.save();
       return {...createdUser._doc, _id: createdUser._id.toString()}
    }
}
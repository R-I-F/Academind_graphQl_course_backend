const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');

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

    createPost: async function({ postInput }, { req }){
        console.log('creating post');
        if(!req.isAuth){
            const error = new Error('Not authenticated.');
            error.code = 401;
            throw error;
        }
        const { title, imageUrl, content, creator } = postInput;
        console.log(imageUrl);

        const errors = [];
        if(validator.isEmpty(title) || !validator.isLength(title, {min: 5})){
            errors.push({message: 'Title validation failed'});
        }    
        if(validator.isEmpty(content) || !validator.isLength(content, {min: 5})){
            errors.push({message: 'Content validation failed'});
        }
        if(errors.length > 0){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('Internal Error.');
            error.code = 500;
            throw error;
        }
        const post = new Post({
            title: title,
            imageUrl: imageUrl,
            content: content,
            creator: user
        })

        const postSaveResult = await post.save();
        if(!postSaveResult){
            const error = new Error('Post creation failed.');
            error.code = 500;
            throw error; 
        }

        user.posts.push(postSaveResult);
        const postInjectResult = await user.save();
        if(!postInjectResult){
            const error = new Error('Post injection into user failed.');
            error.code = 500;
            throw error; 
        }

        return {
            ...postSaveResult._doc, 
            _id: postSaveResult._id.toString(),
            createdAt: postSaveResult.createdAt.toISOString(),
            updatedAt: postSaveResult.updatedAt.toISOString()
        }
    },

    getPost: async function ({ postId }, { req }) {
        try {
            console.log("getting post");
    
            if (!req.isAuth) {
                const error = new Error('Not authenticated.');
                error.code = 401;
                throw error;
            }
    
            const post = await Post.findById(postId).populate('creator');
    
            if (!post) {
                const error = new Error('No post found');
                error.code = 404;
                throw error;
            }
    
            console.log("Post found:", post);
    
            return { 
                ...post._doc, 
                _id: post._id.toString(),
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString()
            };
        } catch (err) {
            console.error("Error in getPost:", err); // Log error for easier debugging
            throw err;
        }
    },
    

    login: async function({ email, password }, req){

        const errors = [];
        if(!validator.isEmail(email)){
            errors.push({message: 'Invalid field data.'})
        }
        if(validator.isEmpty(password) || !validator.isLength(password, {min: 5})){
            errors.push({message: 'Invalid field data'});
        }
        if(errors.length){
            const error = new Error('Invalid data.');
            error.data = errors
            error.code = 422;
            throw error; 
        }

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
    },

    posts: async function({ page }, { req }){
        if(!req.isAuth){
            const error = new Error('Not authenticated.');
            error.code = 401;
            throw error;
        }
        if(!page){
            page = 1;
        }

        const perPage = 2;
        
        const postsCount = Post.find().countDocuments();
        const posts = await Post.find().sort({createdAt: -1})
        .skip((page-1) * perPage)
        .limit(perPage)
        .populate('creator');
        const postsArray = posts.map((post)=>{
            const userId = post.creator._id.toString();
            return {
            ...post._doc, 
            _id: post._id.toString(),
            creator: {...post.creator._doc, _id: userId},
            createdAt: post.createdAt.toString(),
            updatedAt: post.updatedAt.toString()
            }
        })

        return { posts: postsArray, totalPosts: postsCount };

    },

    getUserStatus: async function(args, { req }){
        if(!req.isAuth){
            const error = new Error('Not authenticated.');
            error.code = 401;
            throw error;
        }
        try {
            const user = await User.findById(req.userId);
            
            if(!user){
                const error = new Error('Internal Error.');
                error.code = 500;
                throw error;
            }
            return user.status;
        } catch (error) {
            error.code = 500;
            throw error;
        }
    }
}
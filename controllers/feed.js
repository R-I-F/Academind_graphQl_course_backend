const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path')
const io = require('../socket');

exports.getPosts = (req, res, next)=>{
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.countDocuments()
        .then((count) => {
            totalItems = count;
            return Post.find()
                .populate('creator')
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
        })
        .then((posts) => {
            res.status(200).json({
                message: 'Post created successfully !',
                posts: posts,
                totalItems: totalItems
            })
        })
        .catch((err) => {
            if(!err.statusCode){ err.statusCode = 500; }
            next(err)
        });
};

exports.createPost = async (req, res, next)=>{
    const image = req.file;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Post validation failed');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const newPost = new Post({
        title: title,
        imageUrl: image.path.replace(/\\/g, '/'),
        content: content,
        creator: req.userId
    })
    try {
        const resultPost = await newPost.save();
        const user = await User.findById(req.userId);
        user.posts.push(newPost);
        await user.save();
        io.getIO().emit('posts', {
            action: 'create',
            post: {...resultPost._doc, creator: {_id: req.userId, name: user.name}}
        })
        res.status(201).json({
            message: 'Post created successfully !',
            post: newPost,
            creator: {_id: user._id, name: user.name}
        })
    }
    catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
    };
};

exports.getPost = (req, res, next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if(!post){
                const error = new Error('post not found !');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Post fetched successfully', post: post})
        })
        .catch((err) => {
            if(!err.statusCode){ err.statusCode = 500; }
            next(err)
        });

};

exports.updatePost = (req, res, next)=>{
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Post validation failed');
        error.statusCode = 422;
        throw error;
    }
    if(req.file){
        imageUrl = req.file.path.replace(/\\/g, '/');
    }
    if(!imageUrl){
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId)
    .then((post) => {
        if(!post){
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error
        }
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Updating post failed');
            error.statusCode = 403; // 403 means forbidden
            throw error ;
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then((result)=>{
        res.status(200).json({ message: 'Post updated successfully', post: result });
    })
    .catch((err) => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
        .then((post) => {
            if(post.creator.toString() !== req.userId){
                const error = new Error('Deleting post failed');
                error.statusCode = 403; // 403 means forbidden
                throw error ;
            }
            if(!post){
                const error = new Error('Post not found');
                error.statusCode = 404;
                throw error;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then((result) => {
            return User.findById(req.userId)
        })
        .then((user) => {
            user.posts.pull(postId)
            return user.save()
        })
        .then((result) => {
            res.status(200).json({message: "Post deleted successfully."})
        })
        .catch((err) => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

const clearImage = (filePath)=>{
    filePath = path.join(__dirname,'../',filePath);
    fs.unlink(filePath, err => console.log(err));
};
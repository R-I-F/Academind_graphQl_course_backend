const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next)=>{
    Post.find()
    .then((posts) => {
        res.status(200).json({
            message: 'Post created successfully !',
            posts: posts
        })
    })
    .catch((err) => {
        if(!err.statusCode){ err.statusCode = 500; }
        next(err)
    });
};

exports.createPost = (req, res, next)=>{
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
        imageUrl: '/images/book.jpg',
        content: content,
        creator: { name: 'ibrahim ahmed' }
    })
    newPost.save()
        .then((result)=>{
            res.status(201).json({
                message: 'Post created successfully !',
                post: result
            });
        })
        .catch((err) => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
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
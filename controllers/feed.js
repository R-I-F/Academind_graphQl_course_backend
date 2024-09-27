const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path')

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
    const image = req.file;
    console.log(image);
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

const clearImage = (filePath)=>{
    filePath = path.join(__dirname,'../',filePath);
    fs.unlink(filePath, err => console.log(err));
};
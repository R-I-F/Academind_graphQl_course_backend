const { validationResult } = require('express-validator');
const Post = require('../models/post');

exports.getPosts = (req, res, next)=>{
    res.status(200).json({
        posts:[
            {
                _id: '1',
                title: 'First Post', 
                creator: {
                    name: "Ibrahim Ahmed",
                },
                createdAt: new Date(),
                content: 'This is the first post!'
            }
        ]
    });
};

exports.createPost = (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(422).json({
            message: 'Post validation failed',
            errors: errors.array()
        });
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
        .catch((err) => { console.log(err); });
};
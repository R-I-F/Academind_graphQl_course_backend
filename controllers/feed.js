const {validationResult} = require('express-validator');

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
    //  create post in the database
    res.status(201).json({
        message: 'Post created successfully !',
        post: {
            id: 1, 
            title: title, 
            creator: {
                name: "Ibrahim Ahmed"
            },
            createdAt: new Date().toDateString(),
            content: content,
        }
    });
};
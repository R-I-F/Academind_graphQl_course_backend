const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt.hash(password, 12)
        .then((hashedPassword) => {
            const newUser = new User({
                email: email,
                password: hashedPassword,
                name: name,
            });
            return newUser.save()
        })
        .then((result) => {
            res.status(201).json({message: 'User Created', userId: result._id})
        })
        .catch((err) => {
            if(!err.statusCode){
                err.statusCode = 500 ; 
            }
            next(err);
        });
};

exports.postLogin = (req, res, next)=>{
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({email: email})
        .then((user) => {
            if(!user){
                const error = new Error('Wrong credentials');
                error.statusCode = 401 // 401 is for unauthorized
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password)            
        })
        .then((doMatch)=>{
            if(!doMatch){
                const error = new Error('Wrong credentials');
                error.statusCode = 401 // 401 is for unauthorized
                throw error;
            }
            const token = jwt.sign({
                email: email,
                userId: loadedUser._id.toString()
            }, 'secret', {expiresIn: '1h'});
            res.status(200).json({token: token, userId: loadedUser._id.toString()})
        })
        .catch((err) => {
            if(!err.statusCode){
                err.statusCode = 500; 
            }
            next(err);
        });
};

exports.getUserStatus = (req, res, next)=>{
    User.findById(req.userId)
    .then((user) => {
        if(!user){
            const error = new Error('Authorization failed')
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({status: user.status})
    })
    .catch((err) => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updateUserStatus = (req, res, next)=>{
    const newStatus = req.body.status;
    console.log(newStatus);
    User.findById(req.userId)
    .then((user) => {
        if(!user){
            const error = new Error('Authorization failed')
            error.statusCode = 404;
            throw error
        }
        user.status = newStatus;
        return user.save()
    })
    .then((result) => {
        res.status(200).json({message: 'Status updated', status: newStatus})
    })
    .catch((err) => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};
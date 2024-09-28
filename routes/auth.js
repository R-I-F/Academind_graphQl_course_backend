const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');
const { check, body } = require('express-validator');

router.put('/signup', [
    body('email')
        .isEmail()
        .custom((value, {req})=>{
            return User.findOne({email: value})
                .then((user)=>{
                    if(user){
                        return Promise.reject('Email already exists, please use a different email address')
                    }
                })
        })
        .normalizeEmail()
    ,
    body('password')
        .trim()
        .isLength({min: 5})
    ,
    body('name')
        .trim()
        .not()
        .isEmpty()
    ,
], authController.signup);

router.post('/login', authController.postLogin);

module.exports = router ; 
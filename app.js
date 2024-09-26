require('dotenv').config();
const express = require('express');
const app = express();
const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.json());

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();    
});

app.use('/feed', feedRoutes);

app.connect(process.env.DRIVER_URL)
.then((result) => { 
    app.listen(8080);
 })
.catch((err) => { console.log(err); });

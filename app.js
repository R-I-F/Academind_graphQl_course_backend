require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');


app.use(cors());
app.use(auth);

app.use('/graphql', graphqlHTTP((req)=> ({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    context: { req },
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        const data = err.originalError.data;
        const code = err.originalError.code || 500;
        const message = err.message || 'an error occurred';
        return { message: message, status: code, data: data };
    }
})));

const fileStorage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'images');
    },
    filename: (req, file, cb)=>{
        cb(null, uuidv4() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb)=>{
    if(file.mimetype === 'image/png' ||file.mimetype === 'image/jpg' ||file.mimetype === 'image/jpeg' ){
        cb(null, true);
    } else { cb(null, false); }
}

app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter: fileFilter}).single('image'));


app.use('/images', express.static(path.join(__dirname, 'images')));

<<<<<<< HEAD
=======


>>>>>>> module_28
app.use((error, req, res, next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const mssg = error.message;
    const data = error.data
    res.status(status).json({message: mssg, data: data});
});

mongoose.connect(process.env.DRIVER_URL2)
.then((result) => { 
    app.listen(8080);
 })
.catch((err) => { console.log(err); });

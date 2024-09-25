const express = require('express');
const app = express();
const feedRoutes = require('./routes/feed');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use('/feed', feedRoutes);

app.listen(8080);
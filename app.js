const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./backend/models/post');

const postRoutes = require('./backend/routes/posts');
const userRoutes = require('./backend/routes/user');

const app = express();

mongoose.connect('mongodb+srv://dtrafford:' + process.env.MONGO_ATLAS_PW + '@postman-chv18.mongodb.net/PostMan?retryWrites=true')
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(() => {
        console.log('Connection failed!');
    })

// Parse the json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/images", express.static(path.join('backend/images'))); // allows acces to the image folder

// Allow CORS accress
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    next();
});

// app.use(express.static('/dist'));
app.use("/images", express.static(path.join(__dirname, "/backend/images")));
app.use(express.static('/dist/PostApp'));

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname + '/dist/PostApp/index.html'));

});

module.exports = app;


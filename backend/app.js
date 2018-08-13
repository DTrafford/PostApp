const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/post');

const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

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

// // Create a post
// app.post('/api/posts', (req, res, next) => {
//     const post = new Post({
//         title: req.body.title,
//         content: req.body.content,
//         replies: req.body.replies
//     });
//     post.save().then(createdPost =>{
//         res.status(201).json({
//             message: 'Post Added',
//             postId: createdPost._id
//         });
//     });
// });

// // Get array of posts for post list
// app.get('/api/posts', (req, res, next) => {
//     Post.find().then(documents => {
//         res.status(200).json({
//             message: 'Posts fetched succesfuly',
//             posts: documents
//         });
//     });
// });

// // Get single post for post edit
// app.get('/api/posts/:id', (req, res, next) => {
//   Post.findById(req.params.id).then(post => {
//     if (post) {
//       res.status(200).json(post);
//     } else {
//       res.status(404).json({message: 'Post not found'});
//     }
//   });
// });

// // Update a post
// app.put('/api/posts/:id', (req, res, next) => {
//   // const post = new Post({
//   //   _id: req.body.id,
//   //   title: req.body.title,
//   //   content: req.body.content,
//   //   replies: req.body.replies
//   // });
//   var updatedPost = {};
//   updatedPost = Object.assign(updatedPost, req.body);
//   delete updatedPost._id;
//   Post.updateOne({ _id: req.params.id }, updatedPost).then(result => {
//     res.status(200).json({ message: 'Update Successful' });
//   });
// });

// // Delete a post
// app.delete('/api/posts/:id', (req, res, next) => {
//     Post.deleteOne({_id: req.params.id}).then(result => {
//         console.log(result);
//         res.status(200).json({ message: 'Post Deleted'});
//     })
// });

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
module.exports = app;


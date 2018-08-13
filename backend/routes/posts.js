const express = require('express');
const multer = require('multer');
const PostController = require('../controllers/posts');

const Post = require('../models/post');

const checkAuth = require('../middleware/check-auth');

const extractFile = require('../middleware/file');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
})

// Create a post
router.post('', checkAuth, extractFile, PostController.createPost);

// Get array of posts for post list
router.get('', PostController.getPostList);

// Get single post for post edit
router.get('/:id', PostController.getSinglePost);

// Update a post
router.put('/:id', checkAuth, extractFile, PostController.updatePost);

// Add a reply
router.put('/:id/:addReply', checkAuth, extractFile, PostController.addReply);

// Delete a post
router.delete('/:id', checkAuth, PostController.deletePost);

module.exports = router;

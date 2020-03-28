const Post = require('../models/post');

exports.createPost =  (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  let fileName;
  if (req.file) {
    fileName = req.file.filename;
    post = new Post({
      title: req.body.title,
      content: req.body.content,
      creatorId: req.userData.userId,
      creatorName: req.userData.displayName,
      replies: req.body.replies,
      imagePath: url + '/images/' + fileName
  });
  } else {
    post = new Post({
      title: req.body.title,
      content: req.body.content,
      creatorId: req.userData.userId,
      creatorName: req.userData.displayName,
      replies: req.body.replies,
      imagePath: null
  });
  }
  post.save().then(createdPost =>{
      res.status(201).json({
          message: 'Post Added',
          post: {
            ...createdPost,
            id: createdPost._id
          }
      });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Post Creation Failed'
    });
  });
}

exports.updatePost = (req, res, next) => {

  let imagePath =  req.body.imagePath;
  if (req.imagePath === 'object') {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.imagePath.filename;
  }
    // fileName = req.file.filename;
//     post = new Post({
//       _id: req.body.id,
//       title: req.body.title,
//       content: req.body.content,
//       replies: req.body.replies,
//       imagePath: url + '/images/' + fileName
//   });
    post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      creatorId: req.userData.userId,
      creatorName: req.userData.displayName,
      replies: req.body.replies,
      imagePath: imagePath
  });
  delete post._id;
// var updatedPost = {};
// updatedPost = Object.assign(updatedPost, req.body);
// updatedPost.imagePath = imagePath;
// delete updatedPost._id;
Post.updateOne({ _id: req.params.id, creatorId: req.userData.userId },
              {title: post.title,
              content: post.content,
              creatorId: req.userData.userId,
              creatorName: req.userData.displayName,
              replies: req.body.replies,
              imagePath: post.imagePath})
              .then(result => {
                if(result.n > 0) {
                  res.status(200).json({ message: 'Update Successful' });
                } else {
                  res.status(401).json({ message: 'Not Authorized' });
                  // res.status(401).json({ message: "Not authorized!" });
                }
              })
              .catch(error => {
                res.status(500).json({
                  message: 'Updated Failed'
                });
              });
}

exports.addReply = (req, res, next) => {

  post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    replies: req.body.replies,
    imagePath: req.body.imagePath
});

Post.updateOne({ _id: req.params.id }, {title: post.title, content: post.content, replies: req.body.replies, imagePath: post.imagePath}).then(result => {
res.status(200).json({ message: 'Reply Added' });
});
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creatorId: req.userData.userId }).then(result => {
    if(result.n > 0) {
      console.log(result);
      res.status(200).json({ message: 'Post Deleted'});
    } else {
      res.status(401).json({ message: 'Not Authorized' });
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Deletion Failed'
    })
  })
}

exports.getPostList = (req, res, next) => {
  const pageSize = +req.query.pagesize; // The + sign converts the strings to numbers
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if(pageSize && currentPage) {
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize);
  }
  postQuery.find().then(documents => {
    fetchedPosts = documents;
    return Post.count();
  })
  .then(count => {
    res.status(200).json({
      message: 'Posts Fetched Succesfully',
      posts: fetchedPosts,
      totalPosts: count
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'Could not retrieve posts'
    });
  });
}

exports.getSinglePost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found'});
    }
  })
  .catch(error => {
    res.status(500).json({
      message: 'Post Not Found By Server'
    })
  })
  }

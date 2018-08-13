const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    creatorName: { type: String },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    replies: {
        userId: { type: String },
        replyMessage: { type: String}
    },
    imagePath: { type: String }
});

module.exports = mongoose.model('Posts', postSchema);

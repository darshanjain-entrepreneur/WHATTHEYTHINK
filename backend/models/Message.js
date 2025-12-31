const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // NO senderId - ensures absolute anonymity
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    messageText: {
        type: String,
        required: [true, 'Message text is required'],
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);

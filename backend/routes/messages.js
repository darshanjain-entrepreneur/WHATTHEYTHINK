const express = require('express');
const Message = require('../models/Message');
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages/send
// @desc    Send an anonymous message
// @access  Private
router.post('/send', protect, async (req, res) => {
    try {
        const { receiverId, groupId, messageText } = req.body;

        if (!receiverId || !groupId || !messageText) {
            return res.status(400).json({ message: 'Please provide receiverId, groupId, and messageText' });
        }

        // Verify sender is in the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isSenderMember = group.members.some(m => m.toString() === req.user._id.toString());
        if (!isSenderMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        // Verify receiver is in the group
        const isReceiverMember = group.members.some(m => m.toString() === receiverId);
        if (!isReceiverMember) {
            return res.status(400).json({ message: 'Receiver is not a member of this group' });
        }

        // Cannot send message to yourself
        if (receiverId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot send a message to yourself' });
        }

        // Create message - NO senderId stored for anonymity
        const message = await Message.create({
            receiverId,
            groupId,
            messageText
        });

        res.status(201).json({
            message: 'Anonymous message sent successfully',
            messageId: message._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/messages/inbox
// @desc    Get user's inbox (received messages)
// @access  Private
router.get('/inbox', protect, async (req, res) => {
    try {
        const messages = await Message.find({ receiverId: req.user._id })
            .populate('groupId', 'name inviteCode')
            .sort({ createdAt: -1 });

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            messageText: msg.messageText,
            groupName: msg.groupId ? msg.groupId.name : 'Unknown Group',
            groupId: msg.groupId ? msg.groupId._id : null,
            groupInviteCode: msg.groupId ? msg.groupId.inviteCode : null,
            createdAt: msg.createdAt
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/groups/create
// @desc    Create a new group
// @access  Private
router.post('/create', protect, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a group name' });
        }

        const group = await Group.create({
            name,
            createdBy: req.user._id,
            members: [req.user._id]
        });

        // Add group to user's groups
        await User.findByIdAndUpdate(req.user._id, {
            $push: { groups: group._id }
        });

        res.status(201).json({
            _id: group._id,
            name: group.name,
            inviteCode: group.inviteCode,
            members: group.members
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/groups/join
// @desc    Join a group via invite code
// @access  Private
router.post('/join', protect, async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ message: 'Please provide an invite code' });
        }

        const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!group) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if already a member
        if (group.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Add user to group
        group.members.push(req.user._id);
        await group.save();

        // Add group to user's groups
        await User.findByIdAndUpdate(req.user._id, {
            $push: { groups: group._id }
        });

        res.json({
            _id: group._id,
            name: group.name,
            inviteCode: group.inviteCode,
            memberCount: group.members.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/groups/my-groups
// @desc    Get all groups for current user
// @access  Private
router.get('/my-groups', protect, async (req, res) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .select('name inviteCode members createdAt')
            .sort({ createdAt: -1 });

        const groupsWithCount = groups.map(group => ({
            _id: group._id,
            name: group.name,
            inviteCode: group.inviteCode,
            memberCount: group.members.length,
            createdAt: group.createdAt
        }));

        res.json(groupsWithCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/groups/:id
// @desc    Get group details with members
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'username')
            .populate('createdBy', 'username');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(member => member._id.toString() === req.user._id.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this group' });
        }

        res.json({
            _id: group._id,
            name: group.name,
            inviteCode: group.inviteCode,
            members: group.members,
            createdBy: group.createdBy,
            createdAt: group.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

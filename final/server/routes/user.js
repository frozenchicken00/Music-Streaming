const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { auth, isAdmin } = require('../middleware/auth');

// Create a new user
router.post('/', async (req, res) => {
    const { name, username, email, password } = req.body;
    try {
        const newUser = new User({ name, username, email, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all users
// Get all users or single user based on role
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.isAdmin()) {
            const users = await User.find();
            res.json(users);
        } else {
            const user = await User.findById(req.user._id);
            res.json([user]); // Return an array with only the requesting user for consistency
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a user by ID
router.patch('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Allow only the user themselves or an admin to update the user
        if (req.user._id.toString() !== user._id.toString() && !req.user.isAdmin()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.body.name != null) {
            user.name = req.body.name;
        }
        if (req.body.username != null) {
            user.username = req.body.username;
        }
        if (req.body.email != null) {
            user.email = req.body.email;
        }
        if (req.body.password != null) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;

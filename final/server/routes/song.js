const express = require('express');
const router = express.Router();
const upload = require('../config/gridfs.js');
const Song = require('../models/song');
const User = require('../models/user'); // Import User model
const { auth } = require('../middleware/auth'); // Import auth middleware

const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const conn = mongoose.connection;
let gfs;

conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'songs'
    });
});

// CREATE: Create a new song
router.post('/', auth, upload.single('songFile'), async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;
        const fileId = req.file.id; // Get the file ID from the uploaded file

        // Ensure the user is attached to the request
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const song = new Song({ title, artist, album, duration, user: user._id, fileId });
        await song.save();

        // Add song ID to user's songs array
        user.songs.push(song._id);
        await user.save();

        res.json(song);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// READ: Get all songs
router.get('/', async (req, res) => {
    try {
        const { title, artist, album } = req.query;
        const filter = {};
        if (title) filter.title = new RegExp(title, 'i');
        if (artist) filter.artist = new RegExp(artist, 'i');
        if (album) filter.album = new RegExp(album, 'i');

        const songs = await Song.find(filter).select('title artist album duration fileId');
        res.json(songs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// READ: Get a specific song by ID
router.get('/:songId', async (req, res) => {
    try {
        const song = await Song.findById(req.params.songId).select('title artist album duration fileId');
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(song);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE: Update a song by ID
router.put('/:songId', async (req, res) => {
    try {
        const { title, artist, album, duration } = req.body;
        const song = await Song.findByIdAndUpdate(req.params.songId, { title, artist, album, duration }, { new: true });
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(song);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE: Delete a song by ID
router.delete('/:songId', async (req, res) => {
    try {
        const song = await Song.findById(req.params.songId);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        await Song.deleteOne({ _id: song._id });
        res.json({ message: 'Song deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Endpoint to get a song file by ID
router.get('/file/:fileId', async (req, res) => {
    const { fileId } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ error: 'Invalid file ID format' });
        }

        const file = await gfs.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
        if (!file[0] || file.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.set('Content-Type', 'audio/mpeg');

        const downloadStream = gfs.openDownloadStream(file[0]._id);
        downloadStream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
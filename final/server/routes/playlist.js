const express = require('express');
const router = express.Router();
const Playlist = require('../models/playlist');

// CREATE: Create a new playlist
router.post('/', async (req, res) => {
    const { name, songs, user } = req.body;

    try {
        // Check for an existing playlist with the same name
        const existingPlaylist = await Playlist.findById(req.params.playlistId);
        if (existingPlaylist) {
            return res.status(400).json({ message: 'A playlist with this name already exists.' });
        }

        // Create a new playlist if no duplicate playlistCode is found
        const newPlaylist = new Playlist({
            name,
            songs,
            user
        });

        await newPlaylist.save(); // Save the new playlist to the database
        res.status(201).json(newPlaylist); // Send the created playlist as a response
    } catch (error) {
        console.error('Error creating the playlist:', error);
        res.status(500).json({ message: 'Server error while creating the playlist.' });
    }
});

// Add a song to a playlist
router.post('/:playlistId/songs', async (req, res) => {
    try {
        const { songId } = req.body; // ID of the song to add
        const playlist = await Playlist.findById(req.params.playlistId);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Check if the song is already in the playlist
        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId); // Add the song ID to the playlist
            await playlist.save();
            res.json({ message: 'Song added to playlist', playlist });
        } else {
            res.status(400).json({ error: 'Song already in playlist' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// READ: Get all playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('songs');
        res.json(playlists);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// READ: Get a specific playlist by ID
router.get('/:playlistId', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId).populate('songs');
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.json(playlist);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// READ: Get all songs in a specific playlist by ID
router.get('/:playlistId/songs', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.playlistId).populate('songs');
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.json(playlist.songs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE: Delete a playlist by ID
router.delete('/:playlistId', async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndRemove(req.params.playlistId);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }
        res.json({ message: 'Playlist deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
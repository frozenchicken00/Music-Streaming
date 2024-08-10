const mongoose = require('mongoose');

const Playlist = mongoose.model('Playlist', new mongoose.Schema({
    name: { type: String, required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Reference Song model
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}));

module.exports = Playlist;
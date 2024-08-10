const mongoose = require('mongoose');

// Song Model
const Song = mongoose.model('Song', new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    duration: { type: Number, required: true },
    //audioUrl: { type: String, required: true },
    fileId: { type: String, required: true }
    // Add audioUrl field for storing song file URL
}));

module.exports = Song;
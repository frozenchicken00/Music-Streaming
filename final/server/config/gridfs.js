const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

const mongoURI = 'mongodb://localhost:27017/music-streaming-service'; // Use your MongoDB URI

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        return {
            filename: 'file_' + Date.now(),
            bucketName: 'songs' // Use a custom bucket name for storing songs
        };
    }
});

const upload = multer({ storage });

module.exports = upload;
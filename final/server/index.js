const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const songRoutes = require('./routes/song');
const playlistRoutes = require('./routes/playlist');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const { auth, isAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/music-streaming-service';


mongoose.connect(mongoURI)
    .then(async () => {
        console.log('MongoDB connected...');

        //To handle dup key error
        // try {
        //     const collection = mongoose.connection.db.collection('playlists');
        //     await collection.dropIndex('playlistCode_1');
        //     console.log('Index dropped successfully');
        // } catch (err) {
        //     console.log('Error in dropping index!', err);
        // }
    })
    .catch(err => console.log(err));


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500)
        .send('Something went wrong!');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)

);

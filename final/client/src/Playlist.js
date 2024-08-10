import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import MusicPlayer from './player.js';
import './player.css';
import './Playlist.css';
import { assets } from './assets/assets.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Playlist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdown1, setShowDropdown1] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [audioSrc, setAudioSrc] = useState('');
    const [audioTitle, setAudioTitle] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [songSelected, setSongSelected] = useState(false);
    const [currentSong, setCurrentSong] = useState({});
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [selectedSongId, setSelectedSongId] = useState('');
    const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

    useEffect(() => {
        fetchPlaylists();
        fetchAllSongs();
        fetchUserInfo();
    }, []);

    const fetchPlaylists = () => {
        axios.get("http://localhost:3001/api/playlists")
            .then((res) => {
                setPlaylists(res.data);
            })
            .catch((err) => {
                console.error("Error fetching playlists:", err);
            });
    };

    const fetchAllSongs = () => {
        axios.get("http://localhost:3001/api/songs")
            .then((res) => {
                setAllSongs(res.data);
            })
            .catch((err) => {
                console.error("Error fetching songs:", err);
            });
    };

    const onVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setShowDropdown1(false);
            return;
        }
        axios.get(`http://localhost:3001/api/songs?title=${searchTerm}`)
            .then(res => {
                setSearchResults(res.data);
                //setShowDropdown1(true);
            })
            .catch(err => {
                console.error('Error searching for songs:', err);
                setShowDropdown1(false);
            });
    };

    const handleSongClick = (song, index) => {
        const audioUrl = `http://localhost:3001/api/songs/file/${song.fileId}`;
        setAudioSrc(audioUrl);
        setAudioTitle(song.title);
        setIsPlaying(true);
        setCurrentSongIndex(index);
        setSongSelected(true);
        setCurrentSong({ title: song.title, artist: song.artist });
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    const handlePauseClick = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    };

    const handlePlayClick = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
        setIsPlaying(true);
    };

    const handlePrevClick = () => {
        const playlistSongs = allSongs;
        let newIndex = currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = playlistSongs.length - 1;
        }
        setCurrentSongIndex(newIndex);
        const newSong = playlistSongs[newIndex];
        const audioUrl = `http://localhost:3001/api/songs/file/${newSong.fileId}`;
        setAudioSrc(audioUrl);
        setIsPlaying(true);
        setCurrentSong({ title: newSong.title, artist: newSong.artist });
    };

    const handleNextClick = () => {
        const playlistSongs = allSongs;
        let newIndex = currentSongIndex + 1;
        if (newIndex >= playlistSongs.length) {
            newIndex = 0;
        }
        setCurrentSongIndex(newIndex);
        const newSong = playlistSongs[newIndex];
        const audioUrl = `http://localhost:3001/api/songs/file/${newSong.fileId}`;
        setAudioSrc(audioUrl);
        setIsPlaying(true);
        setCurrentSong({ title: newSong.title, artist: newSong.artist });
    };

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Token not found in local storage.");
                return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserInfo(response.data);
            console.log("User information:", response.data);
        } catch (error) {
            console.error("Error fetching user information:", error);
        }
    };

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handlePlaylistClick = (playlistId) => {
        axios.get(`http://localhost:3001/api/playlists/${playlistId}/songs`)
            .then(res => {
                setPlaylistSongs(res.data);
                setSelectedPlaylist(playlistId);
            })
            .catch(err => {
                console.error('Error fetching songs for playlist:', err);
            });
    };

    const createPlaylist = () => {
        if (newPlaylistName.trim()) {
            axios.post('http://localhost:3001/api/playlists', {
                name: newPlaylistName,
            })
                .then(response => {
                    console.log('Playlist created:', response.data);
                    setNewPlaylistName('');
                    fetchPlaylists();
                })
                .catch(error => console.error('Error creating playlist:', error));
        }
    };

    const addSongToPlaylist = (playlistId) => {
        axios.post(`http://localhost:3001/api/playlists/${playlistId}/songs`, {
            songId: selectedSongId,
        })
            .then(response => {
                console.log('Song added to playlist:', response.data);
                setShowAddToPlaylistModal(false);
                if (selectedPlaylist === playlistId) {
                    handlePlaylistClick(playlistId);
                }
            })
            .catch(error => console.error('Error adding song to playlist:', error));
    };

    const handleAddToPlaylist = (song) => {
        setSelectedSongId(song._id);
        setShowAddToPlaylistModal(true);
    };

    return (
        <div className="content">
            <header>
                <nav>
                    <span>
                        <li className="brand"><img src="icon.png" alt="Musicify Icon" /> Musicify <a href="/">Home</a> <a href="/playlist">Playlist</a> </li>
                    </span>
                </nav>
                <div className="header-content">
                    <div className="search-container">
                        <h1 className="search-heading"> </h1>
                        <input
                            type="text"
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search for songs..."
                        />
                        <button onClick={handleSearch} style={{ border: "none", background: "none" }}>
                            <FontAwesomeIcon icon={faSearch} style={{ color: 'white' }} />
                        </button>
                        {showDropdown1 && searchResults.length > 0 && (
                            <div className="dropdown-menu">
                                <ul>
                                    {searchResults.map((song, index) => (
                                        <li key={index} onClick={() => handleSongClick(song, index)}>
                                            {song.title} - {song.artist}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className='user-icon'>
                        <button onClick={toggleDropdown} style={{ background: 'green', border: 'none' }}>
                            <FontAwesomeIcon icon={faUser} />
                        </button>
                        {showDropdown && (
                            <div className="dropdown-menu">
                                <ul>
                                    <li><a href="/settings">Settings</a></li>
                                    <li><div onClick={logout}>Logout</div></li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main>
                <div className="playlist-container">
                    <h1 className="playlist-heading">Playlists</h1>
                    <div className="playlist-management">
                        <input
                            type="text"
                            placeholder="New Playlist Name"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                        />
                        <button onClick={createPlaylist}>
                            <FontAwesomeIcon icon={faPlus} /> Create Playlist
                        </button>
                    </div>
                    <div className="playlists-and-songs">
                        <div className="playlist-list">
                            <h2>Your Playlists</h2>
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist._id}
                                    onClick={() => handlePlaylistClick(playlist._id)}
                                    className={selectedPlaylist === playlist._id ? 'selected' : ''}
                                >
                                    {playlist.name}
                                </div>
                            ))}
                        </div>
                        {selectedPlaylist && (
                            <div className="playlist-songs">
                                <h2>Songs in Playlist</h2>
                                <ul>
                                    {playlistSongs.map((song, index) => (
                                        <li key={index} onClick={() => handleSongClick(song, index)}>
                                            {song.title} - {song.artist}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="search-results">
                        <h2>Search Results</h2>
                        <ul>
                            {searchResults.map((song, index) => (
                                <li key={index}>
                                    <span onClick={() => handleSongClick(song, index)}>
                                        {song.title} - {song.artist}
                                    </span>
                                    <button onClick={() => handleAddToPlaylist(song)}>Add to Playlist</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </main>
            <footer>
                <p>Email: hy0918@go.byuh.edu</p>
                <p>Welcome to Musicify! Your go-to platform for streaming your favorite music anytime, anywhere. With
                    Musicify, you can access an extensive library of songs, create personalized playlists, discover new music, and much more.</p>
            </footer>
            {songSelected && (
                <MusicPlayer
                    isPlaying={isPlaying}
                    onPlayClick={handlePlayClick}
                    onPauseClick={handlePauseClick}
                    onPrevClick={handlePrevClick}
                    onNextClick={handleNextClick}
                    volume={volume}
                    onVolumeChange={onVolumeChange}
                    currentSong={{ name: currentSong.title, artist: currentSong.artist }}
                />
            )}
            {showAddToPlaylistModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Add to Playlist</h2>
                        {playlists.map(playlist => (
                            <button key={playlist._id} onClick={() => addSongToPlaylist(playlist._id)}>
                                {playlist.name}
                            </button>
                        ))}
                        <button onClick={() => setShowAddToPlaylistModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
            {audioSrc && (
                <audio ref={audioRef} src={audioSrc} autoPlay={isPlaying} onEnded={handleAudioEnded} />
            )}
        </div>
    );
};

export default Playlist;
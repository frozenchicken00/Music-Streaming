import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import MusicPlayer from './player.js';
import './player.css';
import { assets } from './assets/assets.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdown1, setShowDropdown1] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allSongs, setAllSongs] = useState([]);
    const [audioSrc, setAudioSrc] = useState('');
    const [/*audioTitle*/, setAudioTitle] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [songSelected, setSongSelected] = useState(false);
    const [currentSong, setCurrentSong] = useState({});
    const [, setUserInfo] = useState(null);
    const navigate = useNavigate();

    const audioRef = useRef(null);
    const onVolumeChange = (event) => {
        const newVolume = event.target.value; // Assuming the input range is 0 to 100
        setVolume(newVolume); // Update the volume state
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100; // Use audioRef.current to reference the HTML audio element and adjust for the range
        }
    };

    useEffect(() => {
        const fetchAllSongs = async () => {
            try {
                const response = await axios.get("http://localhost:3001/api/songs");
                setAllSongs(response.data);
            } catch (error) {
                console.error("Error fetching all songs:", error);
            }
        };
        fetchAllSongs();
    }, []);

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setShowDropdown1(false); // Hide the dropdown if the search term is empty
            return;
        }
        axios.get(`http://localhost:3001/api/songs?title=${searchTerm}`)
            .then(res => {
                setSearchResults(res.data);
                setShowDropdown1(true); // Show the dropdown when there are results
            })
            .catch(err => {
                console.error('Error searching for songs:', err);
                setShowDropdown1(false); // Hide the dropdown on error
            });
    };

    const handleSongClick = (song, index) => () => {
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

    const handlePrevClick = (song) => {
        // Calculate the new index, ensuring it wraps around to the last song if currently at the first song
        let newIndex = currentSongIndex - 1;
        if (newIndex < 0) {
            newIndex = allSongs.length - 1; // Wrap to last song
        }
        // Update the current song index
        setCurrentSongIndex(newIndex);
        // Update the audio source and title for the new song
        const newSong = allSongs[newIndex];
        const audioUrl = `http://localhost:3001/api/songs/file/${newSong.fileId}`;
        setAudioSrc(audioUrl);
        setIsPlaying(true); // Optionally play the song automatically
        setCurrentSong({ title: newSong.title, artist: newSong.artist });
    };

    const handleNextClick = (song) => {
        // Calculate the new index, ensuring it wraps around to the first song if currently at the last song
        let newIndex = currentSongIndex + 1;
        if (newIndex >= allSongs.length) {
            newIndex = 0; // Wrap to first song
        }
        // Update the current song index
        setCurrentSongIndex(newIndex);
        // Update the audio source and title for the new song
        const newSong = allSongs[newIndex];
        const audioUrl = `http://localhost:3001/api/songs/file/${newSong.fileId}`;
        setAudioSrc(audioUrl);
        setIsPlaying(true); // Optionally play the song automatically
        setCurrentSong({ title: newSong.title, artist: newSong.artist });
    };

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Token not found in local storage.");
                return;
            }
            // Decode the token to get the user's ID
            const decoded = jwtDecode(token);
            const userId = decoded.id; // Assuming the ID is stored under [`userId`]

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
        // Remove the token from local storage
        localStorage.removeItem('token');

        // Use navigate to redirect to the login page
        navigate('/login');
    };

    return (
        <div className="content">
            <header>
                <nav>
                    <span>
                        <li class="brand"><img src="icon.png" alt="Musicify Icon" /> Musicify <a href="/">Home</a> <a href="/playlist">Playlist</a> </li>
                    </span>
                </nav>
                <div className="header-content">
                    <div className="search-container">
                        <h1 className="search-heading"> </h1>
                        <input
                            type="text"
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)} />
                        <button onClick={handleSearch} style={{ border: "none", background: "none" }}>
                            <img src={assets.search_icon} alt="Search" style={{ width: '17px', height: '17px' }} />
                        </button>
                        {showDropdown1 && searchResults.length > 0 && (
                            <div className="dropdown-menu">
                                <ul>
                                    {searchResults.map((song, index) => (
                                        <li key={index} onClick={handleSongClick(song, index)}>
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
                <section className="featured-albums">
                    <div className="album">
                        <img src="blackskirt.png" alt="Album Cover" />
                        <h3>TEAM BABY</h3>
                        <p>The Black Skirts</p>
                        <img src="creep.png" alt="Album Cover" />
                        <h3>Pablo Honey</h3>
                        <p>Radiohead</p>
                    </div>
                    <div className="album">
                        <img src="showbiz.png" alt="Album Cover" />
                        <h3>Showbiz</h3>
                        <p>Muse</p>
                        <img src="Parachutes.png" alt="Album Cover" />
                        <h3>Parachutes</h3>
                        <p>Coldplay</p>
                    </div>
                    <div className="album">
                        <img src="UnorthodoxJukebox.png" alt="Album Cover" />
                        <h3>Unorthodox Jukebox</h3>
                        <p>Bruno Mars</p>
                        <img src="The2ndLaw.png" alt="Album Cover" />
                        <h3>The 2nd Law</h3>
                        <p>Muse</p>
                    </div>
                    <div className="album">
                        <img src="Revelation.png" alt="Album Cover" />
                        <h3>Revelation</h3>
                        <p>Journey</p>
                        <img src="TheBlackParade.png" alt="Album Cover" />
                        <h3>The Black Parade</h3>
                        <p>My Chemical Romance</p>
                    </div>
                </section>
                <div className="search-results-container">
                    {audioSrc && (
                        <div>
                            <audio ref={audioRef} src={audioSrc} autoPlay={isPlaying} onEnded={handleAudioEnded} />
                        </div>
                    )}
                </div>
            </main>
            <footer>
                <p>Email: hy0918@go.byuh.edu</p>
                <p>Welcome to Musicify! Your go-to platform for streaming your favorite music anytime, anywhere. With
                    Musicify, you can access an extensive library of songs, create personalized playlists, discover new music, and much more.</p>
            </footer>
            <div>
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
            </div>
        </div>
    );
};

export default Search;

import React from 'react';
import './player.css';
import { assets } from './assets/assets.js';

const MusicPlayer = ({ isPlaying, onPlayClick, onPauseClick, onPrevClick, onNextClick, volume, onVolumeChange, currentSong }) => {
    return (
        <div className="music-player">
            <div className="song-info">
                <span className="song-name">{currentSong?.name}</span>
                <span className="song-artist">{currentSong?.artist}</span>
            </div>
            <div className="controls">
                <button onClick={onPrevClick}><img src={assets.prev_icon} alt="Previous" /></button>
                {isPlaying ? (
                    <button onClick={onPauseClick}><img src={assets.pause_icon} alt="Pause" /></button>
                ) : (
                    <button onClick={onPlayClick}><img src={assets.play_icon} alt="Play" /></button>
                )}
                <button onClick={onNextClick}><img src={assets.next_icon} alt="Next" /></button>
            </div>
            <div className="volume-control">
                <input type="range" min="0" max="100" value={volume} onChange={onVolumeChange} />
            </div>
        </div>
    );
};

export default MusicPlayer;
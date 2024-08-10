import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Playlist from './Playlist';
import Search from './Search';
import Login from './Login';
import Register from './Register';
import SettingsPage from './Setting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
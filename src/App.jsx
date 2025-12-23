import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// Import sound files
import soundA from './assets/sounds/sound-a.mp3';
import soundB from './assets/sounds/sound-b.mp3';
import soundC from './assets/sounds/sound-c.mp3';
import soundD from './assets/sounds/sound-d.mp3';
import soundE from './assets/sounds/sound-e.mp3';
import soundF from './assets/sounds/sound-f.mp3';
import soundG from './assets/sounds/sound-g.mp3';

export default function AdS() {
  const [selectedSounds, setSelectedSounds] = useState([]);
  const [frequency, setFrequency] = useState(5);
  const [volume, setVolume] = useState(20);
  const [isRunning, setIsRunning] = useState(false);
  const [nextPlayTime, setNextPlayTime] = useState(null);
  const [playLogs, setPlayLogs] = useState([]);
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);

  // Sample sounds - in production, these would be actual audio files
  const sounds = [
    { id: 'A', name: '客艙服務鈴', url: soundA },
    { id: 'B', name: '安全帶', url: soundB },
    { id: 'C', name: '簡訊聲', url: soundC },
    { id: 'D', name: 'LINE聲響 1', url: soundD },
    { id: 'E', name: 'LINE聲響 2', url: soundE },
    { id: 'E', name: 'LINE聲響 3', url: soundF },
    { id: 'E', name: 'LINE聲響 4', url: soundG },
  ];

  const handleSoundToggle = (soundId) => {
    setSelectedSounds(prev => 
      prev.includes(soundId) 
        ? prev.filter(id => id !== soundId)
        : [...prev, soundId]
    );
  };

  const resetSounds = () => {
    setSelectedSounds([]);
  };

  const resetSettings = () => {
    setFrequency(5);
    setVolume(20);
  };

  const playTestSound = (soundUrl) => {
    const audio = new Audio(soundUrl);
    audio.volume = volume / 100;
    audio.play();
  };

  const playRandomSound = () => {
    if (selectedSounds.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * selectedSounds.length);
    const selectedSoundId = selectedSounds[randomIndex];
    const sound = sounds.find(s => s.id === selectedSoundId);
    
    if (sound) {
      const audio = new Audio(sound.url);
      audio.volume = volume / 100;
      audio.play();
      
      // Log the play event with UTC+8 timestamp
      const now = new Date();
      const utc8Time = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const timestamp = utc8Time.toISOString().replace('T', ' ').substring(0, 19);
      
      setPlayLogs(prev => [{
        timestamp: timestamp,
        sound: sound.name
      }, ...prev].slice(0, 50)); // Keep last 50 logs
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      // Stop
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsRunning(false);
      setNextPlayTime(null);
      setPlayLogs([]); // Clear play logs when stopping
    } else {
      // Start
      if (selectedSounds.length === 0) {
        alert('Bitte wählen Sie mindestens einen Sound aus!');
        return;
      }
      setIsRunning(true);
    }
  };

  useEffect(() => {
    if (isRunning && selectedSounds.length > 0) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Schedule the next sound
      const randomDelay = Math.random() * frequency * 60 * 1000;
      
      timeoutRef.current = setTimeout(() => {
        playRandomSound();
      }, randomDelay);
      
      setNextPlayTime(Date.now() + randomDelay);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRunning, frequency, selectedSounds, volume, playLogs]);

  return (
    <div className="ads-container">
      <div className="ads-title">
        <h1>AdS</h1>
        <h2>Aufmerksamkeit der Schüler</h2>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-title">Sounds</legend>
        <div className="fieldset-header">
          <div></div>
          <button className="reset-button" onClick={resetSounds}>
            Reset
          </button>
        </div>
        <div className="sounds-grid">
          {sounds.map(sound => (
            <div key={sound.id} className="sound-item">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  className="sound-checkbox"
                  checked={selectedSounds.includes(sound.id)}
                  onChange={() => handleSoundToggle(sound.id)}
                  id={`sound-${sound.id}`}
                />
              </div>
              <div className="sound-name">{sound.name}</div>
              <button 
                className="test-button"
                onClick={() => playTestSound(sound.url)}
              >
                TEST
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-title">Settings</legend>
        <div className="fieldset-header">
          <div></div>
          <button className="reset-button" onClick={resetSettings}>
            Reset
          </button>
        </div>
        <div className="settings-grid">
          <div className="setting-item">
            <div className="setting-label">Frequency</div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="60"
                value={frequency}
                onChange={(e) => setFrequency(parseInt(e.target.value))}
                className="slider"
              />
              <div className="value-display">{frequency} min</div>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">Volume</div>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="slider"
              />
              <div className="value-display">{volume} %</div>
            </div>
          </div>
        </div>
      </fieldset>

      <div className="start-button-container">
        <button 
          className={`start-button ${isRunning ? 'running' : ''}`}
          onClick={handleStartStop}
        >
          {isRunning ? 'STOP' : 'START'}
        </button>
      </div>

      <div className="play-log-container">
        <div className="play-log-title">Play Log (UTC+8)</div>
        <div className="play-log-list">
          {playLogs.length === 0 ? (
            <div className="play-log-empty">No sounds played yet...</div>
          ) : (
            playLogs.map((log, index) => (
              <div key={index} className="play-log-item">
                <span className="play-log-timestamp">{log.timestamp}</span>
                <span className="play-log-sound">{log.sound}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
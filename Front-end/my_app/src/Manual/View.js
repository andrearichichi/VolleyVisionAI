import React, { useState, useEffect } from 'react';
import './css/View.css';
import { useUnifiedContext } from '../UnifiedContext';
import ExportButton from './ExportButton';

const ViewComponent = () => {
  const { time, setTime, shortcuts, activatedShortcuts, activateShortcut, updateRatingForShortcut, removeShortcut, playerList, actionList } = useUnifiedContext();

  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('title');
  const [searchResults, setSearchResults] = useState([]);
  const [ratings, setRatings] = useState({});
  const [groupByTitle, setGroupByTitle] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCreateClip, setShowCreateClip] = useState(false);
  const [clipDuration, setClipDuration] = useState(1);

  const { playerRef } = useUnifiedContext();

  const handleDeleteShortcut = (id) => {
    removeShortcut(id);
  };

  const handleReload = () => {
    setShowConfirm(true);
  };

  const handleExport = () => {
    const dataToExport = {
      playerList,
      actionList,
      videoTime: time,
      shortcuts: shortcuts.map(s => ({
        key: s.key,
        title: s.title,
        description: s.description
      })),
      activatedShortcuts: activatedShortcuts.map(as => ({
        key: as.key,
        title: as.title,
        description: as.description,
        time: as.time,
        rating: as.rating
      }))
    };

    const fileName = "exported_data.json";
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmReload = () => {
    setShowConfirm(false);
    window.location.reload();
  };

  const handleCancelReload = () => {
    setShowConfirm(false);
  };

  const handleUpload = async (duration) => {
    setIsLoading(true);
    const videoFile = playerRef.current.getInternalPlayer().src;

    const response = await fetch(videoFile);
    const blob = await response.blob();
    const file = new File([blob], "video.mp4", { type: "video/mp4" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("shortcuts", JSON.stringify(activatedShortcuts));
    formData.append("duration", duration); // Aggiunta della durata

    const uploadResponse = await fetch("http://127.0.0.1:8000/upload-video/", {
        method: "POST",
        body: formData,
    });

    if (uploadResponse.ok) {
        const blob = await uploadResponse.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'final_clip.mp4');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } else {
        console.error('Upload failed:', await uploadResponse.json());
    }

    setIsLoading(false);
};


  const handleCreateClip = () => {
    setShowCreateClip(false);
    handleUpload(clipDuration); // Passa la durata al caricamento
  };

  useEffect(() => {
    const results = searchText.trim()
      ? activatedShortcuts.filter(shortcut =>
          shortcut[searchField].toLowerCase().startsWith(searchText.toLowerCase())
        )
      : activatedShortcuts;
    setSearchResults(results);
  }, [activatedShortcuts, searchText, searchField]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const modifierKey = event.metaKey ? 'Cmd+' : event.ctrlKey ? 'Ctrl+' : '';
      const key = event.code;
      const adaptedKey = key.startsWith('Key') ? key.replace('Key', '') : key;
      const keyCombination = `${modifierKey}${adaptedKey}`;
    
      const foundShortcut = shortcuts.find((shortcut) => shortcut.key.toUpperCase() === keyCombination.toUpperCase());
      if (foundShortcut) {
        event.preventDefault();
        const newActivatedShortcut = {  
          id: Date.now() + Math.random(),
          title: foundShortcut.title,
          description: foundShortcut.description,
          time: time.toFixed(2), 
          rating: ratings[foundShortcut.id] || 0
        };
        activateShortcut(newActivatedShortcut);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, time, ratings, activateShortcut]);

  const handleSetTime = (clickedTime) => {
    setTime(Number(clickedTime));
  };

  const handleRatingChange = (id, newRating) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [id]: newRating,
    }));
    updateRatingForShortcut(id, newRating);
  };

  const groupedShortcuts = searchResults.reduce((acc, shortcut) => {
    const key = groupByTitle ? shortcut.title : shortcut.description;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(shortcut);
    return acc;
  }, {});

  return (
    <div className="view-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-message">
            Videoclip creating...
          </div>
        </div>
      )}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <button onClick={handleCancelReload} className="close-button">&times;</button>
            <p>Do you want to export the project before returning to the menu?</p>
            <button onClick={handleExport} className="confirm-button">Export Project</button>
            <button onClick={handleConfirmReload} className="confirm-button">Back to Menu</button>
          </div>
        </div>
      )}
      {showCreateClip && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <button onClick={() => setShowCreateClip(false)} className="close-button">&times;</button>
            <p>Select the duration of each clip:</p>
            <input
              type="range"
              min="1"
              max="10"
              value={clipDuration}
              onChange={(e) => setClipDuration(e.target.value)}
              className="clip-duration-slider"
            />
            <span>{clipDuration} s</span>
            <button onClick={handleCreateClip} className="confirm-button">Create</button>
          </div>
        </div>
      )}
      <div className="top-left-button-container">
        <button onClick={handleReload} className="reload-button">Back to Menu</button>
      </div>
      <div className="button-container-info">
        <ExportButton />
        <button onClick={() => setShowCreateClip(true)} className="upload-button">Create VideoClip</button>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder={`Search by ${searchField === 'title' ? 'Player' : 'Action'}...`}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="search-selector"
        >
          <option value="title">Player</option>
          <option value="description">Action</option>
        </select>
        <button onClick={() => setGroupByTitle(prev => !prev)} className="group-toggle-button">
          View {groupByTitle ? 'Action' : 'Player'}
        </button>
      </div>
      <div className="view-list">
        {Object.keys(groupedShortcuts).map((key, index) => (
          <details key={index} className="view-item">
            <summary className="view-title">{key} ({groupedShortcuts[key].length})</summary>
            {groupedShortcuts[key].map((shortcut, sIndex) => (
              <div key={sIndex} className="view-detail">
                <div className="view-description">
                  {groupByTitle ? shortcut.description : shortcut.title}
                </div>
                <div className="view-time" onClick={() => handleSetTime(shortcut.time)}>
                  {shortcut.time}
                </div>
                <div className="view-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <div 
                      key={star}
                      className={`star-rating ${ratings[shortcut.id] >= star ? 'selected' : ''}`}
                      onClick={() => handleRatingChange(shortcut.id, star)}
                    />
                  ))}
                </div>
                <button className="delete-button" onClick={() => handleDeleteShortcut(shortcut.id)}></button>
              </div>
            ))}
          </details>
        ))}
      </div>
    </div>
  );
};

export default ViewComponent;

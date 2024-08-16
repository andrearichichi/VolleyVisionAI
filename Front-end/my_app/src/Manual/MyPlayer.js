import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import './css/MyPlayer.css';
import { useUnifiedContext } from '../UnifiedContext';

const MyPlayer = ({ file }) => {
  const { time, playerRef } = useUnifiedContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isBuffering, setIsBuffering] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#3BA6D4'); // Colore iniziale della penna
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const eraserSize = 50; // Riduciamo la dimensione della gomma
  const canvasRef = useRef(null);
  const eraserRef = useRef(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && player.seekTo && !isPlaying) {
      player.seekTo(time, 'seconds');
    }
  }, [time, isPlaying, playerRef]);

  const handleBuffer = () => {
    setIsBuffering(true);
  };

  const handleBufferEnd = () => {
    setIsBuffering(false);
  };

  const handleToolChange = (newTool) => {
    setTool(newTool);
    if (newTool === 'eraser') {
      canvasRef.current.eraseMode(true);
      eraserRef.current.style.display = 'block';
    } else {
      canvasRef.current.eraseMode(false);
      eraserRef.current.style.display = 'none';
    }
  };

  const handleMouseMove = (event) => {
    if (eraserRef.current) {
      eraserRef.current.style.left = `${event.clientX - eraserSize / 2}px`;
      eraserRef.current.style.top = `${event.clientY - eraserSize / 2}px`;
    }
  };

  const handleMouseDown = (event) => {
    if (tool === 'eraser' && canvasRef.current) {
      const canvasContainer = canvasRef.current.canvasContainer;
      if (canvasContainer) {
        const boundingRect = canvasContainer.getBoundingClientRect();
        const x = event.clientX - boundingRect.left;
        const y = event.clientY - boundingRect.top;
        canvasRef.current.getSketchingPath().then(paths => {
          const touchedPaths = paths.filter(path => 
            path.points.some(point => 
              Math.abs(point.x - x) < eraserSize / 2 && Math.abs(point.y - y) < eraserSize / 2
            )
          );
          touchedPaths.forEach(path => canvasRef.current.erasePath(path.id));
        });
      }
    }
  };

  return (
    <div className="player-wrapper" onMouseMove={handleMouseMove} onMouseDown={handleMouseDown}>
      <ReactPlayer
        ref={playerRef}
        className="react-player"
        url={videoUrl}
        width="100%"
        height="100%"
        controls={true}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
      />
      {isBuffering && <div className="loading-spinner">Loading...</div>}
      <button 
        onClick={() => setShowCanvas(!showCanvas)} 
        className={`canvas-button ${showCanvas ? 'active' : ''}`}
      >
        Draw In
      </button>
      {showCanvas && (
        <>
          <div className="drawing-dashboard">
            <button 
              className={`tool-button ${tool === 'pen' ? 'active' : ''}`} 
              onClick={() => handleToolChange('pen')}
            >
              Pen
            </button>
            <button 
              className={`tool-button ${tool === 'eraser' ? 'active' : ''}`} 
              onClick={() => handleToolChange('eraser')}
            >
              Eraser
            </button>
            <input 
              type="color" 
              value={strokeColor} 
              onChange={(e) => setStrokeColor(e.target.value)} 
              className="color-picker" 
            />
          </div>
          <ReactSketchCanvas
            ref={canvasRef}
            style={{ position: 'absolute', top: '1.5%', right: '1%', width: '61.8%', height: '52%', zIndex: 500 }}
            strokeWidth={tool === 'pen' ? 5 : eraserSize}
            strokeColor={tool === 'pen' ? strokeColor : 'rgba(0,0,0,0)'}
            canvasColor="rgba(0,0,0,0)"
            eraserWidth="50"
          />
          <div ref={eraserRef} className="eraser-indicator" style={{ width: eraserSize, height: eraserSize, borderColor: '#3BA6D4' }}></div>
        </>
      )}
    </div>
  );
};

export default MyPlayer;

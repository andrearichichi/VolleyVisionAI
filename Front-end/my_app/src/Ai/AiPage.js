import React, { useState } from 'react';
import MainPlayer from './MainPlayer';
import AiConfiguration from './AiConfiguration';
import './css/AiPage.css';
import { UnifiedProvider } from '../UnifiedContext';

const AiPage = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [recognitionType, setRecognitionType] = useState('');

  const handleFinishUpload = (url, type) => {
    setVideoUrl(url);
    setRecognitionType(type);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'processed_video.mp4'; // Puoi cambiare il nome del file come preferisci
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRecognitionText = (type) => {
    if (type === 'Ball Recognition') {
      return 'Video with ball trajectory recognition model applied';
    } else if (type === 'Player Recognition') {
      return 'Video with individual player recognition model applied';
    }
    return `Video with ${type} model applied`;
  };

  return (
    <UnifiedProvider>
      <div className="ai-page-container">
        <div className="top-left-button-container">
          <button onClick={handleReload} className="reload-button-second">Back to Menu</button>
        </div>
        {videoUrl && (
          <div className="top-right-button-container">
            <button onClick={handleDownload} className="download-button">Download</button>
          </div>
        )}
        {videoUrl ? (
          <div className="content-container">
            <h2 className="recognition-type">{getRecognitionText(recognitionType)}</h2>
            <div className="video-container">
              <MainPlayer files={[videoUrl]} />
            </div>
          </div>
        ) : (
          <AiConfiguration onFinish={handleFinishUpload} />
        )}
      </div>
    </UnifiedProvider>
  );
};

export default AiPage;

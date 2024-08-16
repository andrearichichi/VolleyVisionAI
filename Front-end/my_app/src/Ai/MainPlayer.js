import React from 'react';
import ReactPlayer from 'react-player';
import './css/MainPlayer.css';

const MainPlayer = ({ files }) => {
  return (
    <div className="players-container">
      {files.map((file, index) => (
          <ReactPlayer
            className="ai-react-player"
            url={file}
            width="100%"
            height="100%"
            controls={true}
          />
      ))}
    </div>
  );
};

export default MainPlayer;

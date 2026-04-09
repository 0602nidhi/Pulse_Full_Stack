import React, { useRef, useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState(null);

  // When active video changes, reset error state
  useEffect(() => {
    setError(null);
    if (videoRef.current) {
       videoRef.current.load();
    }
  }, [video]);

  // Construct stream URL from Axios config context basically
  // The stream endpoint leverages browser native HTTP range request via src prop
  // Because the route is protected by JWT, it's tricky to pass JWT in generic src=""
  // A clean workaround is passing token as a query param for the stream specifically
  
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  const streamUrl = `http://localhost:5000/api/videos/stream/${video._id}?token=${token}`; 

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden aspect-video relative group border border-surface-light shadow-inner">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
           <p className="text-danger font-medium">{error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          className="w-full h-full object-contain"
          onError={(e) => setError("Error loading video stream")}
        >
          {/* We must update backend to accept token from query params if there's no bearer header for video src streaming compatibility */}
          <source src={streamUrl} type={video.mimeType} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;

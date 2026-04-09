import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { io } from 'socket.io-client';
import { ShieldCheck, ShieldAlert, Clock, AlertCircle, Video } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [activeVideo, setActiveVideo] = useState(null);
  const [filter, setFilter] = useState('all'); // all, safe, flagged

  useEffect(() => {
    fetchVideos();

    const socket = io('http://localhost:5000');

    socket.on('video_processing_started', ({ videoId }) => {
      updateVideoStatus(videoId, 'processing');
    });

    socket.on('video_processing_progress', ({ videoId, progress }) => {
      // Could display progress bar on dashboard for active processing items
    });

    socket.on('video_processing_complete', ({ videoId, status }) => {
      updateVideoStatus(videoId, status);
    });

    return () => socket.disconnect();
  }, [filter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = '/videos';
      if (filter !== 'all') {
         url += `?status=${filter}`;
      }
      const { data } = await api.get(url);
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVideoStatus = (id, newStatus) => {
    setVideos(prev => 
      prev.map(v => v._id === id ? { ...v, status: newStatus } : v)
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return <ShieldCheck className="w-4 h-4 text-secondary" />;
      case 'flagged': return <ShieldAlert className="w-4 h-4 text-danger" />;
      case 'processing': return <Clock className="w-4 h-4 text-warning animate-pulse" />;
      default: return <AlertCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const filteredVideos = videos.filter(v => {
    if (user.role === 'Viewer' && v.status !== 'safe') return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Video Library</h1>
        
        {user.role !== 'Viewer' && (
          <div className="flex gap-2">
             <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted hover:bg-surface'}`}>All</button>
             <button onClick={() => setFilter('safe')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'safe' ? 'bg-secondary text-white' : 'bg-surface-light text-text-muted hover:bg-surface'}`}>Safe</button>
             <button onClick={() => setFilter('flagged')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'flagged' ? 'bg-danger text-white' : 'bg-surface-light text-text-muted hover:bg-surface'}`}>Flagged</button>
          </div>
        )}
      </div>

      {activeVideo && (
        <div className="mb-12 bg-surface p-6 rounded-2xl border border-surface-light shadow-2xl">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h2 className="text-xl font-bold flex items-center gap-2">
                 {activeVideo.title}
                 {getStatusIcon(activeVideo.status)}
               </h2>
               <p className="text-text-muted text-sm mt-1">{activeVideo.description || 'No description provided.'}</p>
             </div>
             <button onClick={() => setActiveVideo(null)} className="p-2 bg-surface-light hover:bg-opacity-80 rounded-full text-text-muted">✕</button>
          </div>
          <VideoPlayer video={activeVideo} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse bg-surface h-64 rounded-2xl border border-surface-light"></div>
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-surface-light">
          <Video className="w-16 h-16 text-surface-light mx-auto mb-4" />
          <h3 className="text-xl font-medium text-text-muted">No videos found</h3>
          <p className="text-sm text-surface-light mt-2">Upload some videos to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(video => (
            <div 
              key={video._id} 
              className="bg-surface rounded-2xl border border-surface-light overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => {
                if (video.status === 'safe' || user.role !== 'Viewer') {
                  setActiveVideo(video)
                }
              }}
            >
              <div className="aspect-video bg-surface-light relative flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Video className="w-12 h-12 text-surface opacity-50 shadow-sm" />
                <div className="absolute top-3 right-3 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium border border-white/5">
                  {getStatusIcon(video.status)}
                  <span className="capitalize">{video.status}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate mb-1 group-hover:text-primary transition-colors">{video.title}</h3>
                <div className="flex justify-between items-center text-xs text-text-muted">
                  <span>{(video.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

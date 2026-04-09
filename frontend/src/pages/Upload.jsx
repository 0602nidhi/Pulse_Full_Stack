import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, AlertCircle, X } from 'lucide-react';
import { io } from 'socket.io-client';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, complete, error
  const [videoId, setVideoId] = useState(null);
  const [finalStatus, setFinalStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let socket;
    if (status === 'processing' || status === 'complete') {
      socket = io('http://localhost:5000');
      
      socket.on('video_processing_progress', (data) => {
        if (data.videoId === videoId) {
          setProcessingProgress(data.progress);
        }
      });

      socket.on('video_processing_complete', (data) => {
        if (data.videoId === videoId) {
          setStatus('complete');
          setFinalStatus(data.status); // 'safe' or 'flagged'
          setProcessingProgress(100);
        }
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [status, videoId]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setTitle(e.target.files[0].name.split('.')[0]); // Default title
      setStatus('idle');
      setUploadProgress(0);
      setProcessingProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const { data } = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      
      setVideoId(data._id);
      setStatus('processing');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-surface p-8 rounded-2xl border border-surface-light shadow-xl">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <UploadCloud className="text-primary w-6 h-6" />
          Upload Video
        </h1>

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleSubmit}>
             <div 
               className="border-2 border-dashed border-surface-light hover:border-primary/50 transition-colors rounded-2xl p-12 text-center mb-6 relative cursor-pointer group"
             >
               <input 
                 type="file" 
                 accept="video/mp4,video/webm,video/x-matroska,video/avi" 
                 onChange={handleFileChange}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <UploadCloud className="w-16 h-16 text-text-muted group-hover:text-primary transition-colors mx-auto mb-4" />
               <p className="font-medium text-lg mb-1">{file ? file.name : 'Drag & drop your video here'}</p>
               <p className="text-sm text-text-muted">{file ? `${(file.size / (1024*1024)).toFixed(2)} MB` : 'or click to browse from your computer'}</p>
             </div>

             {file && (
               <div className="space-y-4 mb-8">
                 <div>
                   <label className="block text-sm font-medium mb-1 text-text-muted">Title</label>
                   <input 
                     type="text" 
                     className="w-full bg-surface-light border border-surface border-opacity-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-text"
                     placeholder="Video Title"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 text-text-muted">Description (Optional)</label>
                   <textarea 
                     className="w-full bg-surface-light border border-surface border-opacity-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-text min-h-[100px]"
                     placeholder="Brief description about the video..."
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                   />
                 </div>
               </div>
             )}

             <div className="flex gap-4 justify-end">
               <button 
                 type="button" 
                 onClick={() => navigate('/')}
                 className="px-6 py-3 rounded-lg font-medium text-text-muted hover:text-text transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="submit" 
                 disabled={!file}
                 className="bg-primary hover:bg-primary-dark disabled:bg-surface-light disabled:text-text-muted disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
               >
                 Upload
               </button>
             </div>
          </form>
        ) : (
          <div className="py-8">
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className={status === 'uploading' ? 'text-primary' : 'text-text'}>1. Uploading</span>
                {status === 'uploading' && <span>{uploadProgress}%</span>}
                {status !== 'uploading' && <CheckCircle className="w-4 h-4 text-secondary" />}
              </div>
              <div className="w-full bg-surface-light rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${status === 'uploading' ? uploadProgress : 100}%` }}></div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className={status === 'processing' ? 'text-warning' : status === 'complete' ? 'text-text' : 'text-text-muted'}>
                  2. Sensitivity Analysis Processing
                </span>
                {status === 'processing' && <span className="text-warning">{processingProgress}%</span>}
                {status === 'complete' && <CheckCircle className="w-4 h-4 text-secondary" />}
              </div>
              <div className="w-full bg-surface-light rounded-full h-2.5 overflow-hidden">
                <div className="bg-warning h-2.5 rounded-full transition-all duration-300" style={{ width: `${processingProgress}%` }}></div>
              </div>
              {status === 'processing' && (
                 <p className="text-xs text-text-muted mt-2 text-right animate-pulse">Running AI content moderation models...</p>
              )}
            </div>

            {status === 'complete' && (
              <div className={`p-6 rounded-xl border flex gap-4 items-start ${finalStatus === 'safe' ? 'bg-secondary/10 border-secondary/20' : 'bg-danger/10 border-danger/20'}`}>
                {finalStatus === 'safe' ? <CheckCircle className="w-8 h-8 text-secondary shrink-0" /> : <AlertCircle className="w-8 h-8 text-danger shrink-0" />}
                <div>
                  <h3 className={`font-bold text-lg ${finalStatus === 'safe' ? 'text-secondary' : 'text-danger'} capitalize`}>
                    Video is {finalStatus}
                  </h3>
                  <p className="text-text-muted mt-1 text-sm">
                    {finalStatus === 'safe' 
                      ? 'Your video has passed the sensitivity analysis and is now available in the library.' 
                      : 'Your video was flagged for sensitive content and may be restricted to administrative review.'}
                  </p>
                  <button onClick={() => navigate('/')} className="mt-4 bg-surface hover:bg-surface-light px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-surface-light">
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;

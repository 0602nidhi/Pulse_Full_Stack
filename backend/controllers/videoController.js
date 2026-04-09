const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');

// @desc    Upload a new video
// @route   POST /api/videos/upload
// @access  Private (Admin, Editor)
const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const video = await Video.create({
      title: req.body.title || req.file.originalname,
      description: req.body.description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploaderId: req.user._id,
      organizationId: req.user.organizationId,
      status: 'pending',
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json(video);

    // After responding with the initial pending state, we notify socket logic to begin mock processing.
    // This is handled in the server level or we can import the io instance.
    // I will trigger an event locally using Node's standard event emitter so server.js can catch it.
    const eventEmitter = req.app.get('eventEmitter');
    if (eventEmitter) {
      eventEmitter.emit('video_uploaded', video);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading video' });
  }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
  const { role, organizationId } = req.user;

  let query = { organizationId };

  // Viewer can only see 'safe' videos. Admin and Editor can see all videos in their organization.
  if (role === 'Viewer') {
    query.status = 'safe';
  }

  // Example filtering options for Stretch Goal
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  if (req.query.search) {
     query.title = { $regex: req.query.search, $options: 'i' };
  }

  const videos = await Video.find(query).populate('uploaderId', 'name').sort('-createdAt');
  res.json(videos);
};

// @desc    Stream video
// @route   GET /api/videos/stream/:id
// @access  Private
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Role check
    if (req.user.role === 'Viewer' && video.status !== 'safe') {
       return res.status(403).json({ message: 'Access denied: Video is not marked as safe' });
    }

    // Multi-tenant check
    if (video.organizationId.toString() !== req.user.organizationId.toString() && req.user.role !== 'Admin') {
       return res.status(403).json({ message: 'Access denied: Cannot view another organization\'s videos' });
    }

    const videoPath = path.join(__dirname, '../uploads/videos', video.filename);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': video.mimeType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': video.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error streaming video' });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  streamVideo,
};

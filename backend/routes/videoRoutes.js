const express = require('express');
const router = express.Router();
const { uploadVideo, getVideos, streamVideo } = require('../controllers/videoController');
const { protect, editorOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getVideos);

router.route('/upload')
  .post(protect, editorOrAdmin, upload.single('video'), uploadVideo);

router.route('/stream/:id')
  .get(protect, streamVideo);

module.exports = router;

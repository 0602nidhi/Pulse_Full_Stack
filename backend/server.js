require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const EventEmitter = require('events');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');

// Import Video Model
const Video = require('./models/Video');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// File upload dir static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// App-wide event emitter for decoupled modules
const appEvents = new EventEmitter();
app.set('eventEmitter', appEvents);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Socket.io config
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected from socket:', socket.id);
  });
});

// Processing Simulation Pipeline
appEvents.on('video_uploaded', async (video) => {
  try {
    // Notify clients that processing has started
    io.emit('video_processing_started', { videoId: video._id });

    // Update status mapping
    await Video.findByIdAndUpdate(video._id, { status: 'processing' });
    
    let progress = 0;
    
    // Simulate processing steps (e.g., 5 seconds total)
    const interval = setInterval(async () => {
      progress += 20; // Increase progress
      
      io.emit('video_processing_progress', { videoId: video._id, progress });

      if (progress >= 100) {
        clearInterval(interval);
        
        // Randomly assign 'safe' or 'flagged'
        // In real world, this is where AI Content Moderation logic would live
        const isSafe = Math.random() < 0.8; // 80% chance of being safe
        const finalStatus = isSafe ? 'safe' : 'flagged';
        
        await Video.findByIdAndUpdate(video._id, { status: finalStatus });
        
        // Final message
        io.emit('video_processing_complete', { videoId: video._id, status: finalStatus });
      }
    }, 1000); // Step every second
  } catch (error) {
    console.error('Error in mock processing pipeline:', error);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

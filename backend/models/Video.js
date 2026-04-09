const mongoose = require('mongoose');

const videoSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'safe', 'flagged'],
      default: 'pending',
    },
    size: { type: Number, required: true }, // in bytes
    mimeType: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;

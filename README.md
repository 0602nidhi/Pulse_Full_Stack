# Pulse Video Streaming & Processing Platform

A full-stack enterprise-grade application for video management, simulated sensitivity processing, and real-time streaming with multi-tenant Role-Based Access Control (RBAC).

## Features
- **Real-Time Processing**: Socket.io powered simulated processing pipeline with live progress updates.
- **Video Streaming**: Fast and efficient video streaming using HTTP Range Requests.
- **Multi-Tenant Architecture**: Data is securely partitioned between different organizations.
- **RBAC**: Three distinct roles (Viewer, Editor, Admin) ensuring secure access control.
- **Modern UI/UX**: Built with React, Vite, Tailwind CSS, and Lucide Icons for a premium look.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Axios, Socket.io-client
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io, Multer, JWT

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on `localhost:27017` or update the `.env` file with your Mongo URI.

### 1. Installation

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory (one is already provided in the setup):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulse_video
JWT_SECRET=your_super_secret_key
```

### 3. Running the Application

Start the backend (from the `backend` folder):
```bash
node server.js
```

Start the frontend (from the `frontend` folder):
```bash
npm run dev
```

### 4. Default Roles Logic
- Register an account. The default Registration form assigns users to the chosen role.
- **Viewer**: Read-only access to 'safe' videos. Cannot upload.
- **Editor**: Can upload videos, view all videos in their organization including 'flagged'.
- **Admin**: Full system access.

## Architecture & Code Decisions

- **Streaming**: Native Node `fs.createReadStream` handles 206 Partial Content range requests, avoiding the need for heavy external services while providing seamless seek/scrubbing in HTML5 video players.
- **Real-Time**: `Socket.io` coordinates the "mock" Video AI processing pipeline, bridging the gap between typical server cron jobs and live frontend visualization.
- **Multi-Tenant**: A shared `organizationId` is generated per registration flow to isolate videos per company/group.

## Author
Completed for the Pulse Full Stack Assignment.

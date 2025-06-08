# RTMP Live Streaming Server

This project is a real-time RTMP live streaming server built using Node.js with Express for the backend, FFmpeg for video encoding and streaming, and Socket.IO for real-time binary data transfer from client to server. The application allows users to input their RTMP stream key dynamically, starts an FFmpeg process to push the live video stream to platforms like YouTube, and handles live streaming data . The entire setup is containerized with Docker for easy deployment and scalability.

---

## Features

- Web interface to input RTMP stream key dynamically  
- Real-time binary streaming from client to server via Socket.IO  
- Video encoding and packaging using FFmpeg, streamed to RTMP endpoint  
- Dockerized environment for consistent deployment with Docker Desktop  
- Separate frontend pages for stream key input and streaming interface  

---

How It Works
The Express server serves static files and handles Socket.IO connections.

Users connect via browser, first entering the RTMP key on key.html.

The server saves this RTMP key in the user session (or a simple in-memory store) and starts an FFmpeg process configured to push the incoming stream to the RTMP server URL constructed dynamically using the user’s key.

Clients capture webcam video using the WebRTC getUserMedia API and send raw video data chunks via Socket.IO to the backend.

The backend streams the data into FFmpeg’s stdin, which encodes and pushes it to the RTMP endpoint (e.g., YouTube Live).

The frontend then loads the streaming page (index.html) to display video and provide stream controls.



## Prerequisites

Before running the project, make sure you have the following installed on your system:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/macOS/Linux)  
- Basic familiarity with command line terminal  
- A valid RTMP streaming key from your streaming platform (e.g., YouTube Live)

---

## Setup and Running

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   docker compose up

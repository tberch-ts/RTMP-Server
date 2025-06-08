import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server as SocketIO } from 'socket.io';
import { spawn } from 'child_process';

const port = 5000;
const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());

// ✅ Serve key input page on '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'key.html'));
});

// ✅ Serve static files (index.html, script.js, style.css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

let ffmpegProcess = null;

// ✅ Handle POST /start-stream with the user RTMP key
app.post('/start-stream', (req, res) => {
  const { key } = req.body;

  if (!key || typeof key !== 'string') {
    return res.status(400).send('Invalid stream key');
  }

  // Kill existing ffmpeg process if running
  if (ffmpegProcess && !ffmpegProcess.killed) {
    ffmpegProcess.kill('SIGKILL');
  }

  // FFmpeg args with dynamic stream key
  const options = [
    '-i', '-', // input from stdin
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zerolatency',
    '-r', '25',
    '-g', `${25 * 2}`,
    '-keyint_min', '25',
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', `${128000 / 4}`,
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${key}`
  ];

  ffmpegProcess = spawn('ffmpeg', options);

  ffmpegProcess.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data.toString()}`);
  });

  ffmpegProcess.on('close', (code, signal) => {
    console.log(`FFmpeg exited with code ${code}, signal ${signal}`);
  });

  res.sendStatus(200);
});

// Handle socket connections and pipe data to FFmpeg stdin
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('binary-Stream', (stream) => {
    console.log('Binary data received');

    if (ffmpegProcess && ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(stream, (err) => {
        if (err) {
          console.error('Error writing to ffmpeg stdin:', err.message);
        }
      });
    } else {
      console.warn('FFmpeg stdin is no longer writable.');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

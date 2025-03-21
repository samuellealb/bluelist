import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Create livereload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch('dist');

// Handle EADDRINUSE error
liveReloadServer.server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Livereload server address is already in use. Please close the other instance or use a different port.');
    process.exit(1);
  }
});

// Use connect-livereload middleware
app.use(connectLivereload());

// Serve static files from the 'dist' directory
app.use(express.static(__dirname));

// Handle all other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Notify livereload server on changes
liveReloadServer.server.once('connection', () => {
  // eslint-disable-next-line no-undef
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

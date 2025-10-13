require('dotenv').config(); // Load environment variables at the very beginning

const http = require('http');
const { validateEnvironment } = require('./utils/envValidator');
const app = require('./app');
const connectDB = require('./config/db');
const { setupSocket, getIo } = require('./config/socket');
const { port } = require('./config/keys');

// Validate environment variables before starting server
console.log('🔍 Validating environment variables...');
validateEnvironment();

const server = http.createServer(app);
setupSocket(server); // Initialize Socket.IO
const io = getIo(); // Get the initialized Socket.IO instance

app.get("/", (req, res) => {
  res.send("SkilledLink backend is running ✅");
});

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.error('Server startup error:', err));

module.exports = { app, io };
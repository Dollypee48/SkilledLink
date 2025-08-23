const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
// const setupSocket = require('./config/socket');
const { port } = require('./config/keys');

const server = http.createServer(app);
// const io = setupSocket(server);

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.error('Server startup error:', err));
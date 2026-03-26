require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

let users = {};

io.on('connection', socket => {
  socket.on('join', userId => {
    users[userId] = socket.id;
  });

  socket.on('sendMessage', data => {
    const receiverSocket = users[data.receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receiveMessage', data);
    }
  });
});

server.listen(process.env.PORT, () => console.log('Server running'));
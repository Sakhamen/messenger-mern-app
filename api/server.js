// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import cors from 'cors';

import mongoMessages  from './models/messageModel.js';

// app config
const app = express();
const port = process.env.PORT || 9000;

// middlewares
app.use(express.json());
app.use(cors());

// pusher for real-time messages
var pusher = new Pusher({
  // your config here
});

// db config
const mongoURI = '// your config here';
mongoose.connect(mongoURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
  console.log('DB CONNECTED');

  const changeStream = mongoose.connection.collection('messages').watch();
  changeStream.on('change', (change) => {
    Pusher.trigger('messages-channel', 'newMessage', {
      'change': change
    });
  });
});

// api routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.post('/save/message', (req, res) => {
  const dbMessage = req.body;

  mongoMessages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get('/retrieve/conversation', (req, res) => {
  mongoMessages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });
      res.status(200).send(data);
    }
  });
});

// listen
app.listen(port, () => console.log(`listening on localhost:${port}`));

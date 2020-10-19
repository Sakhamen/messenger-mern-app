import React, { useEffect, useState } from 'react';
import './App.css';
import logo from './images/messenger-logo.png';
import axios from './axios';
import Pusher from 'pusher-js';

// Icons
import FlipMove from 'react-flip-move';
import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';

import Message from './components/Message/Message';
import { FormControl, Input } from '@material-ui/core';

// Pusher
const pusher = new Pusher('ebdbf73d7bd5b531bcfa', {
   cluster: 'mt1'
});

function App() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');

  const sync = async() => {
    await axios.get('/retrieve/conversation').then((res) => {
      console.log('results', res.data);
      setMessages(res.data);
    });
  };

  useEffect(() => {
    sync();
  }, []);

  useEffect(() => {
    const channel = pusher.subscribe('messages-channel');
    channel.bind('newMessage', function(data) {
      sync();
    });
  }, [username]);

  useEffect(() => {
    setUsername(prompt('Please enter your name'));
  }, []);

  const sendMessage = (e) => {
    e.preventDefault()

    axios.post('/save/message', {
      username: username,
      message: input,
      timestamp: Date.now()
    });

    setInput('');
  };

  return (
    <div className="app">
      <img src={logo} alt="messenger logo" />
      <h2>Welcome {username}</h2>

      <form className='app__form' >
        <FormControl className='app__formControl' >
          <Input className='app__input' placeholder='Enter a message...' value={input} onChange={(e) => setInput(e.target.value)} />
          <IconButton className='app__iconButton' variant='text' color='primary' disabled={!input} onClick={sendMessage} type="submit" >
            <SendIcon />
          </IconButton>
        </FormControl>
      </form>

      <FlipMove>
        {
          messages.map(message => (
            <Message key={message._id} message={message} username={username} />
          ))
        }
      </FlipMove>
    </div>
  );
}

export default App;

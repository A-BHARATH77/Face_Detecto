import React, { useState } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setConversation(prev => [...prev, { sender: 'user', text: message }]);
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        query: message
      });
      
      setConversation(prev => [...prev, { 
        sender: 'bot', 
        text: response.data.reply 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setConversation(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, the service is temporarily unavailable.' 
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ 
        height: '400px', 
        border: '1px solid #ccc', 
        overflowY: 'auto', 
        marginBottom: '10px',
        padding: '10px'
      }}>
        {conversation.map((msg, index) => (
          <div key={index} style={{ 
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            margin: '5px 0',
            padding: '8px',
            backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
            borderRadius: '10px'
          }}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div style={{ textAlign: 'left' }}>Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{ 
            flex: 1, 
            padding: '10px', 
            marginRight: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
    <button onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
};

export default ChatBot;
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

const ChatBot = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    { sender: 'bot', text: 'Hello! I can answer questions about registered faces. Ask me anything!' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { sender: 'user', text: message };
    setConversation(prev => [...prev, userMessage]);
    setMessage('');
    
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
        text: 'Sorry, I encountered an error. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <button className="cback-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h2>Face Recognition Assistant</h2>
      </div>

      <div className="chatbot-messages">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.sender}`}
          >
            <div className="message-content">
              {msg.text}
            </div>
            <div className="message-time">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about registered faces..."
          disabled={isLoading}
          autoFocus
        />
        <button 
          type="submit" 
          disabled={isLoading || !message.trim()}
          className="send-button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatBot; 
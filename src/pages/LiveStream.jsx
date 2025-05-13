import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import "./LiveStream.css";
import { useNavigate } from 'react-router-dom';

function LiveStream() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (webcamRef.current?.video) {
        const { videoWidth, videoHeight } = webcamRef.current.video;
        if (videoWidth > 0 && videoHeight > 0) {
          setDimensions({ width: videoWidth, height: videoHeight });
        }
      }
    };

    const video = webcamRef.current?.video;
    if (video) {
      video.addEventListener('loadedmetadata', handleResize);
    }

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleResize);
      }
    };
  }, []);

  const captureAndRecognize = async () => {
    if (!webcamRef.current?.video || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, "image/jpeg", 0.8)
      );

      const formData = new FormData();
      formData.append("image", blob, "frame.jpg");

      const res = await fetch("http://localhost:5000/api/recognize", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const newMessages = [];
      data.results.forEach(({ name, box }) => {
        //  bounding box
        ctx.strokeStyle = name === "Unknown" ? "#ff3b30" : "#34c759";
        ctx.lineWidth = 3;
        ctx.strokeRect(box[0], box[1], box[2], box[3]);

        //  label background
        ctx.fillStyle = name === "Unknown" ? "#ff3b30" : "#34c759";
        const textWidth = ctx.measureText(name).width;
        ctx.fillRect(box[0] - 1, box[1] - 30, textWidth + 20, 25);

        //  label text
        ctx.fillStyle = "white";
        ctx.font = "bold 14px 'Inter', sans-serif";
        ctx.fillText(name, box[0] + 8, box[1] - 10);

        newMessages.push({
          id: Date.now() + Math.random(),
          text: name === "Unknown" 
            ? `⚠️ Unknown face detected` 
            : `✅ Recognized: ${name}`,
          type: name === "Unknown" ? "unknown" : "known",
          timestamp: new Date().toLocaleTimeString()
        });
      });

      setMessages(prev => [...prev.slice(-5), ...newMessages]);
    } catch (err) {
      console.error("Recognition error:", err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "❌ Error processing recognition",
        type: "error",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const captureInterval = setInterval(captureAndRecognize, 1500);
    return () => clearInterval(captureInterval);
  }, [dimensions]);

  return (
    <div className="live-stream-container">
      <div className="top-bar">
        <button className="lback-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h2>Live Face Recognition</h2>
      </div>

      <div className="camera-section">
        <div className="webcam-wrapper">
          <Webcam
            ref={webcamRef}
            audio={false}
            className="webcam"
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: dimensions.width,
              height: dimensions.height,
              facingMode: "user",
            }}
          />
          <canvas 
            ref={canvasRef} 
            className="canvas-overlay"
            width={dimensions.width}
            height={dimensions.height}
          />
          {isProcessing && (
            <div className="processing-overlay">
              <div className="processing-spinner"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>

        <div className="recognition-results">
          <h3>Recognition Log</h3>
          <div className="messages-box">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <span className="message-text">{msg.text}</span>
                  <span className="message-time">{msg.timestamp}</span>
                </div>
              ))
            ) : (
              <div className="message empty">
                No faces detected yet. Looking for faces...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveStream;
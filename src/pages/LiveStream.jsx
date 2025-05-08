import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import "./LiveStream.css";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });    

  // Set canvas dimensions to match webcam
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
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      try {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions to match video
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data as blob
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("image", blob, "frame.jpg");
        
          try {
            const res = await fetch("http://localhost:5000/api/recognize", {
              method: "POST",
              body: formData,
            });
        
            const data = await res.json();
        
            // Clear and redraw canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
            const newMessages = [];
            data.results.forEach(({ name, box }) => {
              ctx.strokeStyle = "lime";
              ctx.lineWidth = 2;
              ctx.strokeRect(box[0], box[1], box[2], box[3]);
        
              ctx.fillStyle = "lime";
              ctx.fillRect(box[0], box[1] - 25, ctx.measureText(name).width + 10, 25);
        
              ctx.fillStyle = "black";
              ctx.font = "16px Arial";
              ctx.fillText(name, box[0] + 5, box[1] - 8);
        
              newMessages.push(
                name === "Unknown"
                  ? "⚠️ Unknown face detected."
                  : `✅ Face recognized: ${name}`
              );
            });
        
            setMessages(newMessages);
          } catch (err) {
            console.error("❌ Recognition error:", err);
            setMessages(["❌ Error processing face recognition"]);
          }
        }, "image/jpeg");
      } catch (err) {
        console.error("❌ Error in captureAndRecognize:", err);
        setMessages(["❌ Error capturing image"]);
      }
    }
  };

  useEffect(() => {
    const captureInterval = setInterval(captureAndRecognize, 100);
    return () => clearInterval(captureInterval);
  }, [dimensions]);

  return (
    <div className="page-container">
      <div className="webcam-container">
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
        <canvas ref={canvasRef} className="canvas-overlay" />
      </div>
  
      <div className="messages-box" style={{ width: `${dimensions.width}px` }}>
        {messages.length > 0 ? (
          messages.map((msg, i) => (
            <div
              key={i}
              className={msg.includes("Unknown") ? "msg-unknown" : "msg-known"}
            >
              {msg}
            </div>
          ))
        ) : (
          <div className="msg-none">No faces detected yet...</div>
        )}
      </div>
    </div>
  );
}
export default App;
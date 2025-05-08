import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Registration.css';

const Registration = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState('');
  const [imageData, setImageData] = useState(null);
  const [nameStatus, setNameStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!name.trim()) {
      setNameStatus('');
      return;
    }

    setNameStatus('Checking... ⏳');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/check-name?name=' + name);
        if (res.data && res.data.exists !== undefined) {
          setNameStatus(res.data.exists ? 'Name already exists ❌' : 'Name available ✅');
        } else {
          setNameStatus('Unexpected response');
        }
      } catch (err) {
        console.error(err);
        setNameStatus('Error checking name');
      }
    }, 500);
  }, [name]);

  const capture = () => {
    const screenshot = webcamRef.current.getScreenshot();
    setImageData(screenshot);
    alert("Picture captured");
  };

  const handleRegister = async () => {
    if (!imageData || !name) return alert("Image and name required");
    if (nameStatus.includes("exists")) return alert("Choose a unique name");

    try {
      const res = await axios.post('http://localhost:5000/api/register', { name, image: imageData });
      setSuccessMsg(res.data.message || "Registration successful!");
      setTimeout(() => setSuccessMsg(''), 1000);
      setName('');
      setImageData(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering');
    }
  };

  return (
    <div className="reg-container">
      <h2 className="reg-title">Register</h2>

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="reg-webcam"
      />

      <button className="reg-btn" onClick={capture}>Take Picture</button>

      <div className="reg-input-group">
        <input
          type="text"
          placeholder="Enter unique name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="reg-input"
        />
        <p
          className={`reg-status ${
            nameStatus.includes("available") ? "reg-status-available" :
            nameStatus.includes("exists") ? "reg-status-exists" : ""
          }`}
        >
          {nameStatus}
        </p>
      </div>
      <button className="reg-btn" onClick={handleRegister}>Register</button>
      {successMsg && (
        <p className="reg-success-msg">✅ {successMsg}</p>
      )}
      <button className="reg-back-btn" onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
};

export default Registration;

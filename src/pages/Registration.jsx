import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // for back button

const Registration = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState('');
  const [imageData, setImageData] = useState(null);
  const [nameStatus, setNameStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Realtime name check with debounce
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
    alert("Picture captured"); // ✅ Simple alert for capture
  };

  const handleRegister = async () => {
    if (!imageData || !name) return alert("Image and name required");
    if (nameStatus.includes("exists")) return alert("Choose a unique name");

    try {
      const res = await axios.post('http://localhost:5000/api/register', { name, image: imageData });
      setSuccessMsg(res.data.message || "Registration successful!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
      setName('');
      setImageData(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <br />
      <button onClick={capture}>Take Picture</button>

      <div>
        <input
          type="text"
          placeholder="Enter unique name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p style={{ color: nameStatus.includes("available") ? "green" : nameStatus.includes("exists") ? "red" : "black" }}>
          {nameStatus}
        </p>
      </div>

      <button onClick={handleRegister}>Register</button>

      {successMsg && (
        <p style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>
          ✅ {successMsg}
        </p>
      )}

      <br />
      <button onClick={() => navigate('/')}>← Back to Home</button>
    </div>
  );
};

export default Registration;

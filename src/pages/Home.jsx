import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Face Recognition System</h1>
      <button onClick={() => navigate('/register')}>Registration</button>
      <button onClick={() => navigate('/live')}>Live Stream</button>
      <button onClick={() => navigate('/chat')}>Chat Bot</button>
    </div>
  );
}

export default Home;

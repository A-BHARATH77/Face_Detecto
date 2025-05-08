import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Registration Module",
      icon: "📷",
      description: "Capture faces via webcam, store encodings with names in database, and support multiple registrations.",
      tech: "React + Python Face Recognition + Database",
      onClick: () => navigate('/register')
    },
    {
      title: "Live Recognition",
      icon: "🔍",
      description: "Real-time face detection with bounding boxes and names. Supports multi-face recognition.",
      tech: "Real-time webcam processing with frame optimization",
      onClick: () => navigate('/live')
    },
    {
      title: "AI Chat Interface",
      icon: "🤖",
      description: "RAG-powered Q&A about registration data. Answers queries like 'Who was last registered?'",
      tech: "React + Node.js + Python (LangChain, FAISS, OpenAI)",
      onClick: () => navigate('/chat')
    }
  ];

  return (
    <div className="home-container">
      <div className="header">
        <h1>Face Recognition System</h1>
        <p>A browser-based platform with real-time face recognition and AI-powered Q&A using RAG technology.</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="feature-card"
            onClick={feature.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.querySelector('.card-icon').style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('.card-icon').style.transform = 'scale(1)';
            }}
          >
            <div className="card-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className="tech-badge">{feature.tech}</div>
            <div className="hover-indicator">→</div>
          </div>
        ))}
      </div>

      <div className="demo-notice">
        <div className="pulse-dot"></div>
        <span>Try our live demo! Click any module to get started</span>
      </div>
    </div>
  );
}

export default Home;
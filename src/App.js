import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Registration from './pages/Registration';
import LiveStream from './pages/LiveStream';
import ChatBot from './pages/ChatBot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/live" element={<LiveStream />} />
        <Route path="/chat" element={<ChatBot />} />
      </Routes>
    </Router>
  );
}
export default App;


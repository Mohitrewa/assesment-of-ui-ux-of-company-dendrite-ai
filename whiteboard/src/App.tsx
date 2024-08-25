import React from 'react';
import { BrowserRouter as Router, Route, Routes,Navigate  } from 'react-router-dom';
import LoginPage from './pages/LoginPage/login';
import Canvas from './pages/Canvas/page';
import Dashboard from './Dashboard';
import Session from './pages/Session';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/:userId/:canvasId" element={<Canvas />} />         
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/dashboard/:userUID/:canvasId/:token" element={<Session />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
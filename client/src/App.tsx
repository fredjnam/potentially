import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import KnowledgeGraph from './components/KnowledgeGraph';
import Chat from './components/Chat';

function App() {
  const [user, setUser] = useState<string | null>(null);

  // Check if user is stored in localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('knowledgeGraphUser');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem('knowledgeGraphUser', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('knowledgeGraphUser');
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={
              user ? <Dashboard username={user} /> : <Navigate to="/login" />
            } />
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/knowledge-graph" element={
              user ? <KnowledgeGraph username={user} /> : <Navigate to="/login" />
            } />
            <Route path="/chat" element={
              user ? <Chat username={user} /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>
        
        <footer className="bg-gray-100 py-4 border-t">
          <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Knowledge Graph Assistant
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

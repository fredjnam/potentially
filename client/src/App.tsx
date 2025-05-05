import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './screens/Dashboard';
import KnowledgeGraph from './components/KnowledgeGraph';
import Chat from './components/Chat';
import { Element } from './screens/Element';

function App() {
  const [user, setUser] = useState<string | null>(null);

  // Check if user is stored in localStorage on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('potentiallyUser');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);
  
  // Listen for localStorage changes from other components
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('potentiallyUser');
      if (storedUser && storedUser !== user) {
        setUser(storedUser);
      }
    };
    
    // Handle custom user login event from survey
    const handleUserLogin = () => {
      const storedUser = localStorage.getItem('potentiallyUser');
      if (storedUser) {
        setUser(storedUser);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, [user]);

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem('potentiallyUser', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('potentiallyUser');
    localStorage.removeItem('potentiallyUserData');
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-800 to-blue-700 text-white">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              user ? <Dashboard username={user} /> : <Navigate to="/login" />
            } />
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/intake" element={
              user ? <Navigate to="/" /> : <Element />
            } />
            <Route path="/knowledge-graph" element={
              user ? <KnowledgeGraph username={user} /> : <Navigate to="/login" />
            } />
            <Route path="/chat" element={
              user ? <Chat username={user} /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>
        
        <footer className="bg-white/10 backdrop-blur-md py-4 border-t border-white/20">
          <div className="container mx-auto px-4 text-center text-white/70 text-sm">
            &copy; {new Date().getFullYear()} PotentiAlly
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
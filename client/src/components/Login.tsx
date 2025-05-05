import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../services/api';
import { Brain } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await userService.createUser(username);
      onLogin(username);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 border border-white/20">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2 gradient-text">PotentiAlly</h1>
            <p className="text-white/80">Sign in to access your personal space</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 border border-white/30 rounded-md shadow-sm focus:outline-none focus:ring-white/50 focus:border-white/50 bg-white/10 text-white placeholder-white/50"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-2 rounded border border-red-400/30">
                {error}
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-4 py-2 rounded-md font-medium w-full transition-colors focus:outline-none bg-white/20 text-white hover:bg-white/30 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              New user?{' '}
              <Link 
                to="/intake" 
                className="text-white hover:text-white/80 hover:underline font-medium"
              >
                Complete the intake survey
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
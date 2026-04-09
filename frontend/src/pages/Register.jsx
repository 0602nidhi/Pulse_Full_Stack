import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Video } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Viewer');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface p-8 flex flex-col pt-10 rounded-2xl shadow-xl w-full max-w-md border border-surface-light">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Video className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold">Pulse<span className="text-primary">Stream</span></h1>
        </div>
        
        <h2 className="text-xl font-semibold mb-6 text-center text-text-muted">Create an Account</h2>
        
        {error && <div className="bg-danger/20 text-danger p-3 rounded-lg mb-6 text-center text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
           <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-surface-light border border-surface border-opacity-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-surface-light border border-surface border-opacity-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-text"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">Password</label>
            <input 
              type="password" 
              className="w-full bg-surface-light border border-surface border-opacity-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-text"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-muted">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface-light border border-surface border-opacity-50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-text"
            >
              <option value="Viewer">Viewer (Watch Safe Videos)</option>
              <option value="Editor">Editor (Upload & Watch Videos)</option>
              <option value="Admin">Admin (Full Access)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors mt-2">
            Create Account
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

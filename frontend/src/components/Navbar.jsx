import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Video, LogOut, Upload as UploadIcon, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-surface shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Video className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold tracking-tight text-white">Pulse<span className="text-primary">Stream</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {(user.role === 'Admin' || user.role === 'Editor') && (
              <Link to="/upload" className="flex items-center gap-2 bg-primary hover:bg-primary-dark transition-colors px-4 py-2 rounded-lg text-sm font-medium text-white">
                <UploadIcon className="w-4 h-4" />
                Upload
              </Link>
            )}
            
            <div className="flex items-center gap-4 pl-4 border-l border-surface-light">
               <div className="flex flex-col text-right">
                 <span className="text-sm font-medium text-text">{user.name}</span>
                 <span className="text-xs text-primary">{user.role}</span>
               </div>
               <button onClick={handleLogout} className="p-2 text-text-muted hover:text-danger bg-surface-light hover:bg-opacity-80 rounded-full transition-colors">
                  <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

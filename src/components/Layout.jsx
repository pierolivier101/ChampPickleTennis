import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Trophy, CalendarDays, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Layout = () => {
  const { currentUser, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="content-area">
        <header className="flex justify-between items-center mb-3">
          <h1 style={{ fontSize: '1.5rem', marginBottom: 0 }}>
            <span className="text-primary">Champion</span> & Ace
          </h1>
          {currentUser && (
            <button onClick={handleLogout} className="btn btn-secondary" style={{ minHeight: '36px', padding: '0 0.5rem' }}>
              <LogOut size={18} />
            </button>
          )}
        </header>
        <main>
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        {currentUser?.role === 'player' && (
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Home size={24} className="nav-icon" />
            <span>Dash</span>
          </NavLink>
        )}
        
        {currentUser?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={24} className="nav-icon" />
            <span>Admin</span>
          </NavLink>
        )}

        <NavLink to="/standings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Trophy size={24} className="nav-icon" />
          <span>Ranks</span>
        </NavLink>
        
        <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarDays size={24} className="nav-icon" />
          <span>Matches</span>
        </NavLink>

        <NavLink to="/board" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquare size={24} className="nav-icon" />
          <span>Chat</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Layout;

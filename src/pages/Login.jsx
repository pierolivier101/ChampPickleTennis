import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const Login = () => {
  const [role, setRole] = useState('player'); // 'player' or 'admin'
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  const { players, loginPlayer, loginAdmin } = useStore();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (role === 'admin') {
      if (loginAdmin(pin)) {
        navigate('/admin');
      } else {
        setError('Invalid Admin PIN');
      }
    } else {
      if (!name) {
        setError('Please enter your name');
        return;
      }
      if (loginPlayer(name, pin)) {
        navigate('/');
      } else {
        setError('Player not found or invalid PIN');
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="text-center mb-3">
        <h1 style={{ fontSize: '2.5rem' }}>
          <span className="text-primary">Champion</span><br/>& Ace
        </h1>
        <p className="text-secondary">Tournament Management</p>
      </div>

      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="flex gap-2 mb-3">
          <button 
            className={`btn ${role === 'player' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => setRole('player')}
          >
            Player
          </button>
          <button 
            className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1 }}
            onClick={() => setRole('admin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {role === 'player' && (
            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem' }}>Name</label>
              <input 
                type="text" 
                list="players-list"
                className="input-field" 
                placeholder="Type or select name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <datalist id="players-list">
                {players.map(p => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>
          )}
          
          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.25rem' }}>
              {role === 'admin' ? 'Admin PIN' : '4-Digit PIN'}
            </label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="****" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            {role === 'admin' && (
              <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                💡 Default Admin PIN is <strong className="text-primary">0000</strong>
              </div>
            )}
          </div>

          {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%' }}>
            Access Dashboard
          </button>
        </form>
      </div>

      <div className="mt-2 text-center">
        <button className="btn btn-secondary" onClick={() => navigate('/standings')}>
          View Public Standings
        </button>
      </div>
    </div>
  );
};

export default Login;

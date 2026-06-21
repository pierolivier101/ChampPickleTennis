import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const Admin = () => {
  const { players, addPlayer, matches, addMatch, simulateTournament } = useStore();
  const [activeTab, setActiveTab] = useState('players'); // 'players' | 'matches' | 'reports'

  const handleExportPlayers = () => {
    const headers = ['ID', 'Name', 'Sport', 'Skill Level', 'Contact', 'Availability'];
    const rows = players.map(p => [
      p.id,
      p.name,
      p.sport,
      p.skillLevel || 'Intermediate',
      p.contact || '',
      p.availability || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "players_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportMatches = () => {
    const headers = ['Match ID', 'Player 1', 'Player 2', 'Sport', 'Scheduled At', 'Court', 'Status', 'Winner', 'Score 1', 'Score 2'];
    const getPlayerName = (id) => players.find(p => p.id === id)?.name || 'Unknown';
    
    const rows = matches.map(m => [
      m.id,
      getPlayerName(m.player1_id),
      getPlayerName(m.player2_id),
      m.sport,
      m.scheduled_at,
      m.court || 'Main Court',
      m.status,
      getPlayerName(m.winner_id),
      m.score_p1 || '',
      m.score_p2 || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "matches_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // New Player State
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPin, setNewPlayerPin] = useState('');
  const [newPlayerSport, setNewPlayerSport] = useState('tennis');

  // New Match State
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [matchSport, setMatchSport] = useState('tennis');
  const [matchDateStr, setMatchDateStr] = useState('');
  const [matchTimeStr, setMatchTimeStr] = useState('');
  const [matchCourt, setMatchCourt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerPin) return;
    addPlayer({
      name: newPlayerName,
      pin: newPlayerPin,
      sport: newPlayerSport,
      avatar_initials: newPlayerName.substring(0, 2).toUpperCase()
    });
    setNewPlayerName('');
    setNewPlayerPin('');
  };

  const handleAddMatch = (e) => {
    e.preventDefault();
    if (!player1Id || !player2Id || player1Id === player2Id) {
      setErrorMsg('Please select two different players.');
      return;
    }

    const dateRegex = /^(\d{1,2})[-/.](\d{1,2})$/;
    const dateMatch = matchDateStr.trim().match(dateRegex);
    if (!dateMatch) {
      setErrorMsg('Invalid date format. Use DD-MM (e.g., 15-06).');
      return;
    }

    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      setErrorMsg('Please enter a valid day and month.');
      return;
    }

    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const timeMatch = matchTimeStr.trim().match(timeRegex);
    if (!timeMatch) {
      setErrorMsg('Invalid time format. Use HH:MM in 24h format (e.g., 14:30).');
      return;
    }

    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      setErrorMsg('Please enter a valid 24h time.');
      return;
    }

    const pad = (n) => String(n).padStart(2, '0');
    const scheduledAt = `2026-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;

    setErrorMsg('');
    addMatch({
      player1_id: player1Id,
      player2_id: player2Id,
      sport: matchSport,
      scheduled_at: scheduledAt,
      court: matchCourt
    });
    setPlayer1Id('');
    setPlayer2Id('');
    setMatchDateStr('');
    setMatchTimeStr('');
    setMatchCourt('');
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      
      <div className="flex gap-2 mb-3">
        <button 
          className={`btn ${activeTab === 'players' ? 'btn-primary' : 'btn-secondary'}`} 
          style={{ flex: 1 }}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button 
          className={`btn ${activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}`} 
          style={{ flex: 1 }}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button 
          className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}`} 
          style={{ flex: 1 }}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {activeTab === 'players' && (
        <>
          <div className="card">
            <h3>Add New Player</h3>
            <form onSubmit={handleAddPlayer} className="flex flex-col gap-2 mt-2">
              <input 
                type="text" 
                className="input-field" 
                placeholder="Player Name" 
                value={newPlayerName} 
                onChange={e => setNewPlayerName(e.target.value)} 
              />
              <input 
                type="text" 
                className="input-field" 
                placeholder="4-Digit PIN" 
                maxLength={4}
                value={newPlayerPin} 
                onChange={e => setNewPlayerPin(e.target.value)} 
              />
              <select className="input-field" value={newPlayerSport} onChange={e => setNewPlayerSport(e.target.value)}>
                <option value="tennis">Tennis</option>
                <option value="pickleball">Pickleball</option>
                <option value="both">Both</option>
              </select>
              <button type="submit" className="btn btn-primary">Add Player</button>
            </form>
          </div>

          <div className="card">
            <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Player List ({players.length})</h3>
              {players.length >= 2 && (
                <button 
                  onClick={() => {
                    simulateTournament();
                    alert("Tournament simulation complete! Matches generated successfully.");
                  }} 
                  className="btn btn-primary animate-pulse" 
                  style={{ 
                    minHeight: '36px', 
                    padding: '0 0.75rem', 
                    fontSize: '0.85rem',
                    boxShadow: '0 0 10px rgba(223, 255, 0, 0.4)'
                  }}
                >
                  ⚡ Simulate 5 Games Each
                </button>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {players.map(p => (
                <div key={p.id} className="flex justify-between items-center" style={{ padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div>
                    <strong>{p.name}</strong> <span className="text-secondary">(PIN: {p.pin})</span>
                  </div>
                  <span className={`badge ${p.sport === 'tennis' ? 'badge-tennis' : 'badge-pickleball'}`}>
                    {p.sport}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'matches' && (
        <>
          <div className="card">
            <h3>Schedule Match</h3>
            <form onSubmit={handleAddMatch} className="flex flex-col gap-2 mt-2">
              <select className="input-field" value={player1Id} onChange={e => setPlayer1Id(e.target.value)}>
                <option value="">Select Player 1</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div className="text-center text-secondary">VS</div>
              <select className="input-field" value={player2Id} onChange={e => setPlayer2Id(e.target.value)}>
                <option value="">Select Player 2</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              
              <select className="input-field" value={matchSport} onChange={e => setMatchSport(e.target.value)}>
                <option value="tennis">Tennis</option>
                <option value="pickleball">Pickleball</option>
              </select>
              
              {errorMsg && (
                <div style={{ color: '#ff4d4f', fontSize: '0.875rem', fontWeight: 'bold', margin: '0.25rem 0' }}>
                  ⚠️ {errorMsg}
                </div>
              )}
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Date (DD-MM) e.g. 15-06" 
                  value={matchDateStr} 
                  onChange={e => setMatchDateStr(e.target.value)} 
                  style={{ flex: 1 }}
                  required
                />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Time (HH:MM) e.g. 14:30" 
                  value={matchTimeStr} 
                  onChange={e => setMatchTimeStr(e.target.value)} 
                  style={{ flex: 1 }}
                  required
                />
              </div>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Court (e.g. Court 1)" 
                value={matchCourt} 
                onChange={e => setMatchCourt(e.target.value)} 
              />
              <button type="submit" className="btn btn-primary">Schedule Match</button>
            </form>
          </div>
        </>
      )}
      {activeTab === 'reports' && (
        <div className="card flex flex-col gap-3">
          <h3>Data Export & Reports</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Download player rosters and match statistics as spreadsheet CSV files.</p>
          <div className="flex flex-col gap-2 mt-2">
            <button onClick={handleExportPlayers} className="btn btn-primary" style={{ width: '100%' }}>
              📥 Export Player Roster (CSV)
            </button>
            <button onClick={handleExportMatches} className="btn btn-primary" style={{ width: '100%' }}>
              📥 Export Match Logs (CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

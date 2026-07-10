import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Calendar, Award, Phone, Activity, CheckCircle, Edit } from 'lucide-react';
import { getGoogleCalendarUrl, downloadICalFile } from '../services/calendarExport';

const Dashboard = () => {
  const { currentUser, players, matches, updateMatch, updatePlayer } = useStore();
  const player = players.find(p => p.id === currentUser?.id);
  
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [s1p1, setS1p1] = useState('');
  const [s1p2, setS1p2] = useState('');
  const [s2p1, setS2p1] = useState('');
  const [s2p2, setS2p2] = useState('');
  const [s3p1, setS3p1] = useState('');
  const [s3p2, setS3p2] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form State
  const [bio, setBio] = useState(player?.bio || '');
  const [age, setAge] = useState(player?.age || '');
  const [gender, setGender] = useState(player?.gender || '');
  const [skillLevel, setSkillLevel] = useState(player?.skillLevel || 'Intermediate');
  const [contact, setContact] = useState(player?.contact || '');
  const [availability, setAvailability] = useState(player?.availability || 'Weekends & Evenings');

  const myMatches = useMemo(() => {
    if (!player) return [];
    return matches.filter(m => m.player1_id === player.id || m.player2_id === player.id);
  }, [matches, player]);
  
  // Pending match invitations sent to this player
  const incomingInvites = useMemo(() => {
    if (!player) return [];
    return matches.filter(m => m.status === 'pending_invite' && m.player2_id === player.id);
  }, [matches, player]);
  
  const upcomingMatches = useMemo(() => {
    return myMatches.filter(m => m.status === 'upcoming');
  }, [myMatches]);

  const pastMatches = useMemo(() => {
    return myMatches
      .filter(m => m.status === 'played' && m.confirmed)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }, [myMatches]);

  // Stats Calculations
  const stats = useMemo(() => {
    let wins = 0;
    let losses = 0;
    let points = 0;
    const history = [];

    if (player) {
      pastMatches.forEach(m => {
        const isWinner = m.winner_id === player.id;
        if (isWinner) {
          wins++;
          points += 3;
        } else {
          losses++;
          points += 1;
        }
        history.push(points);
      });
    }

    const winRate = pastMatches.length > 0 ? Math.round((wins / pastMatches.length) * 100) : 0;

    return { wins, losses, points, winRate, history };
  }, [pastMatches, player]);

  // SVG Chart Calculation
  const svgChart = useMemo(() => {
    if (stats.history.length === 0) return null;
    const chartWidth = 480;
    const chartHeight = 160;
    const padding = 20;

    const data = [0, ...stats.history];
    const xStep = (chartWidth - padding * 2) / (data.length - 1 || 1);
    
    const maxVal = Math.max(...data, 5);
    const minVal = 0;
    const yRange = maxVal - minVal;

    const points = data.map((val, index) => {
      const x = padding + index * xStep;
      const y = chartHeight - padding - ((val - minVal) / yRange) * (chartHeight - padding * 2);
      return { x, y, val };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    return { points, pathD, width: chartWidth, height: chartHeight };
  }, [stats.history]);

  if (!player) return <div style={{ padding: '2rem', textAlign: 'center' }}>Player not found</div>;

  const getPlayerName = (id) => players.find(p => p.id === id)?.name || 'Unknown';

  const getOpponent = (m) => {
    const oppId = m.player1_id === player.id ? m.player2_id : m.player1_id;
    return players.find(p => p.id === oppId);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    updatePlayer(player.id, { bio, age, gender, skillLevel, contact, availability });
    setIsEditingProfile(false);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Welcome & Profile Summary */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, rgba(28, 37, 65, 0.8) 0%, rgba(11, 19, 43, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1.25rem',
          borderRadius: '20px'
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div 
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, #CCEA00 100%)',
                color: 'var(--bg-color)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {player.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{player.name}</h2>
              <span className="badge badge-tennis" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                {player.sport} • {player.skillLevel}
              </span>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            style={{ minHeight: '36px', padding: '0 0.75rem', fontSize: '0.85rem', display: 'flex', gap: '0.25rem' }}
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Details */}
        {!isEditingProfile ? (
          <div className="mt-3 flex flex-col gap-2 text-secondary" style={{ fontSize: '0.875rem' }}>
            {player.bio && <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{player.bio}"</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {player.age && <span className="flex items-center gap-1"><User size={14} /> {player.age} yrs</span>}
              {player.gender && <span className="flex items-center gap-1">🚻 {player.gender}</span>}
              {player.contact && <span className="flex items-center gap-1"><Phone size={14} /> {player.contact}</span>}
              <span className="flex items-center gap-1"><Calendar size={14} /> Avail: {player.availability}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="flex flex-col gap-3 mt-3">
            <div className="flex gap-2">
              <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
              <input type="text" className="input-field" style={{ flex: 1 }} placeholder="Gender" value={gender} onChange={e => setGender(e.target.value)} />
            </div>
            <select className="input-field" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <input type="text" className="input-field" placeholder="Contact Info" value={contact} onChange={e => setContact(e.target.value)} />
            <input type="text" className="input-field" placeholder="Availability (e.g. Weekends)" value={availability} onChange={e => setAvailability(e.target.value)} />
            <textarea 
              className="input-field" 
              placeholder="Short bio..." 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              style={{ minHeight: '60px', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn btn-secondary" style={{ minHeight: '36px', fontSize: '0.85rem' }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ minHeight: '36px', fontSize: '0.85rem' }}>Save</button>
            </div>
          </form>
        )}
      </div>

      {/* Incoming Invitations Notification */}
      {incomingInvites.length > 0 && (
        <div className="card" style={{ border: '1px solid var(--warning-color)', backgroundColor: 'rgba(255, 179, 0, 0.05)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Calendar size={18} /> Match Invitations ({incomingInvites.length})
          </h3>
          <div className="flex flex-col gap-2">
            {incomingInvites.map(invite => {
              const host = players.find(p => p.id === invite.player1_id);
              return (
                <div key={invite.id} className="flex justify-between items-center p-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{host?.name}</strong> invited you to play <strong>{invite.sport}</strong> on {invite.scheduled_at.split('T')[0]} at {invite.scheduled_at.split('T')[1]?.substring(0, 5)}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateMatch(invite.id, { status: 'upcoming', confirmed: true })} 
                      className="btn btn-primary" 
                      style={{ minHeight: '30px', padding: '0 0.5rem', fontSize: '0.75rem' }}
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => updateMatch(invite.id, { status: 'declined_invite' })} 
                      className="btn btn-secondary" 
                      style={{ minHeight: '30px', padding: '0 0.5rem', fontSize: '0.75rem' }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Summary Dashboard */}
      <div className="flex gap-2">
        <div className="card" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
          <Activity className="text-primary mb-1" size={20} style={{ margin: '0 auto' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{pastMatches.length}</div>
          <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Played</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
          <CheckCircle className="text-success-color mb-1" size={20} style={{ margin: '0 auto', color: 'var(--success-color)' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{stats.wins}</div>
          <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Wins</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
          <Award className="text-primary mb-1" size={20} style={{ margin: '0 auto' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.winRate}%</div>
          <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Win Rate</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
          <h4 className="text-primary mb-1" style={{ margin: '0 auto', fontSize: '1.1rem' }}>🏆</h4>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.points}</div>
          <div className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Points</div>
        </div>
      </div>

      {/* SVG Points Progression Chart */}
      {svgChart && (
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} className="text-primary" /> Points Progression
          </h3>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <svg width={svgChart.width} height={svgChart.height} style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="20" y1="20" x2={svgChart.width - 20} y2="20" stroke="rgba(255,255,255,0.05)" />
              <line x1="20" y1={svgChart.height / 2} x2={svgChart.width - 20} y2={svgChart.height / 2} stroke="rgba(255,255,255,0.05)" />
              <line x1="20" y1={svgChart.height - 20} x2={svgChart.width - 20} y2={svgChart.height - 20} stroke="rgba(255,255,255,0.1)" />

              {/* Gradient Area under line */}
              <path 
                d={`${svgChart.pathD} L ${svgChart.points[svgChart.points.length-1].x} ${svgChart.height-20} L ${svgChart.points[0].x} ${svgChart.height-20} Z`} 
                fill="url(#chartGrad)" 
                opacity="0.1" 
              />
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" />
                  <stop offset="100%" stopColor="rgba(223, 255, 0, 0)" />
                </linearGradient>
              </defs>

              {/* Path Line */}
              <path 
                d={svgChart.pathD} 
                fill="none" 
                stroke="var(--primary-color)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                filter="drop-shadow(0 0 4px rgba(223, 255, 0, 0.4))"
              />

              {/* Points circles */}
              {svgChart.points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-color)" stroke="var(--primary-color)" strokeWidth="2" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">
                    {p.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      <h3>Upcoming Matches</h3>
      <div className="flex flex-col gap-2">
        {upcomingMatches.map(m => {
          const opp = getOpponent(m);
          return (
            <div key={m.id} className="card">
              <div className="flex justify-between items-center mb-2">
                <span className="badge badge-tennis">{m.sport}</span>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                  {(() => {
                    const dateObj = new Date(m.scheduled_at);
                    if (!isNaN(dateObj.getTime())) {
                      const day = String(dateObj.getDate()).padStart(2, '0');
                      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                      const hours = String(dateObj.getHours()).padStart(2, '0');
                      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                      return `${day}-${month} ${hours}:${minutes}`;
                    }
                    return 'Invalid Date';
                  })()}
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>VS {opp?.name}</div>
              <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>📍 {m.court || 'Main Court'}</div>
              
              <div className="flex gap-2 mt-2">
                <a 
                  href={getGoogleCalendarUrl(m, getPlayerName(m.player1_id), getPlayerName(m.player2_id))} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  📅 Google Cal
                </a>
                <button 
                  onClick={() => downloadICalFile(m, getPlayerName(m.player1_id), getPlayerName(m.player2_id))}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  📲 Apple / iCal
                </button>
              </div>

              <button 
                className="btn btn-primary mt-2" 
                style={{ width: '100%', minHeight: '36px', fontSize: '0.9rem' }}
                onClick={() => setSelectedMatch(m)}
              >
                Submit Score
              </button>
            </div>
          )
        })}
        {upcomingMatches.length === 0 && <div className="text-secondary" style={{ fontSize: '0.9rem' }}>No upcoming matches. Use the Calendar tab to schedule games!</div>}
      </div>

      {/* Submit Score Modal */}
      {selectedMatch && (
        <div className="card" style={{ border: '1px solid var(--primary-color)' }}>
          <h3>Submit Score</h3>
          <p className="text-secondary mb-3">Input set scores for vs {getOpponent(selectedMatch)?.name}</p>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const s1_1 = parseInt(s1p1, 10);
            const s1_2 = parseInt(s1p2, 10);
            const s2_1 = parseInt(s2p1, 10);
            const s2_2 = parseInt(s2p2, 10);
            const s3_1 = parseInt(s3p1, 10);
            const s3_2 = parseInt(s3p2, 10);

            // Tennis Rules Validation
            if (selectedMatch.sport === 'tennis') {
              // Set 1 validation
              if (s1_1 !== 4 && s1_2 !== 4) {
                alert("Tennis Set 1: A set is won by reaching exactly 4 games (no 2-game advantage or tiebreaks required). The winning score must be 4.");
                return;
              }
              if (s1_1 > 4 || s1_2 > 4) {
                alert("Tennis Set 1: Invalid score. Sets 1 & 2 are won by reaching exactly 4 games.");
                return;
              }
              if (s1_1 === 4 && s1_2 === 4) {
                alert("Tennis Set 1: Invalid score. Set must have a winner (e.g. 4-0, 4-1, 4-2, 4-3).");
                return;
              }

              // Set 2 validation
              const playedSet2 = !isNaN(s2_1) && !isNaN(s2_2);
              if (!playedSet2) {
                alert("Please enter scores for Set 2. Matches are best of 3 sets.");
                return;
              }
              if (s2_1 !== 4 && s2_2 !== 4) {
                alert("Tennis Set 2: A set is won by reaching exactly 4 games (no 2-game advantage or tiebreaks required). The winning score must be 4.");
                return;
              }
              if (s2_1 > 4 || s2_2 > 4) {
                alert("Tennis Set 2: Invalid score. Sets 1 & 2 are won by reaching exactly 4 games.");
                return;
              }
              if (s2_1 === 4 && s2_2 === 4) {
                alert("Tennis Set 2: Invalid score. Set must have a winner.");
                return;
              }

              // Check split sets or straight sets
              const p1WonSet1 = s1_1 > s1_2;
              const p1WonSet2 = s2_1 > s2_2;
              const isSplit = (p1WonSet1 && !p1WonSet2) || (!p1WonSet1 && p1WonSet2);
              const playedSet3 = !isNaN(s3_1) && !isNaN(s3_2);

              if (isSplit && !playedSet3) {
                alert("Sets are split 1-1. Set 3 (10-point long tiebreak) is required to decide the winner.");
                return;
              }

              if (!isSplit && playedSet3) {
                alert("A player won the first two sets in straight sets. Set 3 is not required and should be left blank.");
                return;
              }

              // Set 3 (long tiebreak to 10) validation
              if (playedSet3) {
                const s3Min = Math.min(s3_1, s3_2);
                const s3Max = Math.max(s3_1, s3_2);
                if (s3Max < 10 || (s3Max === 10 && s3Max - s3Min < 2) || (s3Max > 10 && s3Max - s3Min !== 2)) {
                  alert("Tennis Set 3: Must be a long tiebreak played to 10 points, winning by at least 2 points (e.g. 10-8, 12-10, 13-11).");
                  return;
                }
              }
            }

            // Pickleball Rules Validation
            if (selectedMatch.sport === 'pickleball') {
              // Set 1
              const s1Max = Math.max(s1_1, s1_2);
              const s1Min = Math.min(s1_1, s1_2);
              if (s1Max < 11 || s1Max - s1Min < 2) {
                alert("Pickleball Set 1: Must be played to 11 points, winning by 2 (e.g. 11-9, 12-10, 13-11).");
                return;
              }

              // Set 2
              const playedSet2 = !isNaN(s2_1) && !isNaN(s2_2);
              if (!playedSet2) {
                alert("Please enter scores for Set 2. Matches are best of 3 sets.");
                return;
              }
              const s2Max = Math.max(s2_1, s2_2);
              const s2Min = Math.min(s2_1, s2_2);
              if (s2Max < 11 || s2Max - s2Min < 2) {
                alert("Pickleball Set 2: Must be played to 11 points, winning by 2 (e.g. 11-9, 12-10).");
                return;
              }

              // Check split sets or straight sets
              const p1WonSet1 = s1_1 > s1_2;
              const p1WonSet2 = s2_1 > s2_2;
              const isSplit = (p1WonSet1 && !p1WonSet2) || (!p1WonSet1 && p1WonSet2);
              const playedSet3 = !isNaN(s3_1) && !isNaN(s3_2);

              if (isSplit && !playedSet3) {
                alert("Sets are split 1-1. Set 3 (played to 11 points with rally scoring) is required to decide the winner.");
                return;
              }

              if (!isSplit && playedSet3) {
                alert("A player won the first two sets in straight sets. Set 3 is not required and should be left blank.");
                return;
              }

              // Set 3 (rally scoring to 11) validation
              if (playedSet3) {
                const s3Max = Math.max(s3_1, s3_2);
                const s3Min = Math.min(s3_1, s3_2);
                if (s3Max < 11 || s3Max - s3Min < 2) {
                  alert("Pickleball Set 3: Must be played to 11 points, winning by at least 2 points (e.g. 11-9, 12-10).");
                  return;
                }
              }
            }

            const playedSets = [];
            let p1SetsWon = 0;
            let p2SetsWon = 0;

            if (!isNaN(s1_1) && !isNaN(s1_2)) {
              playedSets.push({ p1: s1_1, p2: s1_2 });
              if (s1_1 > s1_2) p1SetsWon++;
              else if (s1_2 > s1_1) p2SetsWon++;
            }
            if (!isNaN(s2_1) && !isNaN(s2_2)) {
              playedSets.push({ p1: s2_1, p2: s2_2 });
              if (s2_1 > s2_2) p1SetsWon++;
              else if (s2_2 > s2_1) p2SetsWon++;
            }
            if (!isNaN(s3_1) && !isNaN(s3_2)) {
              playedSets.push({ p1: s3_1, p2: s3_2 });
              if (s3_1 > s3_2) p1SetsWon++;
              else if (s3_2 > s3_1) p2SetsWon++;
            }

            if (playedSets.length === 0) {
              alert("Please enter scores for at least 1 set.");
              return;
            }

            const scoreP1Str = playedSets.map(s => `${s.p1}-${s.p2}`).join(', ');
            const scoreP2Str = playedSets.map(s => `${s.p2}-${s.p1}`).join(', ');
            const winnerId = p1SetsWon > p2SetsWon ? selectedMatch.player1_id : selectedMatch.player2_id;

            updateMatch(selectedMatch.id, {
              status: 'played',
              confirmed: true,
              score_p1: scoreP1Str,
              score_p2: scoreP2Str,
              winner_id: winnerId
            });

            setSelectedMatch(null);
            setS1p1(''); setS1p2('');
            setS2p1(''); setS2p2('');
            setS3p1(''); setS3p2('');
          }} className="flex flex-col gap-3">
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'left' }}>Player</th>
                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center', width: '50px' }}>Set 1</th>
                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center', width: '50px' }}>Set 2</th>
                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center', width: '50px' }}>Set 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem 0.25rem', fontWeight: 'bold' }}>
                      {getPlayerName(selectedMatch.player1_id)}
                    </td>
                    <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        required 
                        className="input-field" 
                        style={{ width: '50px', minHeight: '32px', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }} 
                        value={s1p1} 
                        onChange={e => setS1p1(e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        className="input-field" 
                        style={{ width: '50px', minHeight: '32px', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }} 
                        value={s2p1} 
                        onChange={e => setS2p1(e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        className="input-field" 
                        style={{ width: '50px', minHeight: '32px', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }} 
                        value={s3p1} 
                        onChange={e => setS3p1(e.target.value)} 
                      />
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.5rem 0.25rem', fontWeight: 'bold' }}>
                      {getPlayerName(selectedMatch.player2_id)}
                    </td>
                    <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        required 
                        className="input-field" 
                        style={{ width: '50px', minHeight: '32px', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }} 
                        value={s1p2} 
                        onChange={e => setS1p2(e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        className="input-field" 
                        style={{ width: '50px', minHeight: '32px', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }} 
                        value={s2p2} 
                        onChange={e => setS2p2(e.target.value)} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        className="input-field" 
                        style={{ width: '50px', minHeight: '32px', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }} 
                        value={s3p2} 
                        onChange={e => setS3p2(e.target.value)} 
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {selectedMatch.sport === 'tennis' ? (
              <div style={{ fontSize: '0.8rem', background: 'rgba(223, 255, 0, 0.05)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(223, 255, 0, 0.15)', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                🎾 <strong>Tennis Match Format</strong>:<br/>
                • Sets 1 & 2: First to <strong>4 games</strong> wins the set (no 2-game advantage or tiebreaks, e.g., 4-3).<br/>
                • Set 3: A deciding <strong>long tiebreak to 10 points</strong> (win by 2, e.g. 10-8, 12-10). Leave blank if won in 2 sets.
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', background: 'rgba(255, 0, 255, 0.05)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255, 0, 255, 0.15)', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                🏓 <strong>Pickleball Match Format</strong>:<br/>
                • Best of 3 sets. First to <strong>11 points</strong> (win by 2, e.g. 11-9, 12-10).<br/>
                • Set 3: Played using <strong>Rally Scoring</strong> (every rally wins a point regardless of who served). Still played to 11 points (win by 2).
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <button type="submit" className="btn btn-primary" style={{ flex: 1, minHeight: '38px', fontSize: '0.9rem' }}>Confirm</button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, minHeight: '38px', fontSize: '0.9rem' }} 
                onClick={() => {
                  setSelectedMatch(null);
                  setS1p1(''); setS1p2('');
                  setS2p1(''); setS2p2('');
                  setS3p1(''); setS3p2('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Past Matches History */}
      <h3>Past Matches</h3>
      <div className="flex flex-col gap-2">
        {pastMatches.map(m => {
          const opp = getOpponent(m);
          return (
            <div key={m.id} className="card" style={{ opacity: 0.9, backgroundColor: 'rgba(28,37,65,0.5)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <strong>VS {opp?.name}</strong>
                  <div className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {m.sport} • {m.scheduled_at.split('T')[0]}
                  </div>
                </div>
                <div 
                  style={{ 
                    fontWeight: 'bold', 
                    color: m.winner_id === player.id ? 'var(--success-color)' : 'var(--danger-color)',
                    fontSize: '0.9rem'
                  }}
                >
                  {m.winner_id === player.id ? 'WIN (+3 pts)' : 'LOSS (+1 pt)'}
                </div>
              </div>
              <div className="text-secondary mt-1" style={{ fontSize: '0.85rem' }}>
                Score: {m.score_p1} - {m.score_p2}
              </div>
            </div>
          )
        })}
        {pastMatches.length === 0 && <div className="text-secondary" style={{ fontSize: '0.9rem' }}>No matches recorded yet.</div>}
      </div>
    </div>
  );
};

export default Dashboard;

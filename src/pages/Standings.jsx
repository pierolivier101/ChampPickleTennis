import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Crown, HelpCircle } from 'lucide-react';

const Standings = () => {
  const { players, matches } = useStore();
  const [filter, setFilter] = useState('all'); // 'all', 'tennis', 'pickleball'

  const standingsData = useMemo(() => {
    // Initialize stats
    const stats = {};
    players.forEach(p => {
      stats[p.id] = {
        id: p.id,
        name: p.name,
        sport: p.sport,
        played: 0,
        wins: 0,
        losses: 0,
        noShows: 0,
        points: 0
      };
    });

    // Calculate from matches
    matches.filter(m => m.status === 'played' && m.confirmed).forEach(m => {
      const p1 = stats[m.player1_id];
      const p2 = stats[m.player2_id];
      
      if (!p1 || !p2) return;

      p1.played += 1;
      p2.played += 1;
      
      if (m.winner_id === m.player1_id) {
        p1.wins += 1;
        p1.points += 3;
        p2.losses += 1;
        p2.points += 1;
      } else if (m.winner_id === m.player2_id) {
        p2.wins += 1;
        p2.points += 3;
        p1.losses += 1;
        p1.points += 1;
      }
    });

    // Convert to array and sort
    let result = Object.values(stats);
    
    if (filter !== 'all') {
      result = result.filter(s => s.sport === filter || s.sport === 'both');
    }

    result.sort((a, b) => b.points - a.points || b.wins - a.wins);
    
    return result;
  }, [players, matches, filter]);

  // Extract top 3 for the podium
  const podiumPlayers = useMemo(() => {
    const top3 = standingsData.slice(0, 3);
    // Rearrange as: 2nd place, 1st place, 3rd place for visual appeal
    const ordered = [];
    if (top3[1]) ordered.push({ ...top3[1], rank: 2 });
    if (top3[0]) ordered.push({ ...top3[0], rank: 1 });
    if (top3[2]) ordered.push({ ...top3[2], rank: 3 });
    return ordered;
  }, [standingsData]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Crown className="text-primary" size={28} /> Leaderboard
        </h2>
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
          3 points for a Win, 1 point for a Played Loss. Climb to the top!
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="flex gap-2 p-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px' }}>
        {['all', 'tennis', 'pickleball'].map(f => (
          <button 
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ 
              flex: 1, 
              textTransform: 'capitalize', 
              padding: '0.25rem 0.5rem', 
              fontSize: '0.85rem',
              minHeight: '36px',
              borderRadius: '10px',
              border: 'none',
              boxShadow: filter === f ? '0 0 10px rgba(223, 255, 0, 0.3)' : 'none'
            }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Podium Showcase */}
      {standingsData.length > 0 && (
        <div 
          className="flex justify-center items-end gap-3 mt-4 mb-2" 
          style={{ 
            minHeight: '220px', 
            padding: '1rem',
            background: 'linear-gradient(180deg, rgba(28, 37, 65, 0.4) 0%, rgba(11, 19, 43, 0.8) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          {podiumPlayers.map((player) => {
            const isFirst = player.rank === 1;
            const isThird = player.rank === 3;
            
            let podiumHeight = '100px';
            let podiumBg = 'rgba(255,255,255,0.05)';
            let borderColor = 'rgba(255,255,255,0.1)';
            let crownColor = '#CCCCCC';
            let medalEmoji = '🥈';

            if (isFirst) {
              podiumHeight = '140px';
              podiumBg = 'linear-gradient(180deg, rgba(223, 255, 0, 0.2) 0%, rgba(223, 255, 0, 0.05) 100%)';
              borderColor = 'rgba(223, 255, 0, 0.3)';
              crownColor = 'var(--primary-color)';
              medalEmoji = '👑';
            } else if (isThird) {
              podiumHeight = '80px';
              podiumBg = 'rgba(255,255,255,0.03)';
              crownColor = '#CD7F32';
              medalEmoji = '🥉';
            }

            return (
              <div 
                key={player.id} 
                className="flex flex-col items-center" 
                style={{ width: '30%', maxWidth: '120px' }}
              >
                {/* Avatar/Crown Container */}
                <div className="flex flex-col items-center mb-2" style={{ position: 'relative' }}>
                  {isFirst && <Crown size={24} style={{ color: crownColor, marginBottom: '2px', filter: 'drop-shadow(0 0 5px rgba(223, 255, 0, 0.5))' }} />}
                  {!isFirst && <div style={{ height: '10px' }}></div>}
                  <div 
                    className="flex justify-center items-center" 
                    style={{
                      width: isFirst ? '56px' : '46px',
                      height: isFirst ? '56px' : '46px',
                      borderRadius: '50%',
                      background: isFirst 
                        ? 'linear-gradient(135deg, var(--primary-color) 0%, #CCEA00 100%)' 
                        : 'linear-gradient(135deg, #1C2541 0%, #0B132B 100%)',
                      color: isFirst ? 'var(--bg-color)' : 'var(--text-primary)',
                      border: `2px solid ${isFirst ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)'}`,
                      fontWeight: 'bold',
                      fontSize: isFirst ? '1.2rem' : '1rem',
                      boxShadow: isFirst ? '0 0 15px rgba(223, 255, 0, 0.4)' : 'none'
                    }}
                  >
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span 
                    style={{ 
                      position: 'absolute', 
                      bottom: '-5px', 
                      right: isFirst ? '2px' : '-2px', 
                      fontSize: '1rem' 
                    }}
                  >
                    {medalEmoji}
                  </span>
                </div>

                {/* Player Info */}
                <div className="text-center mb-2">
                  <div 
                    style={{ 
                      fontWeight: 'bold', 
                      fontSize: '0.85rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}
                  >
                    {player.name}
                  </div>
                  <div className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {player.sport === 'both' ? 'Tennis/PKBL' : player.sport}
                  </div>
                </div>

                {/* Podium Pedestal */}
                <div 
                  className="flex flex-col justify-center items-center"
                  style={{
                    height: podiumHeight,
                    width: '100%',
                    background: podiumBg,
                    border: `1px solid ${borderColor}`,
                    borderBottom: 'none',
                    borderRadius: '12px 12px 0 0',
                    padding: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: isFirst ? 'var(--primary-color)' : 'var(--text-primary)' }}>
                    {player.points}
                  </span>
                  <span className="text-secondary" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Points
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div 
        className="card" 
        style={{ 
          padding: '0.75rem', 
          overflowX: 'auto', 
          background: 'rgba(28, 37, 65, 0.6)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '20px'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Rank</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Player</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Pl</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>W</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>L</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Win%</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standingsData.map((row, index) => {
              const winRate = row.played > 0 ? Math.round((row.wins / row.played) * 100) : 0;
              const isTop3 = index < 3;
              return (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    transition: 'background-color 0.2s',
                    backgroundColor: isTop3 ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}
                  className="leaderboard-row"
                >
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 'bold', color: isTop3 ? 'var(--text-primary)' : 'rgba(255,255,255,0.9)' }}>
                        {row.name}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                        {row.sport === 'both' ? 'Tennis & Pickleball' : row.sport}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>{row.played}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--success-color)' }}>{row.wins}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--danger-color)' }}>{row.losses}</td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: '600' }}>
                    {winRate}%
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    {row.points}
                  </td>
                </tr>
              );
            })}
            {standingsData.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-secondary" style={{ padding: '2rem' }}>
                  <HelpCircle size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                  <div>No data available for this category</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;

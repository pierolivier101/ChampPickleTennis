import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Calendar as CalendarIcon, MapPin, Send, Plus } from 'lucide-react';
import { getGoogleCalendarUrl, downloadICalFile } from '../services/calendarExport';

const Calendar = () => {
  const { matches, players, currentUser, addMatch } = useStore();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'month'
  const [selectedDay, setSelectedDay] = useState(null); // Clicked calendar day (e.g. 15)
  const [isBooking, setIsBooking] = useState(false);

  // Booking Form State
  const [opponentId, setOpponentId] = useState('');
  const [sport, setSport] = useState('tennis');
  const [court, setCourt] = useState('Court A');
  const [dateStr, setDateStr] = useState('15-06'); // DD-MM format
  const [timeStr, setTimeStr] = useState('17:00'); // HH:MM format

  const me = players.find(p => p.id === currentUser?.id);
  const myFriends = useMemo(() => {
    if (!me) return [];
    const list = me.friends || [];
    return players.filter(p => list.includes(p.id));
  }, [me, players]);

  const getPlayerName = (id) => players.find(p => p.id === id)?.name || 'Unknown';

  const handleBookMatch = (e) => {
    e.preventDefault();
    if (!opponentId || !currentUser) return;

    // Parse date & time
    const day = dateStr.split('-')[0];
    const month = dateStr.split('-')[1] || '06';
    const hour = timeStr.split(':')[0];
    const min = timeStr.split(':')[1] || '00';

    const scheduledAt = `2026-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${min.padStart(2, '0')}:00`;

    addMatch({
      player1_id: currentUser.id,
      player2_id: opponentId,
      sport,
      court,
      scheduled_at: scheduledAt,
      status: 'pending_invite',
      confirmed: false
    });

    setIsBooking(false);
    setOpponentId('');
    alert("Invitation sent! Opponent can accept this under their Dashboard notifications.");
  };

  // Sort matches by date ascending
  const sortedMatches = useMemo(() => {
    return [...matches]
      .filter(m => m.status !== 'declined_invite')
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  }, [matches]);

  // June 2026 Calendar Grid generation
  // June 1, 2026 is a Monday. June has 30 days.
  const daysInJune = 30;

  const calendarDays = useMemo(() => {
    const days = [];
    // Pad empty days at start (since June 1, 2026 is a Monday, no offset is needed if starting on Mon)
    // Let's just generate numbers 1 to 30
    for (let i = 1; i <= daysInJune; i++) {
      const dateString = `2026-06-${String(i).padStart(2, '0')}`;
      const dayMatches = sortedMatches.filter(m => m.scheduled_at.startsWith(dateString));
      days.push({ dayNumber: i, dateString, matches: dayMatches });
    }
    return days;
  }, [sortedMatches]);

  // Filter list by selected day if in Month mode and a day is selected
  const filteredMatches = useMemo(() => {
    if (viewMode === 'month' && selectedDay) {
      const prefix = `2026-06-${String(selectedDay).padStart(2, '0')}`;
      return sortedMatches.filter(m => m.scheduled_at.startsWith(prefix));
    }
    return sortedMatches;
  }, [sortedMatches, viewMode, selectedDay]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in" style={{ paddingBottom: '3rem' }}>
      
      {/* Calendar Header & Tab Switcher */}
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={24} className="text-primary" /> Calendar
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>View upcoming matches and book a court.</p>
        </div>
        
        {/* Book match button */}
        {currentUser?.role === 'player' && (
          <button 
            onClick={() => setIsBooking(!isBooking)} 
            className="btn btn-primary"
            style={{ 
              minHeight: '36px', 
              padding: '0 0.75rem', 
              fontSize: '0.85rem',
              display: 'flex',
              gap: '4px'
            }}
          >
            <Plus size={16} />
            <span>Invite Friend</span>
          </button>
        )}
      </div>

      {/* Match Inviter Modal/Card */}
      {isBooking && (
        <div className="card" style={{ border: '1px solid var(--primary-color)' }}>
          <h3>Schedule Game & Invite Friend</h3>
          <p className="text-secondary mb-2" style={{ fontSize: '0.8rem' }}>Create a match slot and notify your friend.</p>
          {myFriends.length === 0 ? (
            <div className="text-secondary text-center py-2" style={{ fontSize: '0.85rem' }}>
              ⚠️ You must add friends first before inviting them to a match.
            </div>
          ) : (
            <form onSubmit={handleBookMatch} className="flex flex-col gap-3">
              <div>
                <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Select Opponent</label>
                <select className="input-field" required value={opponentId} onChange={e => setOpponentId(e.target.value)}>
                  <option value="">Choose friend...</option>
                  {myFriends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <div style={{ flex: 1 }}>
                  <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Sport</label>
                  <select className="input-field" value={sport} onChange={e => setSport(e.target.value)}>
                    <option value="tennis">Tennis</option>
                    <option value="pickleball">Pickleball</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Court / Venue</label>
                  <select className="input-field" value={court} onChange={e => setCourt(e.target.value)}>
                    <option value="Court A">Court A</option>
                    <option value="Court B">Court B</option>
                    <option value="Center Court">Center Court</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <div style={{ flex: 1 }}>
                  <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Date (DD-MM)</label>
                  <input type="text" placeholder="15-06" required className="input-field" value={dateStr} onChange={e => setDateStr(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-secondary" style={{ fontSize: '0.8rem' }}>Time (HH:MM)</label>
                  <input type="text" placeholder="17:00" required className="input-field" value={timeStr} onChange={e => setTimeStr(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary" style={{ minHeight: '36px', fontSize: '0.85rem' }} onClick={() => setIsBooking(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ minHeight: '36px', fontSize: '0.85rem', display: 'flex', gap: '2px' }}><Send size={14} /> Send invite</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* View Switcher Tabs */}
      <div className="flex gap-2 p-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
        <button onClick={() => { setViewMode('list'); setSelectedDay(null); }} className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, minHeight: '36px', border: 'none', fontSize: '0.85rem' }}>
          Schedule List
        </button>
        <button onClick={() => setViewMode('month')} className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, minHeight: '36px', border: 'none', fontSize: '0.85rem' }}>
          Month Grid (June 2026)
        </button>
      </div>

      {/* MONTH VIEW: GRID SHAPES */}
      {viewMode === 'month' && (
        <div className="card" style={{ padding: '0.75rem' }}>
          <div className="text-center font-bold mb-2">June 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginTop: '4px' }}>
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDay === day.dayNumber;
              const hasMatches = day.matches.length > 0;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(isSelected ? null : day.dayNumber)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: isSelected ? 'rgba(223, 255, 0, 0.15)' : 
                                     hasMatches ? 'rgba(223, 255, 0, 0.05)' : 'rgba(0,0,0,0.15)',
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    position: 'relative'
                  }}
                >
                  <span>{day.dayNumber}</span>
                  {hasMatches && (
                    <span 
                      style={{
                        position: 'absolute', bottom: '3px', width: '5px', height: '5px', borderRadius: '50%',
                        backgroundColor: 'var(--primary-color)'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MATCHES LIST */}
      <div className="flex flex-col gap-3 mt-1">
        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
          {selectedDay ? `Matches on June ${selectedDay}` : 'All Matches'} ({filteredMatches.length})
        </h3>
        
        {filteredMatches.map(m => {
          const dateObj = new Date(m.scheduled_at);
          let dateStr = 'Invalid Date';
          let timeStr = 'Invalid Time';
          if (!isNaN(dateObj.getTime())) {
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            dateStr = `${day}-${month}`;
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            timeStr = `${hours}:${minutes}`;
          }

          const isInvite = m.status === 'pending_invite';

          return (
            <div key={m.id} className="card" style={{ padding: '1rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                backgroundColor: isInvite ? 'var(--warning-color)' : 
                                 m.status === 'played' ? 'var(--success-color)' : 
                                 'var(--primary-color)' 
              }} />
              
              <div className="flex justify-between items-center mb-1">
                <span className={`badge ${m.sport === 'tennis' ? 'badge-tennis' : 'badge-pickleball'}`}>
                  {m.sport} {isInvite && '• Invitation'}
                </span>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{dateStr} • {timeStr}</span>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className="flex-col flex" style={{ flex: 1, alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{getPlayerName(m.player1_id)}</strong>
                </div>
                <div className="text-secondary font-bold px-2">VS</div>
                <div className="flex-col flex" style={{ flex: 1, alignItems: 'center' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{getPlayerName(m.player2_id)}</strong>
                </div>
              </div>
              
              <div className="flex justify-center items-center gap-1 mt-3 text-secondary" style={{ fontSize: '0.85rem' }}>
                <MapPin size={14} />
                <span>{m.court || 'Main Court'}</span>
              </div>

              {m.status === 'upcoming' && (
                <div className="flex gap-2 justify-center mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <a 
                    href={getGoogleCalendarUrl(m, getPlayerName(m.player1_id), getPlayerName(m.player2_id))} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', minHeight: '28px', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    📅 Google Calendar
                  </a>
                  <button 
                    onClick={() => downloadICalFile(m, getPlayerName(m.player1_id), getPlayerName(m.player2_id))}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', minHeight: '28px', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    📲 Apple / iCal
                  </button>
                </div>
              )}

              {m.status === 'played' && (
                <div className="text-center mt-2 text-primary font-bold" style={{ fontSize: '1rem' }}>
                  Score: {m.score_p1} - {m.score_p2}
                </div>
              )}
            </div>
          );
        })}

        {filteredMatches.length === 0 && (
          <div className="text-center text-secondary py-4" style={{ fontSize: '0.9rem' }}>
            No matches found for this view.
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;

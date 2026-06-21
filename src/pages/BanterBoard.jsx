import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldAlert, Send, MessageSquare, Users, UserPlus, Check, X } from 'lucide-react';

const BanterBoard = () => {
  const { 
    messages, 
    players, 
    currentUser, 
    addMessage, 
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest 
  } = useStore();

  const [activeTab, setActiveTab] = useState('locker'); // 'locker' | 'dms' | 'friends'
  const [activeDmFriendId, setActiveDmFriendId] = useState(null); // ID of friend being chatted with
  const [newMsg, setNewMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const me = players.find(p => p.id === currentUser?.id);

  // Profanity/trash-talk moderation
  const moderateMessage = (text) => {
    const toxicTerms = [
      /trash/i, /garbage/i, /loser/i, /suck/i, /noob/i, /ez/i, /easy win/i, 
      /destroy/i, /wreck/i, /worst/i, /terrible/i, /rubbish/i, /hate/i, /dummy/i,
      /fuck/i, /shit/i, /bitch/i, /ass/i, /crap/i, /bad player/i
    ];
    
    let sanitized = text;
    let matchesToxic = false;
    
    toxicTerms.forEach(regex => {
      if (regex.test(sanitized)) {
        matchesToxic = true;
        sanitized = sanitized.replace(regex, '🎾 friendly hit 🎾');
      }
    });
    
    return { sanitized, matchesToxic };
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !currentUser || currentUser.role !== 'player') return;
    
    const { sanitized, matchesToxic } = moderateMessage(newMsg.trim());
    
    if (matchesToxic) {
      setWarningMsg("Let's keep it friendly! Disrespectful or trash-talk words were replaced with sports terms. 🎾");
      setTimeout(() => setWarningMsg(''), 4000);
    } else {
      setWarningMsg('');
    }

    if (activeTab === 'dms' && activeDmFriendId) {
      addMessage(currentUser.id, sanitized, activeDmFriendId);
    } else {
      addMessage(currentUser.id, sanitized); // Public Locker Room
    }
    setNewMsg('');
  };

  const getPlayerName = (id) => players.find(p => p.id === id)?.name || 'Unknown';

  // Filter messages based on active tab
  const displayedMessages = useMemo(() => {
    const list = messages || [];
    if (activeTab === 'locker') {
      return list.filter(m => !m.recipient_id);
    }
    if (activeTab === 'dms' && activeDmFriendId) {
      return list.filter(m => 
        (m.author_id === currentUser.id && m.recipient_id === activeDmFriendId) ||
        (m.author_id === activeDmFriendId && m.recipient_id === currentUser.id)
      );
    }
    return [];
  }, [messages, activeTab, activeDmFriendId, currentUser]);

  // Friend list items
  const myFriends = useMemo(() => {
    if (!me) return [];
    const friendsList = me.friends || [];
    return players.filter(p => friendsList.includes(p.id));
  }, [me, players]);

  // Friends search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return players.filter(p => 
      p.id !== currentUser?.id && 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, players, currentUser?.id]);

  // Pending incoming requests
  const pendingRequests = useMemo(() => {
    if (!me) return [];
    const requests = me.friendRequests || [];
    return players.filter(p => requests.includes(p.id));
  }, [me, players]);

  if (currentUser?.role !== 'player') {
    return (
      <div className="card text-center" style={{ padding: '2rem' }}>
        🔒 Only logged-in players can access the Chat Hub.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 'calc(100vh - 150px)', gap: '1rem' }}>
      
      {/* Tab Selectors */}
      <div className="flex gap-2 p-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
        <button 
          onClick={() => { setActiveTab('locker'); setActiveDmFriendId(null); }} 
          className={`btn ${activeTab === 'locker' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minHeight: '36px', fontSize: '0.85rem', borderRadius: '8px', border: 'none' }}
        >
          <MessageSquare size={16} style={{ marginRight: '4px' }} /> Locker Room
        </button>
        <button 
          onClick={() => setActiveTab('dms')} 
          className={`btn ${activeTab === 'dms' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minHeight: '36px', fontSize: '0.85rem', borderRadius: '8px', border: 'none' }}
        >
          <Users size={16} style={{ marginRight: '4px' }} /> Direct Chat
        </button>
        <button 
          onClick={() => setActiveTab('friends')} 
          className={`btn ${activeTab === 'friends' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1, minHeight: '36px', fontSize: '0.85rem', borderRadius: '8px', border: 'none' }}
        >
          <UserPlus size={16} style={{ marginRight: '4px' }} /> Friends
        </button>
      </div>

      {/* Warning message toast */}
      {warningMsg && (
        <div 
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: 'rgba(255, 77, 77, 0.15)', 
            border: '1px solid var(--danger-color)', 
            color: '#FF8888',
            borderRadius: '8px', 
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          {warningMsg}
        </div>
      )}

      {/* TABS CONTENT */}

      {/* TAB 1: LOCKER ROOM (PUBLIC CHAT) */}
      {activeTab === 'locker' && (
        <>
          <div 
            className="flex items-center gap-3" 
            style={{ 
              padding: '0.75rem 1rem', 
              backgroundColor: 'rgba(0, 230, 118, 0.1)', 
              border: '1px solid var(--success-color)', 
              borderRadius: '12px',
              fontSize: '0.85rem'
            }}
          >
            <ShieldAlert size={20} style={{ color: 'var(--success-color)', flexShrink: 0 }} />
            <div>
              <strong>Respectful Locker Room:</strong> Trash talk, insults, or toxicity are filtered. Keep it friendly!
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto flex flex-col gap-3 mb-2 card" 
            style={{ 
              maxHeight: '45vh',
              padding: '1rem',
              background: 'rgba(28, 37, 65, 0.4)',
              borderRadius: '20px'
            }}
          >
            {displayedMessages.length === 0 && (
              <div className="text-center text-secondary my-4" style={{ fontSize: '0.9rem' }}>
                It's quiet in here... start a friendly conversation!
              </div>
            )}
            {displayedMessages.map(msg => {
              const isMe = currentUser?.id === msg.author_id;
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-secondary mb-1" style={{ fontSize: '0.7rem' }}>
                    {getPlayerName(msg.author_id)} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  <div 
                    style={{ 
                      backgroundColor: isMe ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                      color: isMe ? 'var(--bg-color)' : 'var(--text-primary)',
                      padding: '0.6rem 0.9rem',
                      borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                      maxWidth: '85%',
                      fontWeight: isMe ? '600' : '400'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* TAB 2: DIRECT CHATS */}
      {activeTab === 'dms' && (
        <div className="flex gap-2 flex-1" style={{ minHeight: '40vh' }}>
          {/* Friends List Sidebar */}
          <div className="card" style={{ width: '35%', padding: '0.5rem', backgroundColor: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0.25rem' }}>FRIENDS</h4>
            {myFriends.length === 0 && (
              <div className="text-secondary text-center" style={{ fontSize: '0.75rem', padding: '1rem 0' }}>
                No friends yet. Add friends under the Friends tab!
              </div>
            )}
            <div className="flex flex-col gap-1">
              {myFriends.map(friend => (
                <button 
                  key={friend.id}
                  onClick={() => setActiveDmFriendId(friend.id)}
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    minHeight: '36px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.8rem',
                    backgroundColor: activeDmFriendId === friend.id ? 'var(--primary-color)' : 'transparent',
                    color: activeDmFriendId === friend.id ? 'var(--bg-color)' : 'var(--text-primary)',
                  }}
                >
                  {friend.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex flex-col flex-1 card" style={{ padding: '0.75rem', backgroundColor: 'rgba(28,37,65,0.4)', borderRadius: '16px' }}>
            {activeDmFriendId ? (
              <>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Chat with {getPlayerName(activeDmFriendId)}
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-2" style={{ maxHeight: '35vh' }}>
                  {displayedMessages.length === 0 && (
                    <div className="text-center text-secondary my-4" style={{ fontSize: '0.8rem' }}>
                      No messages yet. Say hello!
                    </div>
                  )}
                  {displayedMessages.map(msg => {
                    const isMe = currentUser?.id === msg.author_id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div 
                          style={{ 
                            backgroundColor: isMe ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                            color: isMe ? 'var(--bg-color)' : 'var(--text-primary)',
                            padding: '0.5rem 0.75rem',
                            borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                            maxWidth: '85%',
                            fontSize: '0.85rem'
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-secondary" style={{ fontSize: '0.85rem' }}>
                Select a friend from the sidebar to chat
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FRIENDS MANAGEMENT & DIRECTORY */}
      {activeTab === 'friends' && (
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
          {/* Pending Invitations list */}
          {pendingRequests.length > 0 && (
            <div className="card" style={{ border: '1px solid var(--primary-color)' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Pending Friend Requests</h3>
              <div className="flex flex-col gap-2">
                {pendingRequests.map(req => (
                  <div key={req.id} className="flex justify-between items-center p-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{req.name}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptFriendRequest(me.id, req.id)} 
                        className="btn btn-primary"
                        style={{ minHeight: '30px', padding: '0 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '2px' }}
                      >
                        <Check size={14} /> Accept
                      </button>
                      <button 
                        onClick={() => declineFriendRequest(me.id, req.id)} 
                        className="btn btn-secondary"
                        style={{ minHeight: '30px', padding: '0 0.5rem', fontSize: '0.75rem', display: 'flex', gap: '2px' }}
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Players */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Search Players</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search by name..." 
                className="input-field" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {searchQuery && (
              <div className="flex flex-col gap-2 mt-3" style={{ maxHeight: '20vh', overflowY: 'auto' }}>
                {searchResults.length === 0 && <div className="text-secondary text-center" style={{ fontSize: '0.85rem' }}>No players found</div>}
                {searchResults.map(p => {
                  const isFriend = me?.friends?.includes(p.id);
                  const sentRequest = p?.friendRequests?.includes(me.id);
                  return (
                    <div key={p.id} className="flex justify-between items-center p-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <div className="flex flex-col">
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{p.name}</span>
                        <span className="text-secondary" style={{ fontSize: '0.7rem' }}>Skill: {p.skillLevel || 'Intermediate'}</span>
                      </div>
                      {isFriend ? (
                        <span style={{ color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Friends</span>
                      ) : sentRequest ? (
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>Pending...</span>
                      ) : (
                        <button 
                          onClick={() => sendFriendRequest(me.id, p.id)} 
                          className="btn btn-primary"
                          style={{ minHeight: '30px', padding: '0 0.5rem', fontSize: '0.75rem' }}
                        >
                          + Add Friend
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Friends List View */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>My Friends List ({myFriends.length})</h3>
            {myFriends.length === 0 ? (
              <div className="text-secondary text-center" style={{ fontSize: '0.85rem', padding: '1rem' }}>
                Your friends list is empty. Add friends above!
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {myFriends.map(friend => (
                  <div key={friend.id} className="flex justify-between items-center p-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>{friend.name}</strong>
                      <div className="text-secondary" style={{ fontSize: '0.7rem' }}>Avail: {friend.availability || 'Weekends'}</div>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('dms'); setActiveDmFriendId(friend.id); }} 
                      className="btn btn-primary" 
                      style={{ minHeight: '30px', padding: '0 0.5rem', fontSize: '0.75rem' }}
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INPUT FORM (ONLY SHOWN FOR LOCKER OR ACTIVE DMS) */}
      {(activeTab === 'locker' || (activeTab === 'dms' && activeDmFriendId)) && (
        <form onSubmit={handleSend} className="flex gap-2 mt-auto">
          <input 
            type="text" 
            className="input-field flex-1" 
            placeholder="Type a friendly message..." 
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            style={{ 
              borderRadius: '12px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              padding: '0 1.25rem', 
              borderRadius: '12px',
              minHeight: '44px',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default BanterBoard;

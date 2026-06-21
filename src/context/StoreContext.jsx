/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default initial state with rich simulation data
const defaultState = {
  players: [
    {
      id: '1',
      name: 'Carlos Alcaraz',
      sport: 'both',
      pin: '1111',
      avatar_initials: 'CA',
      friends: ['2', '3'],
      friendRequests: [],
      bio: 'Wimbledon Champion. Eager to hit the courts!',
      age: '23',
      gender: 'Male',
      skillLevel: 'Advanced',
      contact: 'carlos@atp.com',
      availability: 'Evenings & Weekends',
      preferredSports: ['tennis', 'pickleball']
    },
    {
      id: '2',
      name: 'Jannik Sinner',
      sport: 'tennis',
      pin: '2222',
      avatar_initials: 'JS',
      friends: ['1', '3'],
      friendRequests: [],
      bio: 'Australian Open Champion. Fast pace court fan.',
      age: '24',
      gender: 'Male',
      skillLevel: 'Advanced',
      contact: 'jannik@atp.com',
      availability: 'Weekends',
      preferredSports: ['tennis']
    },
    {
      id: '3',
      name: 'Ben Johns',
      sport: 'pickleball',
      pin: '3333',
      avatar_initials: 'BJ',
      friends: ['1', '2'],
      friendRequests: [],
      bio: '#1 Pickleball player in the world.',
      age: '26',
      gender: 'Male',
      skillLevel: 'Advanced',
      contact: 'ben@ppa.com',
      availability: 'Anytime',
      preferredSports: ['pickleball']
    },
    {
      id: '4',
      name: 'Anna Leigh Waters',
      sport: 'pickleball',
      pin: '4444',
      avatar_initials: 'AW',
      friends: [],
      friendRequests: ['3'],
      bio: 'Top ranked women\'s pickleball star.',
      age: '19',
      gender: 'Female',
      skillLevel: 'Advanced',
      contact: 'alw@ppa.com',
      availability: 'Weekdays',
      preferredSports: ['pickleball']
    }
  ],
  matches: [
    {
      id: 'm1',
      player1_id: '1',
      player2_id: '2',
      sport: 'tennis',
      scheduled_at: '2026-06-15T10:00:00',
      court: 'Center Court',
      status: 'played',
      confirmed: true,
      score_p1: '6-4',
      score_p2: '6-3',
      winner_id: '1'
    },
    {
      id: 'm2',
      player1_id: '1',
      player2_id: '2',
      sport: 'tennis',
      scheduled_at: '2026-06-16T14:00:00',
      court: 'Center Court',
      status: 'played',
      confirmed: true,
      score_p1: '5-7',
      score_p2: '6-4, 6-2',
      winner_id: '2'
    },
    {
      id: 'm3',
      player1_id: '1',
      player2_id: '3',
      sport: 'tennis',
      scheduled_at: '2026-06-17T11:00:00',
      court: 'Court A',
      status: 'played',
      confirmed: true,
      score_p1: '6-2',
      score_p2: '6-1',
      winner_id: '1'
    },
    {
      id: 'm4',
      player1_id: '2',
      player2_id: '3',
      sport: 'tennis',
      scheduled_at: '2026-06-17T16:00:00',
      court: 'Court B',
      status: 'played',
      confirmed: true,
      score_p1: '6-3',
      score_p2: '6-2',
      winner_id: '2'
    },
    {
      id: 'm5',
      player1_id: '3',
      player2_id: '4',
      sport: 'pickleball',
      scheduled_at: '2026-06-18T10:00:00',
      court: 'Court 1',
      status: 'played',
      confirmed: true,
      score_p1: '8-11',
      score_p2: '9-11',
      winner_id: '4'
    },
    {
      id: 'm6',
      player1_id: '3',
      player2_id: '4',
      sport: 'pickleball',
      scheduled_at: '2026-06-18T15:00:00',
      court: 'Court 2',
      status: 'played',
      confirmed: true,
      score_p1: '11-9, 11-7',
      score_p2: '11-9, 5-11',
      winner_id: '3'
    },
    {
      id: 'm7',
      player1_id: '1',
      player2_id: '4',
      sport: 'pickleball',
      scheduled_at: '2026-06-19T09:00:00',
      court: 'Court 1',
      status: 'played',
      confirmed: true,
      score_p1: '5-11',
      score_p2: '7-11',
      winner_id: '4'
    },
    {
      id: 'm8',
      player1_id: '2',
      player2_id: '4',
      sport: 'pickleball',
      scheduled_at: '2026-06-19T13:00:00',
      court: 'Court 2',
      status: 'played',
      confirmed: true,
      score_p1: '11-9',
      score_p2: '12-10',
      winner_id: '2'
    },
    {
      id: 'm9',
      player1_id: '1',
      player2_id: '2',
      sport: 'tennis',
      scheduled_at: '2026-06-25T17:00:00',
      court: 'Center Court',
      status: 'upcoming',
      confirmed: false
    }
  ],
  messages: [
    { id: 'msg1', author_id: '1', text: 'Great matches today everyone!', timestamp: '2026-06-19T10:00:00.000Z' },
    { id: 'msg2', author_id: '2', text: 'Thanks Carlos, that second set was super close.', timestamp: '2026-06-19T10:05:00.000Z' },
    { id: 'msg3', author_id: '4', text: 'Anyone up for a pickleball session tomorrow morning?', timestamp: '2026-06-19T10:10:00.000Z' },
    { id: 'msg4', author_id: '3', text: 'Count me in, AW!', timestamp: '2026-06-19T10:12:00.000Z' }
  ],
  reminders: [],
  adminPin: '0000',
  currentUser: null,
};

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem('championAceState');
      const parsed = stored ? JSON.parse(stored) : null;
      if (!parsed || !parsed.players || parsed.players.length === 0) {
        return defaultState;
      }
      return { ...defaultState, ...parsed };
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      return defaultState;
    }
  });

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('championAceState', JSON.stringify(state));
  }, [state]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'championAceState' && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginAdmin = useCallback((pin) => {
    if (pin === state.adminPin) {
      setState(prev => ({ ...prev, currentUser: { role: 'admin' } }));
      return true;
    }
    return false;
  }, [state.adminPin]);

  const loginPlayer = useCallback((name, pin) => {
    const player = state.players.find(p => p.name.toLowerCase() === name.toLowerCase() && p.pin === pin);
    if (player) {
      setState(prev => ({ ...prev, currentUser: { role: 'player', id: player.id } }));
      return true;
    }
    return false;
  }, [state.players]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const addPlayer = useCallback((player) => {
    setState(prev => ({
      ...prev,
      players: [...prev.players, { 
        ...player, 
        id: Date.now().toString(),
        friends: [],
        friendRequests: [],
        bio: '',
        age: '',
        gender: '',
        skillLevel: 'Intermediate',
        contact: '',
        availability: 'Weekends & Evenings',
        preferredSports: player.sport === 'both' ? ['tennis', 'pickleball'] : [player.sport]
      }]
    }));
  }, []);

  const updatePlayer = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  const addMatch = useCallback((match) => {
    setState(prev => ({
      ...prev,
      matches: [...prev.matches, { ...match, id: Date.now().toString(), status: match.status || 'upcoming', confirmed: match.confirmed || false }]
    }));
  }, []);

  const updateMatch = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  }, []);

  const addMessage = useCallback((author_id, text, recipient_id = null) => {
    setState(prev => ({
      ...prev,
      messages: [...(prev.messages || []), { id: Date.now().toString(), author_id, recipient_id, text, timestamp: new Date().toISOString() }]
    }));
  }, []);

  const sendFriendRequest = useCallback((senderId, receiverId) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === receiverId) {
          const reqs = p.friendRequests || [];
          if (!reqs.includes(senderId)) {
            return { ...p, friendRequests: [...reqs, senderId] };
          }
        }
        return p;
      })
    }));
  }, []);

  const acceptFriendRequest = useCallback((playerId, requesterId) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === playerId) {
          const reqs = (p.friendRequests || []).filter(r => r !== requesterId);
          const fds = p.friends || [];
          return { 
            ...p, 
            friendRequests: reqs, 
            friends: fds.includes(requesterId) ? fds : [...fds, requesterId] 
          };
        }
        if (p.id === requesterId) {
          const fds = p.friends || [];
          return { 
            ...p, 
            friends: fds.includes(playerId) ? fds : [...fds, playerId] 
          };
        }
        return p;
      })
    }));
  }, []);

  const declineFriendRequest = useCallback((playerId, requesterId) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === playerId) {
          const reqs = (p.friendRequests || []).filter(r => r !== requesterId);
          return { ...p, friendRequests: reqs };
        }
        return p;
      })
    }));
  }, []);

  const simulateTournament = useCallback(() => {
    setState(prev => {
      const { players, matches } = prev;
      if (players.length < 2) return prev;

      const newMatches = [...matches];
      const sports = ['tennis', 'pickleball'];
      const courts = ['Court A', 'Court B', 'Center Court', 'Court 1', 'Court 2'];
      
      const tennisScores = ['6-4, 6-3', '7-5, 6-2', '6-2, 6-1', '6-3, 4-6, 6-2', '7-6, 6-4', '6-1, 6-3'];
      const pickleballScores = ['11-8, 11-6', '11-5, 11-9', '11-9, 8-11, 11-7', '11-3, 11-4', '12-10, 11-8'];

      const getRandomDate = () => {
        const day = Math.floor(Math.random() * 5) + 15; // June 15-19
        const hour = Math.floor(Math.random() * 8) + 9; // 9:00 - 17:00
        const min = Math.random() > 0.5 ? '00' : '30';
        return `2026-06-${day}T${String(hour).padStart(2, '0')}:${min}:00`;
      };

      players.forEach((player) => {
        // Find matches they are already part of
        let count = newMatches.filter(m => 
          m.status === 'played' && 
          (m.player1_id === player.id || m.player2_id === player.id)
        ).length;

        while (count < 5) {
          const opponents = players.filter(p => p.id !== player.id);
          if (opponents.length === 0) break;
          const opponent = opponents[Math.floor(Math.random() * opponents.length)];

          let sport;
          if (player.sport === 'pickleball' || opponent.sport === 'pickleball') {
            sport = 'pickleball';
          } else if (player.sport === 'both' && opponent.sport === 'both') {
            sport = sports[Math.floor(Math.random() * sports.length)];
          } else {
            sport = player.sport === 'both' ? opponent.sport : player.sport;
          }

          const score = sport === 'tennis' 
            ? tennisScores[Math.floor(Math.random() * tennisScores.length)]
            : pickleballScores[Math.floor(Math.random() * pickleballScores.length)];

          const winnerId = Math.random() > 0.5 ? player.id : opponent.id;
          const matchId = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          newMatches.push({
            id: matchId,
            player1_id: player.id,
            player2_id: opponent.id,
            sport,
            scheduled_at: getRandomDate(),
            court: courts[Math.floor(Math.random() * courts.length)],
            status: 'played',
            confirmed: true,
            score_p1: winnerId === player.id ? score.split(',')[0] : score.split(',')[1] || score,
            score_p2: winnerId === opponent.id ? score.split(',')[0] : score.split(',')[1] || score,
            winner_id: winnerId
          });

          count++;
        }
      });

      return {
        ...prev,
        matches: newMatches
      };
    });
  }, []);

  const value = {
    ...state,
    loginAdmin,
    loginPlayer,
    logout,
    addPlayer,
    updatePlayer,
    addMatch,
    updateMatch,
    addMessage,
    simulateTournament,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

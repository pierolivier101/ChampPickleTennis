/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, isConfigured } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  getDocs, 
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Default initial state with clean data for launch
const defaultState = {
  players: [],
  matches: [],
  messages: [],
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
      // If local storage has mock data containing 'Carlos Alcaraz', clear it
      if (parsed && parsed.players && parsed.players.some(p => p.name === 'Carlos Alcaraz')) {
        localStorage.removeItem('championAceState');
        return defaultState;
      }
      if (!parsed || !parsed.players) {
        return defaultState;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      return defaultState;
    }
  });

  // Local storage backup/session sync
  useEffect(() => {
    localStorage.setItem('championAceState', JSON.stringify(state));
  }, [state]);

  // Seed Firestore helper
  const seedDatabaseIfEmpty = useCallback(async () => {
    if (!isConfigured) return;
    try {
      const playersSnapshot = await getDocs(collection(db, 'players'));
      if (playersSnapshot.empty) {
        console.log('Seeding Firestore database with default tournament data...');
        const batch = writeBatch(db);
        
        defaultState.players.forEach(player => {
          batch.set(doc(db, 'players', player.id), player);
        });
        
        defaultState.matches.forEach(match => {
          batch.set(doc(db, 'matches', match.id), match);
        });
        
        defaultState.messages.forEach(msg => {
          batch.set(doc(db, 'messages', msg.id), msg);
        });
        
        await batch.commit();
        console.log('Firestore database successfully seeded!');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }, []);

  // Listen for real-time changes in Firestore
  useEffect(() => {
    if (!isConfigured) return;

    seedDatabaseIfEmpty();

    const unsubPlayers = onSnapshot(collection(db, 'players'), 
      (snapshot) => {
        const playersList = [];
        snapshot.forEach(docSnap => {
          playersList.push({ ...docSnap.data(), id: docSnap.id });
        });
        setState(prev => ({ ...prev, players: playersList }));
      },
      (error) => {
        console.error("Firestore unsubPlayers error:", error);
      }
    );

    const unsubMatches = onSnapshot(collection(db, 'matches'), 
      (snapshot) => {
        const matchesList = [];
        snapshot.forEach(docSnap => {
          matchesList.push({ ...docSnap.data(), id: docSnap.id });
        });
        setState(prev => ({ ...prev, matches: matchesList }));
      },
      (error) => {
        console.error("Firestore unsubMatches error:", error);
      }
    );

    const unsubMessages = onSnapshot(collection(db, 'messages'), 
      (snapshot) => {
        const messagesList = [];
        snapshot.forEach(docSnap => {
          messagesList.push({ ...docSnap.data(), id: docSnap.id });
        });
        messagesList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setState(prev => ({ ...prev, messages: messagesList }));
      },
      (error) => {
        console.error("Firestore unsubMessages error:", error);
      }
    );

    const unsubSettings = onSnapshot(doc(db, 'settings', 'admin'), 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.pin) {
            setState(prev => ({ ...prev, adminPin: data.pin }));
          }
        }
      },
      (error) => {
        console.error("Firestore unsubSettings error:", error);
      }
    );

    return () => {
      unsubPlayers();
      unsubMatches();
      unsubMessages();
      unsubSettings();
    };
  }, [seedDatabaseIfEmpty]);

  // Sync local storage across tabs (only needed for non-configured offline fallback)
  useEffect(() => {
    if (isConfigured) return;
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

  const addPlayer = useCallback(async (player) => {
    const newId = Date.now().toString();
    const newPlayerData = { 
      ...player, 
      id: newId,
      friends: [],
      friendRequests: [],
      bio: '',
      age: '',
      gender: '',
      skillLevel: 'Intermediate',
      contact: '',
      availability: 'Weekends & Evenings',
      preferredSports: player.sport === 'both' ? ['tennis', 'pickleball'] : [player.sport]
    };

    if (isConfigured) {
      try {
        await setDoc(doc(db, 'players', newId), newPlayerData);
      } catch (e) {
        console.error('Error writing player to Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        players: [...prev.players, newPlayerData]
      }));
    }
  }, []);

  const updatePlayer = useCallback(async (id, updates) => {
    if (isConfigured) {
      try {
        await updateDoc(doc(db, 'players', id), updates);
      } catch (e) {
        console.error('Error updating player in Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    }
  }, []);

  const addMatch = useCallback(async (match) => {
    const newId = Date.now().toString();
    const newMatchData = { 
      ...match, 
      id: newId, 
      status: match.status || 'upcoming', 
      confirmed: match.confirmed || false 
    };

    if (isConfigured) {
      try {
        await setDoc(doc(db, 'matches', newId), newMatchData);
      } catch (e) {
        console.error('Error writing match to Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        matches: [...prev.matches, newMatchData]
      }));
    }
  }, []);

  const updateMatch = useCallback(async (id, updates) => {
    if (isConfigured) {
      try {
        await updateDoc(doc(db, 'matches', id), updates);
      } catch (e) {
        console.error('Error updating match in Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        matches: prev.matches.map(m => m.id === id ? { ...m, ...updates } : m)
      }));
    }
  }, []);

  const addMessage = useCallback(async (author_id, text, recipient_id = null) => {
    const newId = Date.now().toString();
    const newMessageData = { 
      id: newId, 
      author_id, 
      recipient_id, 
      text, 
      timestamp: new Date().toISOString() 
    };

    if (isConfigured) {
      try {
        await setDoc(doc(db, 'messages', newId), newMessageData);
      } catch (e) {
        console.error('Error sending message to Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessageData]
      }));
    }
  }, []);

  const sendFriendRequest = useCallback(async (senderId, receiverId) => {
    if (isConfigured) {
      try {
        await updateDoc(doc(db, 'players', receiverId), {
          friendRequests: arrayUnion(senderId)
        });
      } catch (e) {
        console.error('Error sending friend request in Firestore:', e);
      }
    } else {
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
    }
  }, []);

  const acceptFriendRequest = useCallback(async (playerId, requesterId) => {
    if (isConfigured) {
      try {
        await updateDoc(doc(db, 'players', playerId), {
          friendRequests: arrayRemove(requesterId),
          friends: arrayUnion(requesterId)
        });
        await updateDoc(doc(db, 'players', requesterId), {
          friends: arrayUnion(playerId)
        });
      } catch (e) {
        console.error('Error accepting friend request in Firestore:', e);
      }
    } else {
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
    }
  }, []);

  const declineFriendRequest = useCallback(async (playerId, requesterId) => {
    if (isConfigured) {
      try {
        await updateDoc(doc(db, 'players', playerId), {
          friendRequests: arrayRemove(requesterId)
        });
      } catch (e) {
        console.error('Error declining friend request in Firestore:', e);
      }
    } else {
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
    }
  }, []);

  const deletePlayer = useCallback(async (id) => {
    if (isConfigured) {
      try {
        await deleteDoc(doc(db, 'players', id));
      } catch (e) {
        console.error('Error deleting player from Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== id)
      }));
    }
  }, []);

  const updateAdminPin = useCallback(async (newPin) => {
    if (isConfigured) {
      try {
        await setDoc(doc(db, 'settings', 'admin'), { pin: newPin });
      } catch (e) {
        console.error('Error updating admin PIN in Firestore:', e);
      }
    } else {
      setState(prev => ({ ...prev, adminPin: newPin }));
    }
  }, []);

  const resetTournament = useCallback(async () => {
    if (isConfigured) {
      try {
        const playersSnapshot = await getDocs(collection(db, 'players'));
        const playersBatch = writeBatch(db);
        playersSnapshot.forEach(docSnap => {
          playersBatch.delete(doc(db, 'players', docSnap.id));
        });
        await playersBatch.commit();

        const matchesSnapshot = await getDocs(collection(db, 'matches'));
        const matchesBatch = writeBatch(db);
        matchesSnapshot.forEach(docSnap => {
          matchesBatch.delete(doc(db, 'matches', docSnap.id));
        });
        await matchesBatch.commit();

        const messagesSnapshot = await getDocs(collection(db, 'messages'));
        const messagesBatch = writeBatch(db);
        messagesSnapshot.forEach(docSnap => {
          messagesBatch.delete(doc(db, 'messages', docSnap.id));
        });
        await messagesBatch.commit();
      } catch (e) {
        console.error('Error resetting database in Firestore:', e);
      }
    } else {
      setState(prev => ({
        ...prev,
        players: [],
        matches: [],
        messages: [],
      }));
    }
  }, []);

  const simulateTournament = useCallback(async () => {
    if (isConfigured) {
      try {
        const { players, matches } = state;
        if (players.length < 2) return;

        const newMatches = [];
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

        const batch = writeBatch(db);

        players.forEach((player) => {
          let count = matches.filter(m => 
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

            const matchData = {
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
            };

            batch.set(doc(db, 'matches', matchId), matchData);
            newMatches.push(matchData);
            count++;
          }
        });

        await batch.commit();
      } catch (e) {
        console.error('Error simulating tournament in Firestore:', e);
      }
    } else {
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
    }
  }, [state.players, state.matches]);

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
    deletePlayer,
    updateAdminPin,
    resetTournament,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

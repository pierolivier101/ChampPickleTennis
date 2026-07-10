import { useState } from 'react';
import { X, Trophy, User, Calendar, PlusCircle, MessageSquare, BookOpen, ShieldAlert } from 'lucide-react';

const GuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('welcome'); // 'welcome' | 'booking' | 'points' | 'chat'

  if (!isOpen) return null;

  const tabs = [
    { id: 'welcome', label: 'Welcome', icon: User },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'points', label: 'Points & Ranks', icon: Trophy },
    { id: 'chat', label: 'Locker Room', icon: MessageSquare },
  ];

  return (
    <div className="modal-backdrop flex justify-center items-center" style={{ zIndex: 1000 }}>
      <div 
        className="card" 
        style={{ 
          width: '95%', 
          maxWidth: '520px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          position: 'relative',
          padding: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(11, 19, 43, 0.98)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.65)'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '1.3rem', margin: 0 }} className="flex items-center gap-2">
            <BookOpen className="text-primary" size={22} />
            <span>Championship Handbook</span>
          </h2>
          <button 
            onClick={onClose} 
            className="btn btn-secondary" 
            style={{ minHeight: '32px', minWidth: '32px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1 justify-center"
                style={{
                  flex: 1,
                  background: isActive ? 'rgba(223, 255, 0, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderBottom: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
                }}
              >
                <Icon size={14} />
                <span className="hidden-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="text-left" style={{ fontSize: '0.9rem', lineHeight: '1.5', minHeight: '260px' }}>
          {activeTab === 'welcome' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <p style={{ margin: 0 }} className="text-primary font-bold">Welcome to Champion & Ace!</p>
              <p className="text-secondary" style={{ margin: 0 }}>
                This is a private, administrator-managed league. Access is restricted to registered participants to ensure high-quality tracking and fair matchups.
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }} className="mt-2">
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>1. Login PIN</strong>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Your Administrator will register your name and issue a random 4-digit PIN. Use these details to access the dashboard.</span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>2. Customize Profile</strong>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Click "Edit Profile" on the dashboard to add contact details, preferred availability, and custom bio so others can coordinate with you.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <p style={{ margin: 0 }} className="text-primary font-bold">Scheduling & Court Booking</p>
              <p className="text-secondary" style={{ margin: 0 }}>
                Organize matches at your convenience. Use the calendar tab to invite opponents to specific days and times.
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }} className="mt-2">
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>How to Book a Match:</strong>
                  <ol style={{ paddingLeft: '1.2rem', margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <li>Navigate to the <strong>Matches (Calendar)</strong> page.</li>
                    <li>Tap a date, choose an opponent, sport, time, and court.</li>
                    <li>Send the invite. The opponent will receive a alert on their home screen.</li>
                    <li>Once they click <strong>Accept</strong>, it's locked in!</li>
                  </ol>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>Calendar Export:</strong>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>You can add scheduled matches directly to Google Calendar or download an `.ics` file from the upcoming matches list.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <p style={{ margin: 0 }} className="text-primary font-bold">Ranks & Point Allocations</p>
              <p className="text-secondary" style={{ margin: 0 }}>
                Point accumulation determines your standing on the league leaderboard. Playing games consistently is key!
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }} className="mt-1">
                <div className="text-center" style={{ padding: '0.5rem', background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.2)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>+3 Points</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>For a Match Win</div>
                </div>
                <div className="text-center" style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>+1 Point</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>For a Match Loss</div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }} className="mt-1">
                <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>Automatic Submission:</strong>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                  Either player can submit scores. The system calculates points instantly. If there is a score entry error, request the admin to edit it.
                </span>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(223, 255, 0, 0.05)', borderRadius: '10px', border: '1px solid rgba(223, 255, 0, 0.1)' }} className="mt-1">
                <strong style={{ display: 'block', color: 'var(--primary-color)', marginBottom: '2px' }}>🎾 Tennis Score Rules:</strong>
                <span className="text-secondary" style={{ fontSize: '0.82rem', display: 'block', lineHeight: '1.4' }}>
                  • <strong>Best of 3 sets</strong> (first to win 2 sets wins).<br/>
                  • <strong>Sets 1 & 2</strong> are won by reaching exactly <strong>4 games</strong> (no 2-game advantage or tiebreaks, e.g. 4-3, 4-2).<br/>
                  • <strong>Set 3</strong> is played as a <strong>10-point match tiebreak</strong> (win by 2, e.g. 10-8). Leave blank if match is won in straight sets (2-0).
                </span>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255, 0, 255, 0.05)', borderRadius: '10px', border: '1px solid rgba(255, 0, 255, 0.1)' }} className="mt-1">
                <strong style={{ display: 'block', color: '#FF00FF', marginBottom: '2px' }}>🏓 Pickleball Score Rules:</strong>
                <span className="text-secondary" style={{ fontSize: '0.82rem', display: 'block', lineHeight: '1.4' }}>
                  • <strong>Best of 3 sets</strong> (first to win 2 sets wins).<br/>
                  • <strong>Sets 1 & 2</strong> are won by reaching <strong>11 points</strong> (win by 2, e.g. 11-9, 12-10).<br/>
                  • <strong>Set 3</strong> is played to <strong>11 points</strong> (win by 2) using <strong>Rally Scoring</strong> (every rally won earns a point). Leave blank if won in straight sets (2-0).
                </span>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <p style={{ margin: 0 }} className="text-primary font-bold">Banter Board & Direct Chats</p>
              <p className="text-secondary" style={{ margin: 0 }}>
                Build community, discuss court conditions, find partners, and banter in real-time.
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }} className="mt-2">
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>📢 Locker Room</strong>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>The general chat channel. Everyone in the tournament can read and contribute here.</span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '2px' }}>🔒 Direct Messages</strong>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Click a user in the user roster on the Chat screen to open a secure direct message chat. Perfect for exchanging phone numbers and agreeing on courts.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;

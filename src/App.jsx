import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './context/StoreContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Standings from './pages/Standings';
import Calendar from './pages/Calendar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import BanterBoard from './pages/BanterBoard';

function App() {
  const { currentUser } = useStore();

  return (
    <div className="app-container">
      <Routes>
        {/* Public / Unauthenticated */}
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={
            currentUser 
              ? (currentUser.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard />)
              : <Navigate to="/login" />
          } />
          
          {/* Standings is visible to all, but let's put it in layout so navigation works */}
          <Route path="/standings" element={<Standings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/board" element={<BanterBoard />} />
          
          <Route path="/admin" element={
            currentUser?.role === 'admin' ? <Admin /> : <Navigate to="/login" />
          } />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

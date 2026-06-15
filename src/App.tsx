// src/App.tsx
import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { DraftPage } from './pages/DraftPage';
import { TournamentPage } from './pages/TournamentPage';
import type { Player } from './types';

type GameState = 'home' | 'draft' | 'tournament';

function App() {
  const [currentView, setCurrentView] = useState<GameState>('home');
  const [myTeam, setMyTeam] = useState<Player[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);  

  const handleRestart = () => {
    setMyTeam([]); 
    setCurrentView('home'); 
  };

  return (
    <div className="App">
      {currentView === 'home' && <HomePage onStart={() => setCurrentView('draft')} />}
      
      {currentView === 'draft' && (
        <DraftPage 
          myTeam={myTeam} 
          setMyTeam={setMyTeam} 
          onFinishDraft={() => setCurrentView('tournament')} 
        />
      )}

      {currentView === 'tournament' && (
        <TournamentPage 
          myTeam={myTeam} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
}

export default App;
// src/pages/DraftPage.tsx
import React, { useState } from 'react';
import database from '../data/database.json';
import { PlayerCard } from '../components/PlayerCard';
import type { Team, Player, Database } from '../types';
import './DraftPage.css';

interface DraftPageProps {
  myTeam: Player[];
  setMyTeam: React.Dispatch<React.SetStateAction<Player[]>>;
  onFinishDraft: () => void;
}

export const DraftPage: React.FC<DraftPageProps> = ({ myTeam, setMyTeam, onFinishDraft }) => {
  const allTeams = (database as Database).teams;
  const [drawnTeam, setDrawnTeam] = useState<Team | null>(null);
  const [rerolls, setRerolls] = useState<number>(1);

  const getRandomTeam = () => allTeams[Math.floor(Math.random() * allTeams.length)];
  const handleDrawTeam = () => setDrawnTeam(getRandomTeam());

  const handleReroll = () => {
    if (rerolls > 0) {
      let newTeam = getRandomTeam();
      while (drawnTeam && newTeam.id === drawnTeam.id) {
        newTeam = getRandomTeam();
      }
      setDrawnTeam(newTeam);
      setRerolls(0);
    }
  };

  const handlePickPlayer = (player: Player) => {
    if (myTeam.some(p => p.id === player.id)) {
      alert("Player already in your team!");
      return;
    }
    const pickedPlayer = { ...player, team_name: drawnTeam?.name, year: drawnTeam?.year };
    setMyTeam(prev => [...prev, pickedPlayer]);
    setDrawnTeam(null);
    // REMOVIDO: setRerolls(1); - Agora o Reroll não reseta mais por rodada!
  };

  const isTeamFull = myTeam.length === 5;
  const isRoundActive = drawnTeam !== null;

  return (
    <div className="draft-wrapper">
      <div className="draft-container">
        <h1 className="draft-title">Historic Draft</h1>
        
        <section className="draft-section">
          <div className="section-header">
            <h2 className="section-title">YOUR ROSTER ({myTeam.length}/5)</h2>
            {isTeamFull && (
              <button className="btn-editorial btn-red" onClick={onFinishDraft}>
                START TOURNAMENT →
              </button>
            )}
          </div>

          <div className="card-grid">
            {myTeam.length === 0 && <p style={{ fontStyle: 'italic', color: '#666' }}>Draw your first team to start.</p>}
            {myTeam.map(player => (
              <PlayerCard key={player.id} player={player} hideAction={true} />
            ))}
          </div>
        </section>

        {!isTeamFull && (
          <section className="draft-section">
            <div className="section-header">
              <h2 className="section-title">
                {isRoundActive ? `BOARD: ${drawnTeam.name} (${drawnTeam.year})` : `ROUND ${myTeam.length + 1}`}
              </h2>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                {!isRoundActive && (
                  <button className="btn-editorial btn-black" onClick={handleDrawTeam}>DRAW TEAM</button>
                )}
                {isRoundActive && rerolls > 0 && (
                  <button className="btn-editorial btn-gold" onClick={handleReroll}>REROLL (1 LEFT)</button>
                )}
                {isRoundActive && rerolls === 0 && (
                  <span style={{ fontWeight: 'bold', color: '#e23b2d', padding: '12px 0' }}>NO REROLLS LEFT</span>
                )}
              </div>
            </div>

            <div className="card-grid" style={{ justifyContent: 'center' }}>
              {!isRoundActive && <p style={{ color: '#666' }}>Click "DRAW TEAM" to reveal the players.</p>}
              {drawnTeam && drawnTeam.roster.map(player => {
                const isAlreadyInMyTeam = myTeam.some(p => p.id === player.id);
                const displayPlayer = { ...player, team_name: drawnTeam.name, year: drawnTeam.year };
                return (
                  <PlayerCard 
                    key={player.id} 
                    player={displayPlayer} 
                    actionLabel={isAlreadyInMyTeam ? "IN TEAM" : "PICK"} 
                    onAction={handlePickPlayer} 
                    disabled={isAlreadyInMyTeam} 
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
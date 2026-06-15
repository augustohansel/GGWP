// src/components/LiveMatch.tsx
import React, { useState } from 'react';
import type { TournamentTeam, Match } from '../utils/tournamentUtils';
import type { Player } from '../types';
import './LiveMatch.css'; 

interface PlayerStats {
  k: number;
  a: number;
  d: number;
}

interface LiveMatchProps {
  matchData: Match;
  onMatchFinish: (winner: TournamentTeam, loser: TournamentTeam, score: {t1: number, t2: number}) => void;
}

// A MÁGICA DO OVERTIME: Calcula quantos pontos são necessários para vencer
const getTargetScore = (s1: number, s2: number) => {
  if (s1 >= 15 && s2 >= 15) {
    // A cada empate múltiplo de 3 (15-15, 18-18, 21-21), o alvo sobe!
    const otLevel = Math.floor((Math.min(s1, s2) - 15) / 3) + 1;
    return 15 + (otLevel * 3) + 1; // OT1=19, OT2=22, OT3=25...
  }
  return 16; // Tempo normal
};

export const LiveMatch: React.FC<LiveMatchProps> = ({ matchData, onMatchFinish }) => {
  const { team1, team2 } = matchData;
  
  const [score, setScore] = useState({ t1: 0, t2: 0 });
  
  const [stats, setStats] = useState<Record<number, PlayerStats>>(() => {
    const initialStats: Record<number, PlayerStats> = {};
    [...team1.roster, ...team2.roster].forEach(p => {
      initialStats[p.id] = { k: 0, a: 0, d: 0 };
    });
    return initialStats;
  });

  const playRound = () => {
    const currentTarget = getTargetScore(score.t1, score.t2);
    
    // Se alguém já bateu a meta atual, o jogo acabou e trava o botão
    if (score.t1 === currentTarget || score.t2 === currentTarget) return;

    const t1Weight = team1.overall + Math.floor(Math.random() * 20);
    const t2Weight = team2.overall + Math.floor(Math.random() * 20);
    const t1Wins = t1Weight >= t2Weight;

    const newScore = {
      t1: t1Wins ? score.t1 + 1 : score.t1,
      t2: !t1Wins ? score.t2 + 1 : score.t2
    };
    setScore(newScore);

    const winnerRoster = t1Wins ? team1.roster : team2.roster;
    const loserRoster = t1Wins ? team2.roster : team1.roster;

    const winnerKillsCount = Math.floor(Math.random() * 2) + 4; 
    const loserKillsCount = Math.floor(Math.random() * 4);

    const newStats = { ...stats };

    const distributeStats = (roster: Player[], kills: number, isWinner: boolean) => {
      for (let i = 0; i < kills; i++) {
        const killer = roster[Math.floor(Math.random() * roster.length)];
        newStats[killer.id] = { ...newStats[killer.id], k: newStats[killer.id].k + 1 };
        
        if (Math.random() > 0.5) {
          const assister = roster[Math.floor(Math.random() * roster.length)];
          if (assister.id !== killer.id) {
            newStats[assister.id] = { ...newStats[assister.id], a: newStats[assister.id].a + 1 };
          }
        }
      }
      
      const deathsToTake = isWinner ? loserKillsCount : winnerKillsCount;
      for (let i = 0; i < deathsToTake; i++) {
        const victim = roster[Math.floor(Math.random() * roster.length)];
        newStats[victim.id] = { ...newStats[victim.id], d: newStats[victim.id].d + 1 };
      }
    };

    distributeStats(winnerRoster, winnerKillsCount, true);
    distributeStats(loserRoster, loserKillsCount, false);
    
    setStats(newStats);

    // Usa a mesma função para verificar se ALGUÉM BATEU A META APÓS O ROUND
    const newTarget = getTargetScore(newScore.t1, newScore.t2);
    if (newScore.t1 === newTarget || newScore.t2 === newTarget) {
      const winner = newScore.t1 === newTarget ? team1 : team2;
      const loser = newScore.t1 === newTarget ? team2 : team1;
      onMatchFinish(winner, loser, newScore);
    }
  };

  const renderTeamTAB = (team: TournamentTeam) => (
    <div className="tab-team">
      <h3 style={{ color: team.isUser ? '#e23b2d' : '#111' }}>
        {team.name}
      </h3>
      <table className="tab-table">
        <thead>
          <tr>
            <th>PLAYER</th>
            <th>K</th>
            <th>A</th>
            <th>D</th>
          </tr>
        </thead>
        <tbody>
          {[...team.roster].sort((a, b) => stats[b.id].k - stats[a.id].k).map(player => (
            <tr key={player.id}>
              <td>
                {player.nickname} <span style={{ fontSize: '10px', color: '#888' }}>({player.overall})</span>
              </td>
              <td className="stat-k">{stats[player.id].k}</td>
              <td>{stats[player.id].a}</td>
              <td className="stat-d">{stats[player.id].d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const currentTarget = getTargetScore(score.t1, score.t2);
  const matchFinished = score.t1 === currentTarget || score.t2 === currentTarget;
  
  // Controle de Interface (Aviso de OT)
  const isOT = score.t1 >= 15 && score.t2 >= 15;
  const otLevel = isOT ? Math.floor((Math.min(score.t1, score.t2) - 15) / 3) + 1 : 0;
  const matchStatusText = matchFinished ? "MATCH OVER!" : (isOT ? `OVERTIME ${otLevel}` : "Match in Progress");

  return (
    <div className="live-match-board">
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Anton', textTransform: 'uppercase', margin: 0, color: isOT && !matchFinished ? '#e23b2d' : '#888', letterSpacing: '1px' }}>
          {matchStatusText}
        </h2>
        
        <div className="score-display">
          <h1 className="score-number" style={{ color: team1.isUser ? '#e23b2d' : '#111' }}>
            {score.t1}
          </h1>
          <span className="score-divider">-</span>
          <h1 className="score-number" style={{ color: team2.isUser ? '#e23b2d' : '#111' }}>
            {score.t2}
          </h1>
        </div>
        
        {!matchFinished && (
           <button className={`btn-editorial ${isOT ? 'btn-black' : 'btn-red'}`} onClick={playRound}>
             {isOT ? 'PLAY OT ROUND' : 'PLAY NEXT ROUND'}
           </button>
        )}
      </div>

      <div className="tab-tables">
        {renderTeamTAB(team1)}
        {renderTeamTAB(team2)}
      </div>
      
    </div>
  );
};
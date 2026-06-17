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

const getTargetScore = (s1: number, s2: number) => {
  if (s1 >= 15 && s2 >= 15) {
    const otLevel = Math.floor((Math.min(s1, s2) - 15) / 3) + 1;
    return 15 + (otLevel * 3) + 1; 
  }
  return 16; 
};

export const LiveMatch: React.FC<LiveMatchProps> = ({ matchData, onMatchFinish }) => {
  const { team1, team2 } = matchData;
  const [score, setScore] = useState({ t1: 0, t2: 0 });
  const [roundHistory, setRoundHistory] = useState<('t1' | 't2')[]>([]);
  const [lastRoundDiffs, setLastRoundDiffs] = useState<Record<string | number, PlayerStats>>({});
  
  const [stats, setStats] = useState<Record<string | number, PlayerStats>>(() => {
    const initialStats: Record<string | number, PlayerStats> = {};
    [...team1.roster, ...team2.roster].forEach(p => {
      initialStats[p.id] = { k: 0, a: 0, d: 0 };
    });
    return initialStats;
  });

  const playRound = () => {
    const currentTarget = getTargetScore(score.t1, score.t2);
    if (score.t1 === currentTarget || score.t2 === currentTarget) return;

    const t1Weight = team1.overall + Math.floor(Math.random() * 35);
    const t2Weight = team2.overall + Math.floor(Math.random() * 35);
    const t1Wins = t1Weight >= t2Weight;

    const newScore = {
      t1: t1Wins ? score.t1 + 1 : score.t1,
      t2: !t1Wins ? score.t2 + 1 : score.t2
    };
    setScore(newScore);
    setRoundHistory(prev => [...prev, t1Wins ? 't1' : 't2']);

    const winnerRoster = t1Wins ? team1.roster : team2.roster;
    const loserRoster = t1Wins ? team2.roster : team1.roster;

    const winnerKillsCount = Math.floor(Math.random() * 2) + 4; // 4 ou 5
    const loserKillsCount = Math.floor(Math.random() * 5); // 0 a 4

    const newStats: Record<string | number, PlayerStats> = {};
    Object.keys(stats).forEach(id => newStats[id] = { ...stats[id] });

    const currentDiffs: Record<string | number, PlayerStats> = {};
    Object.keys(stats).forEach(id => currentDiffs[id] = { k: 0, a: 0, d: 0 });

    // 1. SORTEAR VÍTIMAS ÚNICAS
    const loserVictims = [...loserRoster].sort(() => 0.5 - Math.random()).slice(0, winnerKillsCount);
    loserVictims.forEach(v => { newStats[v.id].d++; currentDiffs[v.id].d++; });

    const winnerVictims = [...winnerRoster].sort(() => 0.5 - Math.random()).slice(0, loserKillsCount);
    winnerVictims.forEach(v => { newStats[v.id].d++; currentDiffs[v.id].d++; });

    // 2. DISTRIBUIR KILLS/ASSISTS
    const distributeKills = (roster: Player[], kills: number) => {
      for (let i = 0; i < kills; i++) {
        const killer = roster[Math.floor(Math.random() * roster.length)];
        newStats[killer.id].k++;
        currentDiffs[killer.id].k++;
        if (Math.random() > 0.5) {
          const assister = roster[Math.floor(Math.random() * roster.length)];
          if (assister.id !== killer.id) { newStats[assister.id].a++; currentDiffs[assister.id].a++; }
        }
      }
    };
    distributeKills(winnerRoster, winnerKillsCount);
    distributeKills(loserRoster, loserKillsCount);
    
    setStats(newStats);
    setLastRoundDiffs(currentDiffs);

    if (newScore.t1 === currentTarget || newScore.t2 === currentTarget) {
      onMatchFinish(newScore.t1 === currentTarget ? team1 : team2, newScore.t1 === currentTarget ? team2 : team1, newScore);
    }
  };

  const renderTeamTAB = (team: TournamentTeam) => {
    const getKillDiffClass = (k: number) => {
      if (k === 5) return 'diff-ace';
      if (k === 4) return 'diff-quad';
      if (k === 3) return 'diff-triple';
      if (k === 2) return 'diff-double';
      return '';
    };

    return (
      <div className="tab-team">
        <h3 style={{ color: team.isUser ? '#e23b2d' : '#111' }}>{team.name}</h3>
        <table className="tab-table">
          <thead><tr><th style={{textAlign:'left'}}>PLAYER</th><th>K</th><th>A</th><th>D</th></tr></thead>
          <tbody>
            {[...team.roster].sort((a, b) => stats[b.id].k - stats[a.id].k).map(player => {
              const diffs = lastRoundDiffs[player.id];
              return (
                <tr key={player.id}>
                  <td style={{textAlign:'left'}}>{player.nickname} <span style={{fontSize:'10px', color:'#888'}}>({player.overall})</span></td>
                  <td className="stat-k">
                    <div className="stat-wrapper">{stats[player.id].k}{diffs?.k > 0 && <span className={`stat-diff ${getKillDiffClass(diffs.k)}`}>+{diffs.k} {diffs.k === 5 ? 'ACE!' : ''}</span>}</div>
                  </td>
                  <td><div className="stat-wrapper">{stats[player.id].a}{diffs?.a > 0 && <span className="stat-diff">+{diffs.a}</span>}</div></td>
                  <td className="stat-d"><div className="stat-wrapper">{stats[player.id].d}{diffs?.d > 0 && <span className="stat-diff diff-d">+{diffs.d}</span>}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const matchFinished = score.t1 === getTargetScore(score.t1, score.t2) || score.t2 === getTargetScore(score.t1, score.t2);
  const t1Color = team1.isUser ? '#e23b2d' : '#111';
  const t2Color = team2.isUser ? '#e23b2d' : '#111';

  return (
    <div className="live-match-board">
      <div style={{ textAlign: 'center' }}>
        <div className="score-display">
          <h1 className="score-number" style={{ color: t1Color }}>{score.t1}</h1>
          <span className="score-divider">-</span>
          <h1 className="score-number" style={{ color: t2Color }}>{score.t2}</h1>
        </div>
        <div className="round-history">
          {roundHistory.map((winner, idx) => <div key={idx} className="history-dot" style={{ background: winner === 't1' ? t1Color : t2Color }} />)}
        </div>
        {!matchFinished && <button className="btn-editorial btn-red" onClick={playRound}>PLAY NEXT ROUND</button>}
      </div>
      <div className="tab-tables">{renderTeamTAB(team1)}{renderTeamTAB(team2)}</div>
    </div>
  );
};
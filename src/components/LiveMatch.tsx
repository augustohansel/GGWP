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

    // --- 1. O MOTOR DE DESEMPENHO INDIVIDUAL ---
    // Puxa o bônus de Química da equipe (OVR do time - Média dos jogadores)
    const t1BaseAvg = team1.roster.reduce((sum, p) => sum + p.overall, 0) / team1.roster.length;
    const t1ChemBonus = team1.overall - t1BaseAvg;

    const t2BaseAvg = team2.roster.reduce((sum, p) => sum + p.overall, 0) / team2.roster.length;
    const t2ChemBonus = team2.overall - t2BaseAvg;

    // Cada jogador rola os seus próprios dados de partida (OVR + Fator Sorte)
    const t1Performances = team1.roster.map(p => ({ player: p, score: p.overall + Math.floor(Math.random() * 40) }));
    const t2Performances = team2.roster.map(p => ({ player: p, score: p.overall + Math.floor(Math.random() * 40) }));

    // A vitória do round é a SOMA do esforço individual + Química
    const t1Weight = t1Performances.reduce((sum, p) => sum + p.score, 0) + (t1ChemBonus * 5);
    const t2Weight = t2Performances.reduce((sum, p) => sum + p.score, 0) + (t2ChemBonus * 5);

    const t1Wins = t1Weight >= t2Weight;

    const newScore = {
      t1: t1Wins ? score.t1 + 1 : score.t1,
      t2: !t1Wins ? score.t2 + 1 : score.t2
    };
    setScore(newScore);
    setRoundHistory(prev => [...prev, t1Wins ? 't1' : 't2']);

    const winnerPerformances = t1Wins ? t1Performances : t2Performances;
    const loserPerformances = t1Wins ? t2Performances : t1Performances;

    const winnerKillsCount = Math.floor(Math.random() * 2) + 4; // Vencedor mata 4 ou 5
    const loserKillsCount = Math.floor(Math.random() * 5); // Perdedor mata de 0 a 4

    const newStats: Record<string | number, PlayerStats> = {};
    Object.keys(stats).forEach(id => newStats[id] = { ...stats[id] });

    const currentDiffs: Record<string | number, PlayerStats> = {};
    Object.keys(stats).forEach(id => currentDiffs[id] = { k: 0, a: 0, d: 0 });

    // --- 2. QUEM MORRE? (Os piores do round tomam o tiro) ---
    // Ordenamos os jogadores do pior score para o melhor
    const sortedLosers = [...loserPerformances].sort((a, b) => a.score - b.score);
    const loserVictims = sortedLosers.slice(0, winnerKillsCount).map(p => p.player);
    loserVictims.forEach(v => { newStats[v.id].d++; currentDiffs[v.id].d++; });

    const sortedWinners = [...winnerPerformances].sort((a, b) => a.score - b.score);
    const winnerVictims = sortedWinners.slice(0, loserKillsCount).map(p => p.player);
    winnerVictims.forEach(v => { newStats[v.id].d++; currentDiffs[v.id].d++; });

    // --- 3. QUEM MATA? (Sorteio ponderado para os melhores) ---
    const distributeKills = (performances: {player: Player, score: number}[], kills: number) => {
      for (let i = 0; i < kills; i++) {
        // Quem tem o maior Score domina o sorteio (Elevado ao quadrado para dar mais peso aos craques)
        const totalWeight = performances.reduce((sum, p) => sum + Math.pow(p.score, 2), 0);
        let rand = Math.random() * totalWeight;
        let killer = performances[0].player;
        
        for (const p of performances) {
          if (rand < Math.pow(p.score, 2)) {
            killer = p.player;
            break;
          }
          rand -= Math.pow(p.score, 2);
        }

        newStats[killer.id].k++;
        currentDiffs[killer.id].k++;

        // Sorteio das Assistências
        if (Math.random() > 0.5) {
          const possibleAssisters = performances.filter(p => p.player.id !== killer.id);
          if (possibleAssisters.length > 0) {
            const assistWeight = possibleAssisters.reduce((sum, p) => sum + Math.pow(p.score, 2), 0);
            let aRand = Math.random() * assistWeight;
            let assister = possibleAssisters[0].player;
            for (const p of possibleAssisters) {
              if (aRand < Math.pow(p.score, 2)) {
                assister = p.player;
                break;
              }
              aRand -= Math.pow(p.score, 2);
            }
            newStats[assister.id].a++;
            currentDiffs[assister.id].a++;
          }
        }
      }
    };

    distributeKills(winnerPerformances, winnerKillsCount);
    distributeKills(loserPerformances, loserKillsCount);
    
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

  const currentTarget = getTargetScore(score.t1, score.t2);
  const matchFinished = score.t1 === currentTarget || score.t2 === currentTarget;
  
  const isOT = score.t1 >= 15 && score.t2 >= 15;
  const otLevel = isOT ? Math.floor((Math.min(score.t1, score.t2) - 15) / 3) + 1 : 0;
  const matchStatusText = matchFinished ? "MATCH OVER!" : (isOT ? `OVERTIME ${otLevel}` : "Match in Progress");

  const t1Color = team1.isUser ? '#e23b2d' : '#111';
  const t2Color = team2.isUser ? '#e23b2d' : '#111';

  return (
    <div className="live-match-board">
      <div style={{ textAlign: 'center' }}>
        
        <h2 style={{ fontFamily: 'Anton', textTransform: 'uppercase', margin: 0, color: isOT && !matchFinished ? '#e23b2d' : '#888', letterSpacing: '1px' }}>
          {matchStatusText}
        </h2>
        
        <div className="score-display">
          <h1 className="score-number" style={{ color: t1Color }}>{score.t1}</h1>
          <span className="score-divider">-</span>
          <h1 className="score-number" style={{ color: t2Color }}>{score.t2}</h1>
        </div>
        
        <div className="round-history">
          {roundHistory.map((winner, idx) => (
            <div key={idx} className="history-dot" style={{ background: winner === 't1' ? t1Color : t2Color }} title={`Round ${idx + 1}`} />
          ))}
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
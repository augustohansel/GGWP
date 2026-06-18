// src/pages/TournamentPage.tsx
import React, { useState, useEffect } from 'react';
import database from '../data/database.json';
import type { Player, Database } from '../types';
import { calculateTeamOverall, type Match, type TournamentTeam } from '../utils/tournamentUtils';
import { LiveMatch } from '../components/LiveMatch';
import { PlayerCard } from '../components/PlayerCard'; 
import './TournamentPage.css';

interface TournamentPageProps {
  myTeam: Player[];
  onRestart: () => void;
}

// Time Fantasma para preencher as chaves futuras da árvore
const TBD_TEAM: TournamentTeam = { id: 'tbd', name: 'TBD', isUser: false, overall: 0, roster: [] };

export const TournamentPage: React.FC<TournamentPageProps> = ({ myTeam, onRestart }) => {
  // Agora salvamos TODAS as rodadas de uma vez na Árvore
  const [rounds, setRounds] = useState<Match[][]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [champion, setChampion] = useState<TournamentTeam | null>(null);
  const [activeUserMatch, setActiveUserMatch] = useState<Match | null>(null);

  const roundNames = ["ROUND OF 16", "QUARTERFINALS", "SEMIFINALS", "GRAND FINAL"];
  const roundName = roundNames[currentRoundIndex];

  useEffect(() => {
    const userStats = calculateTeamOverall(myTeam);
    const userTeam: TournamentTeam = { 
      id: 'user', name: 'YOUR DREAM TEAM', isUser: true, overall: userStats.overall, roster: myTeam, chemistryBreakdown: userStats.breakdown 
    };
    
    const allDBTeams = (database as Database).teams;
    const shuffledDB = [...allDBTeams].sort(() => 0.5 - Math.random());
    
    const enemyTeams: TournamentTeam[] = shuffledDB.slice(0, 15).map(team => {
      const enemyStats = calculateTeamOverall(team.roster);
      return { id: String(team.id), name: `${team.name} (${team.year})`, isUser: false, overall: enemyStats.overall, roster: team.roster };
    });

    const tournamentTeams = [userTeam, ...enemyTeams].sort(() => 0.5 - Math.random());
    
    // Geração Inicial da Árvore Completa
    const r1: Match[] = [];
    for (let i = 0; i < tournamentTeams.length; i += 2) {
      r1.push({ id: `r1-${i}`, team1: tournamentTeams[i], team2: tournamentTeams[i + 1] });
    }
    
    const r2: Match[] = Array(4).fill(null).map((_, i) => ({ id: `r2-${i}`, team1: TBD_TEAM, team2: TBD_TEAM }));
    const r3: Match[] = Array(2).fill(null).map((_, i) => ({ id: `r3-${i}`, team1: TBD_TEAM, team2: TBD_TEAM }));
    const r4: Match[] = Array(1).fill(null).map((_, i) => ({ id: `r4-${i}`, team1: TBD_TEAM, team2: TBD_TEAM }));

    setRounds([r1, r2, r3, r4]);
  }, [myTeam]);

  const handlePlayUserMatch = (match: Match) => {
    setActiveUserMatch(match);
  };

  const handleMatchFinish = (winner: TournamentTeam, loser: TournamentTeam, score: {t1: number, t2: number}) => {
    setRounds(prev => {
      const newRounds = [...prev];
      const currentMatches = [...newRounds[currentRoundIndex]];

      const updatedMatches = currentMatches.map(m => {
        if (m.id === activeUserMatch?.id) return { ...m, winner, loser, score };
        return m;
      });

      // Simula as partidas dos Bots
      newRounds[currentRoundIndex] = updatedMatches.map(m => {
        if (m.winner || m.team1.id === 'tbd' || m.team2.id === 'tbd') return m; 
        const t1Wins = m.team1.overall + Math.random() * 35 >= m.team2.overall + Math.random() * 35;
        return { 
          ...m, 
          winner: t1Wins ? m.team1 : m.team2, 
          loser: t1Wins ? m.team2 : m.team1,
          score: { t1: t1Wins ? 16 : 8, t2: t1Wins ? 8 : 16 } 
        };
      });

      return newRounds;
    });
    
    if (loser.isUser) setIsGameOver(true);
    if (activeUserMatch) setActiveUserMatch({ ...activeUserMatch, winner, loser, score });
  };

  const handleNextPhase = () => {
    setRounds(prev => {
      const newRounds = [...prev];
      const winners = newRounds[currentRoundIndex].map(m => m.winner as TournamentTeam);
      
      if (currentRoundIndex === 3) {
        setChampion(winners[0]);
        return prev;
      }

      const nextRoundIdx = currentRoundIndex + 1;
      const nextMatches = [...newRounds[nextRoundIdx]];

      // Joga os vencedores para a chave da próxima fase
      for (let i = 0; i < winners.length; i += 2) {
        nextMatches[i/2] = { ...nextMatches[i/2], team1: winners[i], team2: winners[i+1] };
      }
      
      newRounds[nextRoundIdx] = nextMatches;
      return newRounds;
    });

    if (currentRoundIndex < 3) setCurrentRoundIndex(prev => prev + 1);
  };

  // --- TELAS DE ESTADO (Campeão e Partida ao Vivo) continuam iguais ---
  if (champion) {
    return (
      <div className="tournament-wrapper">
        <div className="tournament-container" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <h1 className="bracket-title" style={{ color: '#cda252', fontSize: '80px', marginBottom: '10px' }}>CHAMPION!</h1>
          <h2 style={{ fontSize: '40px', fontFamily: 'Anton', textTransform: 'uppercase', margin: 0, marginBottom: '20px' }}>{champion.name}</h2>
          <div className="card-grid" style={{ justifyContent: 'center', marginBottom: '50px' }}>
            {champion.roster.map(player => <PlayerCard key={player.id} player={player} hideAction={true} />)}
          </div>
          <button className="btn-editorial btn-black" onClick={onRestart}>PLAY AGAIN</button>
        </div>
      </div>
    );
  }

  if (activeUserMatch) {
    const matchFinished = activeUserMatch.winner !== undefined;
    return (
      <div className="tournament-wrapper">
        <div className="tournament-container">
          <LiveMatch matchData={activeUserMatch} onMatchFinish={handleMatchFinish} />
          {matchFinished && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button className="btn-editorial btn-black" onClick={() => setActiveUserMatch(null)}>BACK TO BRACKET →</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se os rounds ainda não carregaram
  if (rounds.length === 0) return null;

  const currentRoundMatches = rounds[currentRoundIndex];
  const userMatch = currentRoundMatches?.find(m => m.team1.isUser || m.team2.isUser);
  const myTournamentTeam = userMatch?.team1.isUser ? userMatch.team1 : userMatch?.team2.isUser ? userMatch.team2 : null;
  const phaseCompleted = currentRoundMatches?.every(m => m.winner !== undefined);

// --- TELA DA ÁRVORE DE CHAVEAMENTO ---
  return (
    <div className="tournament-wrapper">
      <div className="tournament-container">
        
        {/* Painel de Química NOVO DESIGN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <h1 className="bracket-title" style={{ margin: 0 }}>{roundName}</h1>
          
          {myTournamentTeam && !isGameOver && (
            <div className="chemistry-panel">
              {/* O Quadro Vermelho do OVR */}
              <div className="chemistry-ovr-box">
                <span className="chemistry-ovr-label">TEAM OVR</span>
                <span className="chemistry-ovr-value">{myTournamentTeam.overall}</span>
              </div>
              
              {/* A Lista de Status */}
              <div className="chemistry-details">
                <h3 className="chemistry-title">CHEMISTRY REPORT</h3>
                <div className="chemistry-list">
                  
                  {myTournamentTeam.chemistryBreakdown?.map((item, i) => {
                    const isPositive = item.startsWith('+');
                    // Separa o número (ex: "+5") do texto (ex: "Perfect Comms")
                    const [value, ...textParts] = item.split(':');
                    const text = textParts.join(':').trim();
                    
                    return (
                      <div key={i} className="chemistry-item">
                        <span className={`chemistry-badge ${isPositive ? 'positive' : 'negative'}`}>
                          {value}
                        </span>
                        {text}
                      </div>
                    );
                  })}

                  {myTournamentTeam.chemistryBreakdown?.length === 0 && (
                    <div className="chemistry-item" style={{ color: '#888' }}>
                      No chemistry bonuses applied.
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>

        {isGameOver && (
          <div style={{ textAlign: 'center', background: '#111', color: '#e23b2d', padding: '15px', border: '4px solid #e23b2d', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Anton', fontSize: '30px', margin: 0 }}>ELIMINATED</h2>
          </div>
        )}

        {/* --- CABEÇALHO DAS FASES (Tirado de dentro da coluna para não esmagar os slots) --- */}
        <div className="bracket-labels">
          {rounds.map((_, rIndex) => (
            <div key={`label-${rIndex}`} className="bracket-label-wrapper">
              <div className="bracket-col-label">{roundNames[rIndex]}</div>
            </div>
          ))}
        </div>

        {/* --- A ÁRVORE VISUAL (BRACKET BOARD) --- */}
        <div className="bracket-board">
          {rounds.map((roundMatches, rIndex) => (
            <div key={`col-${rIndex}`} className="bracket-col">

              {roundMatches.map((match, mIndex) => {
                const isUserInvolved = match.team1.isUser || match.team2.isUser;
                const hasWinner = match.winner !== undefined;
                const isDecided = rIndex === rounds.length - 1 && hasWinner;
                const slotPosition = mIndex % 2 === 0 ? 'slot-top' : 'slot-bottom';

                // Helpers de estilo
                const getTeamClass = (team: TournamentTeam) => {
                  if (team.id === 'tbd') return 'tbd-team';
                  let cls = team.isUser ? 'user-team ' : '';
                  if (hasWinner) cls += match.winner?.id === team.id ? 'winner' : 'loser';
                  return cls;
                };

                return (
                  <div key={match.id} className={`bracket-slot ${slotPosition} ${isUserInvolved ? 'user-slot' : ''}`}>
                    <div className={`bracket-node ${isUserInvolved ? 'user-node' : ''} ${isDecided ? 'is-decided' : ''}`}>
                      <span className="bracket-match-no">M{mIndex + 1}</span>

                      <div className={`bracket-team ${getTeamClass(match.team1)}`}>
                        <div className="bracket-team-info">
                          <span className="bracket-team-name">{match.team1.name}</span>
                          {match.team1.id !== 'tbd' && <span className="bracket-team-ovr">({match.team1.overall})</span>}
                        </div>
                        <div className="bracket-score">{match.score ? match.score.t1 : '-'}</div>
                      </div>

                      <div className="bracket-divider"></div>

                      <div className={`bracket-team ${getTeamClass(match.team2)}`}>
                        <div className="bracket-team-info">
                          <span className="bracket-team-name">{match.team2.name}</span>
                          {match.team2.id !== 'tbd' && <span className="bracket-team-ovr">({match.team2.overall})</span>}
                        </div>
                        <div className="bracket-score">{match.score ? match.score.t2 : '-'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          {!phaseCompleted && userMatch && !isGameOver && !userMatch.winner && (
            <button className="btn-editorial btn-red" onClick={() => handlePlayUserMatch(userMatch)}>PLAY MY MATCH</button>
          )}

          {phaseCompleted && !isGameOver && (
            <button className="btn-editorial btn-black" onClick={handleNextPhase}>
              {currentRoundIndex === 0 && "ADVANCE TO QUARTERFINALS →"}
              {currentRoundIndex === 1 && "ADVANCE TO SEMIFINALS →"}
              {currentRoundIndex === 2 && "ADVANCE TO GRAND FINAL →"}
              {currentRoundIndex === 3 && "LIFT THE TROPHY 🏆"}
            </button>
          )}

          {isGameOver && (
            <button className="btn-editorial btn-red" onClick={onRestart}>START NEW DRAFT</button>
          )}
        </div>
      </div>
    </div>
  );
};
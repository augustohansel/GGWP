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

const TBD_TEAM: TournamentTeam = { id: 'tbd', name: 'TBD', isUser: false, overall: 0, roster: [] };

export const TournamentPage: React.FC<TournamentPageProps> = ({ myTeam, onRestart }) => {
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
    
    // 1. FILTRO ANTI-CLONE: Remove organizações repetidas do banco (ex: Duas NAVIs)
    const uniqueTeamsMap = new Map<string, typeof allDBTeams[0]>();
    allDBTeams.forEach(team => {
      // Usamos apenas o nome (ex: "NAVI") para garantir organizações únicas
      uniqueTeamsMap.set(team.name.toUpperCase(), team); 
    });
    const uniqueDBTeams = Array.from(uniqueTeamsMap.values());

    // 2. EMBARALHAMENTO REAL (Fisher-Yates Shuffle)
    for (let i = uniqueDBTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueDBTeams[i], uniqueDBTeams[j]] = [uniqueDBTeams[j], uniqueDBTeams[i]];
    }

    // Prevenção: Se o banco de dados ficar com menos de 15 times únicos após o filtro,
    // ele duplica alguns garantindo que a página não quebre.
    while (uniqueDBTeams.length < 15) {
      uniqueDBTeams.push({
        ...uniqueDBTeams[0], 
        id: uniqueDBTeams.length + 999, 
        name: `${uniqueDBTeams[0].name} B`
      });
    }
    
    const enemyTeams: TournamentTeam[] = uniqueDBTeams.slice(0, 15).map(team => {
      // Em vez de usar o calculateTeamOverall (que dá os bônus de química),
      // nós calculamos apenas a Média Pura dos 5 jogadores da máquina.
      const pureAverage = Math.round(team.roster.reduce((sum, p) => sum + p.overall, 0) / team.roster.length);
      
      return { 
        id: String(team.id), 
        name: `${team.name} (${team.year})`, 
        isUser: false, 
        overall: pureAverage, 
        roster: team.roster 
      };
    });
    const tournamentTeams = [userTeam, ...enemyTeams];
    
    // Embaralha a chave do torneio para a sua equipe cair numa posição aleatória
    for (let i = tournamentTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tournamentTeams[i], tournamentTeams[j]] = [tournamentTeams[j], tournamentTeams[i]];
    }
    
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

      for (let i = 0; i < winners.length; i += 2) {
        nextMatches[i/2] = { ...nextMatches[i/2], team1: winners[i], team2: winners[i+1] };
      }
      
      newRounds[nextRoundIdx] = nextMatches;
      return newRounds;
    });

    if (currentRoundIndex < 3) setCurrentRoundIndex(prev => prev + 1);
  };

  // --- TELA 1: CAMPEÃO ---
  if (champion) {
    // LÓGICA NOVA: Calcula o caminho para a glória vasculhando a árvore do torneio
    const championPath = rounds.reduce((acc, roundMatches, rIdx) => {
      // Procura a partida desta fase onde o campeão jogou e ganhou
      const match = roundMatches.find(m => m.winner?.id === champion.id);
      
      if (match && match.loser && match.score) {
        // Identifica qual pontuação é a do campeão e qual é a do perdedor
        const champScore = match.team1.id === champion.id ? match.score.t1 : match.score.t2;
        const loserScore = match.team1.id === champion.id ? match.score.t2 : match.score.t1;
        
        acc.push({
          phase: roundNames[rIdx],
          loserName: match.loser.name,
          loserOvr: match.loser.overall,
          score: `${champScore} - ${loserScore}`
        });
      }
      return acc;
    }, [] as { phase: string, loserName: string, loserOvr: number, score: string }[]);

    return (
      <div className="tournament-wrapper">
        <div className="tournament-container" style={{ textAlign: 'center', paddingTop: '20px' }}>
          
          <div className="champion-banner">
            <span className="trophy-icon">🏆</span>
            <h1 className="bracket-title" style={{ color: '#cda252', fontSize: '90px', margin: '0' }}>
              CHAMPION
            </h1>
            <h2 style={{ fontSize: '50px', fontFamily: 'Anton', textTransform: 'uppercase', margin: '10px 0 0 0', color: '#fff', textShadow: '4px 4px 0 #111' }}>
              {champion.name}
            </h2>
          </div>
          
          {champion.isUser ? (
            <p className="champion-msg user-won">HISTORY HAS BEEN MADE! YOUR DREAM TEAM DOMINATED THE MAJOR!</p>
          ) : (
            <p className="champion-msg ai-won">THE AI TOOK THE TROPHY THIS TIME... BETTER LUCK NEXT DRAFT!</p>
          )}

          {/* O NOVO PAINEL DE CAMPANHA (PATH TO GLORY) */}
          {championPath.length > 0 && (
            <div className="path-to-glory">
              <h3 className="path-title">PATH TO GLORY</h3>
              <div className="path-list">
                {championPath.map((step, idx) => (
                  <div key={idx} className="path-item">
                    <span className="path-phase">{step.phase}</span>
                    <span className="path-enemy">
                      {step.loserName} <span style={{color: '#888', fontSize: '11px'}}>({step.loserOvr} OVR)</span>
                    </span>
                    <span className="path-score">{step.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-grid" style={{ justifyContent: 'center', marginBottom: '60px', marginTop: '20px' }}>
            {champion.roster.map(player => (
              <PlayerCard key={player.id} player={player} hideAction={true} />
            ))}
          </div>

          <button className="btn-editorial btn-red" style={{ fontSize: '24px', padding: '15px 40px' }} onClick={onRestart}>
            START NEW DRAFT
          </button>
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

  if (rounds.length === 0) return null;

  const currentRoundMatches = rounds[currentRoundIndex];
  const userMatch = currentRoundMatches?.find(m => m.team1.isUser || m.team2.isUser);
  const myTournamentTeam = userMatch?.team1.isUser ? userMatch.team1 : userMatch?.team2.isUser ? userMatch.team2 : null;
  const phaseCompleted = currentRoundMatches?.every(m => m.winner !== undefined);

  return (
    <div className="tournament-wrapper">
      <div className="tournament-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <h1 className="bracket-title" style={{ margin: 0 }}>{roundName}</h1>
          
          {myTournamentTeam && !isGameOver && (
            <div className="chemistry-panel">
              <div className="chemistry-ovr-box">
                <span className="chemistry-ovr-label">TEAM OVR</span>
                <span className="chemistry-ovr-value">{myTournamentTeam.overall}</span>
              </div>
              
              <div className="chemistry-details">
                <h3 className="chemistry-title">CHEMISTRY REPORT</h3>
                <div className="chemistry-list">
                  {myTournamentTeam.chemistryBreakdown?.map((item, i) => {
                    const isPositive = item.startsWith('+');
                    const [value, ...textParts] = item.split(':');
                    const text = textParts.join(':').trim();
                    return (
                      <div key={i} className="chemistry-item">
                        <span className={`chemistry-badge ${isPositive ? 'positive' : 'negative'}`}>{value}</span>
                        {text}
                      </div>
                    );
                  })}
                  {myTournamentTeam.chemistryBreakdown?.length === 0 && (
                    <div className="chemistry-item" style={{ color: '#888' }}>No chemistry bonuses applied.</div>
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

        <div className="bracket-labels">
          {rounds.map((_, rIndex) => (
            <div key={`label-${rIndex}`} className="bracket-label-wrapper">
              <div className="bracket-col-label">{roundNames[rIndex]}</div>
            </div>
          ))}
        </div>

        <div className="bracket-board">
          {rounds.map((roundMatches, rIndex) => (
            <div key={`col-${rIndex}`} className="bracket-col">

              {roundMatches.map((match, mIndex) => {
                const isUserInvolved = match.team1.isUser || match.team2.isUser;
                const hasWinner = match.winner !== undefined;
                const isDecided = rIndex === rounds.length - 1 && hasWinner;
                const slotPosition = mIndex % 2 === 0 ? 'slot-top' : 'slot-bottom';

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
// src/pages/TournamentPage.tsx
import React, { useState, useEffect } from 'react';
import database from '../data/database.json';
import type { Player, Database } from '../types';
import { calculateUserTeamOverall, calculateDBTeamOverall, type Match, type TournamentTeam } from '../utils/tournamentUtils';
import { LiveMatch } from '../components/LiveMatch';
import { PlayerCard } from '../components/PlayerCard'; 
import './TournamentPage.css';

interface TournamentPageProps {
  myTeam: Player[];
  onRestart: () => void;
}

export const TournamentPage: React.FC<TournamentPageProps> = ({ myTeam, onRestart }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [roundName, setRoundName] = useState<string>("ROUND OF 16");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [champion, setChampion] = useState<TournamentTeam | null>(null);
  
  const [activeUserMatch, setActiveUserMatch] = useState<Match | null>(null);

  useEffect(() => {
    const userTeam: TournamentTeam = { id: 'user', name: 'YOUR DREAM TEAM', isUser: true, overall: calculateUserTeamOverall(myTeam), roster: myTeam };
    const allDBTeams = (database as Database).teams;
    const shuffledDB = [...allDBTeams].sort(() => 0.5 - Math.random());
    
    const enemyTeams: TournamentTeam[] = shuffledDB.slice(0, 15).map(team => ({
      id: team.id,
      name: `${team.name} (${team.year})`,
      isUser: false,
      overall: calculateDBTeamOverall(team),
      roster: team.roster 
    }));

    const tournamentTeams = [userTeam, ...enemyTeams].sort(() => 0.5 - Math.random());
    const initialMatches: Match[] = [];
    for (let i = 0; i < tournamentTeams.length; i += 2) {
      initialMatches.push({ id: `match-${i}`, team1: tournamentTeams[i], team2: tournamentTeams[i + 1] });
    }
    setMatches(initialMatches);
  }, [myTeam]);

  const handlePlayUserMatch = (match: Match) => {
    setActiveUserMatch(match);
  };

  const handleMatchFinish = (winner: TournamentTeam, loser: TournamentTeam, score: {t1: number, t2: number}) => {
    setMatches(prevMatches => {
      const updatedMatches = prevMatches.map(m => {
        if (m.id === activeUserMatch?.id) {
          return { ...m, winner, loser, score };
        }
        return m;
      });

      return updatedMatches.map(m => {
        if (m.winner) return m; 
        const t1Wins = m.team1.overall + Math.random() * 10 >= m.team2.overall + Math.random() * 10;
        return { 
          ...m, 
          winner: t1Wins ? m.team1 : m.team2, 
          loser: t1Wins ? m.team2 : m.team1,
          score: { t1: t1Wins ? 16 : 8, t2: t1Wins ? 8 : 16 } 
        };
      });
    });
    
    if (loser.isUser) setIsGameOver(true);

    if (activeUserMatch) {
      setActiveUserMatch({ ...activeUserMatch, winner, loser, score });
    }
  };

  const handleNextPhase = () => {
    const winners = matches.map(match => match.winner as TournamentTeam);
    
    if (winners.length === 1) {
      setChampion(winners[0]);
      return;
    }

    const nextMatches: Match[] = [];
    for (let i = 0; i < winners.length; i += 2) {
      nextMatches.push({ id: `match-${roundName}-${i}`, team1: winners[i], team2: winners[i + 1] });
    }
    setMatches(nextMatches);

    if (winners.length === 8) setRoundName("QUARTERFINALS");
    if (winners.length === 4) setRoundName("SEMIFINALS");
    if (winners.length === 2) setRoundName("GRAND FINAL");
  };

  // --- TELA 1: CAMPEÃO (HALL DA FAMA) ---
  if (champion) {
    return (
      <div className="tournament-wrapper">
        <div className="tournament-container" style={{ textAlign: 'center', paddingTop: '40px' }}>
          <h1 className="bracket-title" style={{ color: '#cda252', fontSize: '80px', marginBottom: '10px' }}>
            CHAMPION!
          </h1>
          <h2 style={{ fontSize: '40px', fontFamily: 'Anton', color: '#111', textTransform: 'uppercase', margin: 0, marginBottom: '20px' }}>
            {champion.name}
          </h2>
          
          {champion.isUser ? (
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '40px' }}>
              Your Dream Team made history and lifted the trophy!
            </p>
          ) : (
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e23b2d', marginBottom: '40px' }}>
              The AI took the trophy this time... Better luck next draft!
            </p>
          )}

          <div className="card-grid" style={{ justifyContent: 'center', marginBottom: '50px' }}>
            {champion.roster.map(player => (
              <PlayerCard key={player.id} player={player} hideAction={true} />
            ))}
          </div>

          <button className="btn-editorial btn-black" onClick={onRestart}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // --- TELA 2: PARTIDA EM ANDAMENTO ---
  if (activeUserMatch) {
    const matchFinished = activeUserMatch.winner !== undefined;
    return (
      <div className="tournament-wrapper">
        <div className="tournament-container">
          <LiveMatch matchData={activeUserMatch} onMatchFinish={handleMatchFinish} />
          
          {matchFinished && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn-editorial btn-black" 
                onClick={() => setActiveUserMatch(null)}
              >
                BACK TO BRACKET →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TELA 3: CHAVEAMENTO ---
  const userMatch = matches.find(m => m.team1.isUser || m.team2.isUser);
  const phaseCompleted = matches.every(m => m.winner !== undefined);

  return (
    <div className="tournament-wrapper">
      <div className="tournament-container">
        <h1 className="bracket-title">BRACKET - {roundName}</h1>
        
        {isGameOver && (
          <div style={{ textAlign: 'center', background: '#111', color: '#e23b2d', padding: '15px', border: '4px solid #e23b2d', marginBottom: '30px', boxShadow: '6px 6px 0px #e23b2d' }}>
            <h2 style={{ fontFamily: 'Anton', fontSize: '30px', margin: 0, letterSpacing: '1px' }}>ELIMINATED</h2>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          {matches.map(match => {
            const isUserInvolved = match.team1.isUser || match.team2.isUser;
            const t1IsWinner = match.winner?.id === match.team1.id;
            const t2IsWinner = match.winner?.id === match.team2.id;
            const hasWinner = match.winner !== undefined;

            return (
              <div key={match.id} className={`match-row ${isUserInvolved ? 'user-match' : ''}`}>
                <div className={`team-name ${match.team1.isUser ? 'user' : ''} ${hasWinner ? (t1IsWinner ? 'winner' : 'loser') : ''}`} style={{ textAlign: 'right' }}>
                  {match.team1.name}
                </div>
                
                <div className="match-score">
                  {match.score ? `${match.score.t1} - ${match.score.t2}` : 'VS'}
                </div>

                <div className={`team-name ${match.team2.isUser ? 'user' : ''} ${hasWinner ? (t2IsWinner ? 'winner' : 'loser') : ''}`} style={{ textAlign: 'left' }}>
                  {match.team2.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- BOTÕES DE PROGRESSÃO DINÂMICOS --- */}
        <div style={{ textAlign: 'center', marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          
          {/* Botão de Jogar */}
          {!phaseCompleted && userMatch && !isGameOver && !userMatch.winner && (
            <button className="btn-editorial btn-red" onClick={() => handlePlayUserMatch(userMatch)}>
              PLAY MY MATCH
            </button>
          )}

          {/* Botões de Avançar de Fase */}
          {phaseCompleted && !isGameOver && (
            <button className="btn-editorial btn-black" onClick={handleNextPhase}>
              {matches.length === 8 && "ADVANCE TO QUARTERFINALS →"}
              {matches.length === 4 && "ADVANCE TO SEMIFINALS →"}
              {matches.length === 2 && "ADVANCE TO GRAND FINAL →"}
              {matches.length === 1 && "LIFT THE TROPHY 🏆"}
            </button>
          )}

          {/* Botão de Derrota */}
          {isGameOver && (
            <button className="btn-editorial btn-red" onClick={onRestart}>
              START NEW DRAFT
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
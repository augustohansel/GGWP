// src/utils/playerUtils.ts
import type { Team, Player } from '../types';

export function getAllPlayers(teams: Team[]): Player[] {
  const allPlayers: Player[] = [];
  
  teams.forEach(team => {
    team.roster.forEach(player => {
      // Adicionamos o ano e o nome do time no jogador para facilitar na tela
      allPlayers.push({
        ...player,
        team_name: team.name,
        year: team.year
      } as Player & { team_name: string; year: number }); 
    });
  });

  // Removemos possíveis duplicatas caso o mesmo ID apareça duas vezes
  const uniquePlayers = Array.from(new Map(allPlayers.map(p => [p.id, p])).values());
  
  return uniquePlayers;
}
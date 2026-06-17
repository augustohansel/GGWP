import type { Team, Player } from '../types';

export function getAllPlayers(teams: Team[]): Player[] {
  const allPlayers: Player[] = [];
  
  teams.forEach(team => {
    team.roster.forEach(player => {
      allPlayers.push({
        ...player,
        team_name: team.name,
        year: team.year
      } as Player & { team_name: string; year: number }); 
    });
  });

  const uniquePlayers = Array.from(new Map(allPlayers.map(p => [p.id, p])).values());
  
  return uniquePlayers;
}
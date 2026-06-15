// src/utils/tournamentUtils.ts
import type { Player, Team } from '../types';

export interface TournamentTeam {
  id: string | number;
  name: string;
  isUser: boolean;
  overall: number;
  roster: Player[]; // Adicionamos o roster aqui!
}

export interface Match {
  id: string;
  team1: TournamentTeam;
  team2: TournamentTeam;
  winner?: TournamentTeam;
  loser?: TournamentTeam;
  score?: { t1: number, t2: number };
}

export const calculateUserTeamOverall = (roster: Player[]): number => {
  if (roster.length === 0) return 0;
  return Math.round(roster.reduce((acc, p) => acc + p.overall, 0) / roster.length);
};

export const calculateDBTeamOverall = (team: Team): number => {
  if (team.roster.length === 0) return 0;
  return Math.round(team.roster.reduce((acc, p) => acc + p.overall, 0) / team.roster.length);
};
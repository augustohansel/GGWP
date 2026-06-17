// src/utils/tournamentUtils.ts
import type { Player } from '../types';

export interface TournamentTeam {
  id: string;
  name: string;
  isUser: boolean;
  overall: number;
  roster: Player[];
  chemistryBreakdown?: string[];
}

export interface Match {
  id: string;
  team1: TournamentTeam;
  team2: TournamentTeam;
  winner?: TournamentTeam;
  loser?: TournamentTeam;
  score?: { t1: number, t2: number };
}

// --- O MOTOR DE QUÍMICA (PATCH DE BALANCEAMENTO) ---
export const calculateTeamChemistry = (roster: Player[]) => {
  let chemistryScore = 0;
  let breakdown: string[] = [];

  // 1. ANÁLISE DE FUNÇÕES (Roles)
  const roles = roster.flatMap(p => p.role.split('/').map(r => r.trim().toUpperCase()));
  const iglCount = roles.filter(r => r === 'IGL').length;
  const awpCount = roles.filter(r => r === 'AWPER').length;

  // Penalidades de IGL mais suaves
  if (iglCount === 0) {
    chemistryScore -= 5;
    breakdown.push("-5: No In-Game Leader");
  } else if (iglCount === 1) {
    chemistryScore += 3;
    breakdown.push("+3: Clear Leadership (1 IGL)");
  } else if (iglCount > 1) {
    chemistryScore -= 2;
    breakdown.push("-2: Clashing calls (2+ IGLs)");
  }

  // Penalidades de AWP mais justas
  if (awpCount === 0) {
    chemistryScore -= 3;
    breakdown.push("-3: No AWPer");
  } else if (awpCount === 1) {
    chemistryScore += 2;
    breakdown.push("+2: Balanced AWP setup");
  } else if (awpCount === 2) {
    chemistryScore -= 2;
    breakdown.push("-2: Double AWP (Heavy economy)");
  } else if (awpCount >= 3) {
    chemistryScore -= 8;
    breakdown.push("-8: 3+ AWPers (Economy ruined)");
  }

  // 2. ANÁLISE DE NACIONALIDADE E IDIOMA
  const nationalities = roster.reduce((acc, p) => {
    const nat = p.nationality || 'UNK';
    acc[nat] = (acc[nat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxSameNat = Math.max(...Object.values(nationalities));
  const uniqueNats = Object.keys(nationalities).length;

  // Bônus menores para a máquina não bater 99 toda hora
  if (maxSameNat === 5) {
    chemistryScore += 3;
    breakdown.push("+3: Perfect Comms (Same country)");
  } else if (maxSameNat === 4) {
    chemistryScore += 2;
    breakdown.push("+2: Solid Core (4 from same country)");
  } else if (maxSameNat === 3) {
    chemistryScore += 1;
    breakdown.push("+1: Tri-core synergy");
  } else if (uniqueNats >= 4) {
    // Punindo menos o "Time Misto" do jogador
    chemistryScore -= 2;
    breakdown.push("-2: International Mix (Language barrier)");
  }

  return { chemistryScore, breakdown };
};

// --- CÁLCULO FINAL DE OVERALL ---
export const calculateTeamOverall = (roster: Player[]) => {
  if (roster.length === 0) return { overall: 0, breakdown: [] };
  
  const baseAverage = roster.reduce((sum, p) => sum + p.overall, 0) / roster.length;
  const { chemistryScore, breakdown } = calculateTeamChemistry(roster);

  let finalOverall = Math.round(baseAverage + chemistryScore);
  
  // Limita o overall para não quebrar o jogo
  if (finalOverall > 99) finalOverall = 99;
  if (finalOverall < 1) finalOverall = 1;

  return { overall: finalOverall, breakdown };
};
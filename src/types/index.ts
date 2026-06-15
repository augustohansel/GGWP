// src/types/index.ts

export interface Attributes {
  aim: number;
  awp: number;
  brain: number;
  clutch: number;
  entry: number;
  utility: number;
  movement: number;
}

export interface Player {
  id: number;
  team_id: number;
  nickname: string;
  real_name: string;
  nationality: string;
  role: string;
  attributes: Attributes;
  overall: number;
}

export interface Team {
  id: number;
  name: string;
  year: number;
  cs_version: string;
  country: string;
  team_tier: string;
  roster: Player[];
}

export interface Database {
  metadata: {
    source?: string;
    scope?: string;
    total_teams?: number;
  };
  teams: Team[];
}
// src/components/PlayerCard.tsx
import React from 'react';
import type { Player } from '../types';
import './PlayerCard.css';

interface PlayerCardProps {
  player: Player & { team_name?: string; year?: number; nationality?: string };
  actionLabel?: string;
  onAction?: (player: Player) => void;
  disabled?: boolean;
  hideAction?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, actionLabel, onAction, disabled, hideAction 
}) => {
  return (
    <div className={`player-card ${disabled ? 'disabled' : ''}`}>
      
      {/* --- HEADER --- */}
      <div className="card-header">
        <span className="overall">{player.overall}</span>
        
        <div className="name-wrapper">
          {player.nationality && (
            <img 
              src={`https://flagcdn.com/24x18/${player.nationality.toLowerCase()}.png`} 
              alt={player.nationality} 
              className="player-flag"
              title={player.nationality} 
            />
          )}
          <h3>{player.nickname}</h3>
        </div>
      </div>
      
      {/* --- BODY --- */}
      <div className="card-body">
        
        {/* TAGS: O texto "SE" sumiu daqui! Agora temos apenas a Role */}
        <div className="card-tags">
          <span className="role-tag">{player.role}</span>
        </div>
        
        <p className="team-info">
          <span>{player.team_name}</span> 
          <span className="team-year">{player.year}</span>
        </p>
        <div className="attributes">
          <span>AIM {player.attributes.aim}</span>
          <span>AWP {player.attributes.awp}</span>
          <span>IQ {player.attributes.brain}</span>
          <span>CLT {player.attributes.clutch}</span>
          <span>ENT {player.attributes.entry}</span>
          <span>UTL {player.attributes.utility}</span>
          <span>MOV {player.attributes.movement}</span>
        </div>
      </div>
      
      {/* --- BOTÃO --- */}
      {!hideAction && onAction && actionLabel && (
        <button className="player-btn" onClick={() => onAction(player)} disabled={disabled}>
          {actionLabel}
        </button>
      )}
      
    </div>
  );
};
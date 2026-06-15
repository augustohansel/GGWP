// src/components/PlayerCard.tsx
import React from 'react';
import type { Player } from '../types';
import './PlayerCard.css';

interface PlayerCardProps {
  player: Player & { team_name?: string; year?: number };
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
      <div className="card-header">
        <span className="overall">{player.overall}</span>
        <h3>{player.nickname}</h3>
      </div>
      <div className="card-body">
        <p className="role">{player.role}</p>
        <div className="attributes">
          <span>AIM {player.attributes.aim}</span>
          <span>BRN {player.attributes.brain}</span>
          <span>CLT {player.attributes.clutch}</span>
          <span>ENT {player.attributes.entry}</span>
          <span>UTL {player.attributes.utility}</span>
          <span>MOV {player.attributes.movement}</span>
        </div>
      </div>
      
      {!hideAction && onAction && actionLabel && (
        <button className="player-btn" onClick={() => onAction(player)} disabled={disabled}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
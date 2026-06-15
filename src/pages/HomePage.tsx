// src/pages/HomePage.tsx
import React from 'react';
import './HomePage.css';

interface HomePageProps {
  onStart: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="home-wrapper">
      
      {/* HEADER */}
      <header className="home-nav">
        <div className="home-nav-tag">Counter Strike — 2001 — 2026</div>
      </header>

      {/* HERO SECTION */}
      <section className="home-hero">
        
        {/* Esquerda: Textos e Botões */}
        <div className="hero-left">
          <h1 className="big-score">GGWP</h1>
          <h2 className="hero-title">
            Roll the dice.<br />
            Build your dream<br />
            roster.
          </h2>
          <p className="hero-desc">
            Draw a historic Major team. Draft a star who played there, complete your 5-man roster, and simulate the bracket — does your team have what it takes to lift the trophy?
          </p>
          
          <div className="hero-buttons">
            <button className="btn-play" onClick={onStart}>
              PLAY NOW →
            </button>
          </div>
        </div>

        {/* Direita: O Quadro Tático Híbrido */}
        <div className="hero-right">
          <div className="tactical-board">
            
            {/* AWP no Meio */}
            <div className="player-node" style={{ top: '47%', left: '33%' }}>
              <div className="node-circle">AWP</div>
              <span className="node-name">FalleN</span>
            </div>
            
            {/* Entry no Bomb A */}
            <div className="player-node" style={{ top: '35%', left: '85%' }}>
              <div className="node-circle">ENT</div>
              <span className="node-name">NiKo</span>
            </div>
            
            {/* Support no Bomb A */}
            <div className="player-node" style={{ top: '28%', left: '45%' }}>
              <div className="node-circle">RIF</div>
              <span className="node-name">coldzera</span>
            </div>
            
            {/* Lurker no Bomb B */}
            <div className="player-node" style={{ top: '92%', left: '80%' }}>
              <div className="node-circle">LRK</div>
              <span className="node-name">GeT_RiGhT</span>
            </div>
            
            {/* IGL ancorando a ligação/B */}
            <div className="player-node" style={{ top: '80%', left: '15%' }}>
              <div className="node-circle">IGL</div>
              <span className="node-name">karrigan</span>
            </div>

          </div>
        </div>
      </section>

      {/* STEPS BOTTOM */}
      <section className="steps-card">
        <div className="step-item">
          <div className="step-number">01</div>
          <div className="step-text">
            <h4>ROLL</h4>
            <p>Draw a historic roster and Major</p>
          </div>
        </div>
        <div className="step-item">
          <div className="step-number">02</div>
          <div className="step-text">
            <h4>DRAFT</h4>
            <p>Pick a legendary player from that squad</p>
          </div>
        </div>
        <div className="step-item">
          <div className="step-number">03</div>
          <div className="step-text">
            <h4>SIMULATE</h4>
            <p>See if your roster wins it all</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <strong>168</strong> teams · <strong>840</strong> players · <a href="#">Disagree with a rating?</a>
      </footer>

    </div>
  );
};
# 🏆 CS:GO Dream Team Simulator

Um simulador de Draft e Torneio de Counter-Strike construído em React! Monte o seu "Dream Team" com lendas do CS (passado e presente), maximize a química da equipe e lute pelo troféu de um Major contra os maiores times da história.

## ✨ Funcionalidades (Features)

*   **Draft Estratégico:** Escolha 5 jogadores a partir de um banco de dados rico. Monte a sua equipe equilibrando funções vitais como *IGL*, *AWPer*, *Entry Fragger*, *Support* e *Lurker*.
*   **Motor de Química (Chemistry Engine):** O Overall (OVR) do seu time não é apenas a média das notas! Ganhe bônus de performance ao juntar jogadores da mesma nacionalidade, da mesma era ou com funções bem distribuídas.
*   **Chaveamento de Major (Bracket System):** O seu time é inserido num torneio de eliminação simples com 16 equipes (Oitavas, Quartas, Semis e Final). Oponentes e chaves são gerados aleatoriamente a cada nova jogatina, com um sistema Anti-Clone (evita organizações repetidas).
*   **Simulação de Partidas ao Vivo:** Assista ao seu time jogar round a round! O motor do jogo calcula abates, assistências e mortes usando:
    *   *Performance Individual:* Jogadores com OVR maior têm mais chances de brilhar e puxar kills.
    *   *Mecânicas Reais:* Ninguém morre duas vezes no mesmo round, e mortes/kills batem matematicamente entre as equipes.
    *   *Destaques:* Alertas visuais e coloridos para Multi-kills (Double, Triple, Quad) e o tão sonhado **ACE Dourado**!
    *   *Match MVP:* O "Top Fragger" da partida é coroado com uma estrela de MVP no placar final.
*   **Path to Glory (Caminho da Glória):** Uma tela de campeão gloriosa que exibe a sua escalação, o troféu e o histórico completo dos times que você amassou para chegar ao título.

---

## 📸 Screenshots

### 1. Tela de Draft & Química
<img width="1000" height="896" alt="image" src="https://github.com/user-attachments/assets/f5781538-e2fa-47b5-8adf-ad69669a713b" />

### 2. A Árvore do Torneio (Bracket)
<img width="995" height="1227" alt="image" src="https://github.com/user-attachments/assets/b89452f2-74f0-4791-9f3e-842251c16e03" />

### 3. Partida ao Vivo (Live Match)
<img width="999" height="612" alt="image" src="https://github.com/user-attachments/assets/de981da6-fa43-4115-8d72-aa96425b89f8" />

---

## 🚀 Tecnologias Utilizadas

*   **React (com TypeScript)** - Estrutura principal da aplicação e componentes.
*   **CSS Puro / Flexbox / CSS Grid** - Estilização customizada focada em uma interface sombria, limpa e responsiva (estética e-sports).
*   **JSON Data** - Banco de dados local para armazenar times, jogadores e atributos.

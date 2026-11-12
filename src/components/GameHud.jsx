import React from 'react';

// Minimal overlay shown in game mode: controls hint + the name of the place you are standing at.
export default function GameHud({ nearPlace }) {
  return (
    <>
      <div className="game-hint">
        <span><b>W</b> / <b>↑</b> walk</span>
        <span><b>A D</b> / <b>← →</b> turn</span>
        <span><b>Shift</b> run</span>
        <span><b>Esc</b> exit</span>
      </div>
      {nearPlace && (
        <div className="game-near">
          <span className="game-near-dot" />
          {nearPlace.name}
        </div>
      )}
    </>
  );
}

"use client";

import type { FC } from "react";
import { Core } from "~/core";
import { useKeyPress } from "~/hooks/useKeyPress";

const coreGame = new Core();

export const Game: FC = () => {
  useKeyPress("ArrowUp", {
    callback: () => coreGame.snake.moveUp(),
  });
  useKeyPress("ArrowDown", {
    callback: () => coreGame.snake.moveDown(),
  });
  useKeyPress("ArrowLeft", {
    callback: () => coreGame.snake.moveLeft(),
  });
  useKeyPress("ArrowRight", {
    callback: () => coreGame.snake.moveRight(),
  });

  return (
    <div>
      <canvas id="game" width={300} height={300} />
      <button onClick={() => coreGame.start()}>Start</button>
    </div>
  );
};

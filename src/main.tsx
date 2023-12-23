import './index.css'

import 'phaser'

import {game} from './App';


const GameConfig: Phaser.Types.Core.GameConfig = {
  title: 'lamberjack',
  url: 'https://github.com/digitsensitive/phaser3-typescript',
  version: '2.0',
  width: window.innerWidth,
  height: window.innerHeight,
  type: Phaser.AUTO,
  parent: 'root',
  input: {
    keyboard: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  render: { pixelArt: false, antialias: true },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'root', // Ensure this matches your HTML element ID
  },
  // `as as Phaser.Types.Scenes.SettingsConfig[]` is required until https://github.com/photonstorm/phaser/pull/6235
  scene: [game()] as Phaser.Types.Scenes.SettingsConfig[],

  callbacks: {
    postBoot: (game: Phaser.Game) => {
      const canvas = game.canvas as HTMLCanvasElement;
      canvas.getContext('2d')?.canvas.setAttribute('willReadFrequently', 'true');
    },
  },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);

    // Ensure the canvas size matches the window size
    window.addEventListener('resize', () => {
      this.scale.resize(window.innerWidth, window.innerHeight);
    });

    // Expose `_game` to allow debugging, mute button, and fullscreen button
    (window as any)._game = this;
  }
}

window.addEventListener('load', () => {
  // Expose `_game` to allow debugging, mute button and fullscreen button
  (window as any)._game = new Game(GameConfig);
});


import Phaser from 'phaser';
import { BootScene }          from './scenes/BootScene.js';
import { VersionSelectScene } from './scenes/VersionSelectScene.js';
import { MenuScene }          from './scenes/MenuScene.js';
import { StreetScene }        from './scenes/StreetScene.js';
import { NightScene }         from './scenes/NightScene.js';
import { EventPopupScene }    from './scenes/EventPopupScene.js';
import { EndNightScene }      from './scenes/EndNightScene.js';
import { OfficeScene }        from './scenes/OfficeScene.js';
import { GameOverScene }      from './scenes/GameOverScene.js';

window.__studio57Lang = 'ru';

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 700,
  backgroundColor: '#020008',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 400,
    height: 700,
  },
  scene: [
    BootScene,
    VersionSelectScene,
    MenuScene,
    StreetScene,
    NightScene,
    EventPopupScene,
    EndNightScene,
    OfficeScene,
    GameOverScene,
  ],
  physics: { default: 'arcade', arcade: { debug: false } },
};

new Phaser.Game(config);

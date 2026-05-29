import Phaser from 'phaser';
import { BootScene }          from './scenes/BootScene.js';
import { VersionSelectScene } from './scenes/VersionSelectScene.js';
import { MenuScene }          from './scenes/MenuScene.js';
import { StreetScene }        from './scenes/StreetScene.js';
import { NightScene }         from './scenes/NightScene.js';
import { ClubScene }          from './scenes/ClubScene.js';
import { EventsScene }        from './scenes/EventsScene.js';
import { EventPopupScene }    from './scenes/EventPopupScene.js';
import { EndNightScene }      from './scenes/EndNightScene.js';
import { OfficeScene }        from './scenes/OfficeScene.js';
import { BathroomScene }      from './scenes/BathroomScene.js';
import { GameOverScene }      from './scenes/GameOverScene.js';
import { EndingScene }          from './scenes/EndingScene.js';

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
    ClubScene,
    EventsScene,
    EventPopupScene,
    BathroomScene,
    EndNightScene,
    OfficeScene,
    GameOverScene,
    EndingScene,
  ],
  physics: { default: 'arcade', arcade: { debug: false } },
};

new Phaser.Game(config);

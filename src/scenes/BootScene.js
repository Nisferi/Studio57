import Phaser from 'phaser';
import { SaveSystem } from '../SaveSystem.js';
import { GameState } from '../GameState.js';

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  preload() {
    // All graphics are procedural — nothing to load.
    // This scene only handles save loading and TG init.
    const bar  = document.getElementById('loading-bar');
    const tip  = document.getElementById('loading-tip');
    if (bar) bar.style.width = '60%';
    if (tip) tip.textContent = 'Initializing...';
  }

  create() {
    // Telegram WebApp init
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser) {
          console.log('TG user:', tgUser.id);
        }
      }
    } catch (e) {}

    // Load save
    const hasSave = SaveSystem.load();

    const bar = document.getElementById('loading-bar');
    if (bar) bar.style.width = '100%';

    // Short delay for loading screen visibility
    this.time.delayedCall(400, () => {
      const loadingEl = document.getElementById('loading-screen');
      if (loadingEl) loadingEl.style.display = 'none';

      if (!hasSave || !GameState.contentVersion) {
        this.scene.start('VersionSelect');
      } else {
        window.__studio57Lang = GameState.lang;
        this.scene.start('Menu');
      }
    });
  }
}

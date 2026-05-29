/**
 * PixelUI — shared procedural pixel-art UI components.
 * All methods receive a Phaser.Scene instance as first arg.
 */

export const PixelUI = {

  /**
   * Pixel-art button with 3D shadow + highlight, hover animation.
   * Returns { bg, txt } so caller can add listeners.
   */
  button(scene, cx, cy, w, h, label, {
    baseColor   = 0x004400,
    hoverColor  = 0x006600,
    borderColor = 0xffd700,
    textColor   = '#ffffff',
    fontSize    = '9px',
    depth       = 10,
  } = {}) {
    const SHADOW = 0x111111;
    const g = scene.add.graphics().setDepth(depth);

    // 3-px drop shadow (bottom-right)
    g.fillStyle(SHADOW, 0.7);
    g.fillRect(cx - w / 2 + 3, cy - h / 2 + 3, w, h);

    // Main body
    const bg = scene.add.rectangle(cx, cy, w, h, baseColor)
      .setStrokeStyle(2, borderColor)
      .setInteractive()
      .setDepth(depth + 1);

    // Top-left pixel highlight strip (1px)
    const hl = scene.add.graphics().setDepth(depth + 2);
    hl.fillStyle(0xffffff, 0.18);
    hl.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, 2);
    hl.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, 2, h - 4);

    // Bottom-right shadow strip
    hl.fillStyle(0x000000, 0.25);
    hl.fillRect(cx - w / 2 + 2, cy + h / 2 - 4, w - 4, 2);
    hl.fillRect(cx + w / 2 - 4, cy - h / 2 + 2, 2, h - 4);

    // Inner deco border
    const deco = scene.add.graphics().setDepth(depth + 2);
    deco.lineStyle(1, borderColor, 0.22);
    deco.strokeRect(cx - w / 2 + 5, cy - h / 2 + 5, w - 10, h - 10);

    const txt = scene.add.text(cx, cy, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize, color: textColor,
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(depth + 3);

    bg.on('pointerover', () => {
      bg.setFillStyle(hoverColor);
      scene.tweens.add({ targets: [bg, txt, hl, deco], scaleX: 1.03, scaleY: 1.03, duration: 80, ease: 'Quad.Out' });
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(baseColor);
      scene.tweens.add({ targets: [bg, txt, hl, deco], scaleX: 1, scaleY: 1, duration: 80, ease: 'Quad.Out' });
    });

    txt.setInteractive();
    txt.on('pointerdown', () => bg.emit('pointerdown'));

    return { bg, txt };
  },

  /**
   * Neon text — rendered as stacked glow layers.
   * Returns the topmost (white) text object.
   */
  neonText(scene, x, y, text, size, color, {
    depth = 5,
    glowLayers = [14, 7, 3],
    glowAlphas = [0.10, 0.20, 0.40],
  } = {}) {
    glowLayers.forEach((thick, i) => {
      scene.add.text(x, y, text, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: size, color, stroke: color,
        strokeThickness: thick,
        alpha: glowAlphas[i],
      }).setOrigin(0.5).setDepth(depth);
    });
    return scene.add.text(x, y, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: size, color: '#ffffff',
    }).setOrigin(0.5).setDepth(depth + 1);
  },

  /**
   * Pixel-art panel (background box with chrome corners).
   */
  panel(scene, cx, cy, w, h, {
    bgColor    = 0x100c3a,
    bgAlpha    = 0.92,
    borderColor = 0xffd700,
    cornerSize  = 6,
    depth       = 5,
  } = {}) {
    const bg = scene.add.rectangle(cx, cy, w, h, bgColor, bgAlpha)
      .setDepth(depth);

    const g = scene.add.graphics().setDepth(depth + 1);

    // Main border
    g.lineStyle(2, borderColor, 0.85);
    g.strokeRect(cx - w / 2, cy - h / 2, w, h);

    // Inner thin border
    g.lineStyle(1, borderColor, 0.22);
    g.strokeRect(cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h - 6);

    // Corner accents — filled squares at each corner
    const corners = [
      [cx - w / 2, cy - h / 2],
      [cx + w / 2 - cornerSize, cy - h / 2],
      [cx - w / 2, cy + h / 2 - cornerSize],
      [cx + w / 2 - cornerSize, cy + h / 2 - cornerSize],
    ];
    g.fillStyle(borderColor, 0.9);
    corners.forEach(([ox, oy]) => g.fillRect(ox, oy, cornerSize, cornerSize));

    return { bg, g };
  },

  /**
   * HUD stat bar (progress bar with pixel border).
   */
  statBar(scene, x, y, w, h, {
    bgColor    = 0x1a0000,
    fillColor  = 0xff2020,
    borderColor = 0xff4040,
    depth       = 10,
  } = {}) {
    scene.add.rectangle(x + w / 2, y + h / 2, w, h, bgColor).setDepth(depth);
    const fill = scene.add.rectangle(x, y + h / 2, 0, h, fillColor)
      .setOrigin(0, 0.5).setDepth(depth + 1);
    const border = scene.add.graphics().setDepth(depth + 2);
    border.lineStyle(1, borderColor, 0.8);
    border.strokeRect(x, y, w, h);
    return { fill, border, maxW: w };
  },

  /**
   * Draw a simple disco ball and return { container }.
   * Caller should add to scene and can position/tween container.
   */
  discoBall(scene, cx, cy, radius = 18) {
    const container = scene.add.container(cx, cy);

    // Shadow
    const shadowG = scene.add.graphics();
    shadowG.fillStyle(0x000000, 0.25);
    shadowG.fillEllipse(0, radius + 4, radius * 2.4, radius * 0.5);
    container.add(shadowG);

    const ballG = scene.add.graphics();
    // Metallic body
    ballG.fillStyle(0x888888);
    ballG.fillCircle(0, 0, radius);
    // Soft inner sheen
    ballG.fillStyle(0xffffff, 0.08);
    ballG.fillCircle(-radius * 0.25, -radius * 0.3, radius * 0.55);

    // Mirror tiles
    const tileSize = 3;
    const tileColors = [
      0xffffff, 0xdddddd, 0xffd700, 0xaaaaaa,
      0x88ccff, 0xffccaa, 0xccffee, 0xffaacc,
    ];
    for (let ty = -radius + 2; ty < radius - 2; ty += tileSize + 1) {
      for (let tx = -radius + 2; tx < radius - 2; tx += tileSize + 1) {
        if (tx * tx + ty * ty < (radius - 3) * (radius - 3)) {
          const col = tileColors[(Math.abs(tx + ty * 3)) % tileColors.length];
          const brt = (ty < 0) ? 0.75 + Math.random() * 0.25 : 0.35 + Math.random() * 0.25;
          ballG.fillStyle(col, brt);
          ballG.fillRect(tx, ty, tileSize, tileSize);
        }
      }
    }

    // Chrome ring
    ballG.lineStyle(1, 0xaaaaaa, 0.7);
    ballG.strokeCircle(0, 0, radius);

    // Wire
    const wireG = scene.add.graphics();
    wireG.lineStyle(1, 0x999999, 0.8);
    wireG.beginPath();
    wireG.moveTo(0, -radius);
    wireG.lineTo(0, -radius - 30);
    wireG.strokePath();

    container.add([wireG, ballG]);
    return container;
  },
};

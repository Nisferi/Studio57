# Studio 57 — Code Audit & Architecture Plan (May 2026)

## 1. What Exists

### Game Loop
- **BootScene → VersionSelectScene → MenuScene**
- **NightScene** (55-second doorman shift, Papers Please style)
- **ClubScene** (interior view with dance floor, bar, VIP, bathroom)
- **BathroomScene** (3-cabinet debauchery choices)
- **EventsScene** (book/browse macro events for upcoming night)
- **EventPopupScene** (mid-night event popup with choices)
- **EndNightScene** (tax calc, night summary, advancement)
- **OfficeScene** (inter-night upgrades, book events, advance)
- **GameOverScene** (FBI raid or bankruptcy ending)

### Data Layer
- `data/guests.js` — guest generator with style/intox/age/skin
- `data/celebrities.js` — 6 celebrities with effects
- `data/events.js` — 8+ macro events with safe/adult/max text
- `data/upgrades.js` — 5 upgrade trees (sound/bar/security/lights/vipLounge)
- `data/locales.js` — RU/EN strings
- `data/arnie_lines.js` — Arnie dialogue lines
- `data/tuning.js` *(NEW)* — all balance constants centralized

### Systems
- `systems/AudioSystem.js` — procedural 120BPM disco via Web Audio API, SFX
- `systems/EconomySystem.js` *(NEW)* — financial math extracted from scenes
- `systems/ContentSystem.js` *(NEW)* — versioned text resolver (safe/adult/max)

### State
- `GameState.js` — singleton: finances, risk meters, upgrades, characterMemory, epoch
- `SaveSystem.js` — localStorage, v2 schema with migration from v1

---

## 2. Bugs Fixed (Sprint 1 — May 2026)

| Bug | File | Fix |
|-----|------|-----|
| BPM never resets between nights | AudioSystem | Added `resetBPM()`, called in `endNight()` |
| `celebChanceBoost` hardcoded to 1, ignoring vipLounge upgrade | NightScene.init() | Now uses `EconomySystem.calcCelebChanceBoost(upgrades.vipLounge)` |
| Same event can fire multiple times per night | NightScene.fireEvent() | Added `firedEventIds[]` to nightStats; events skip if already fired |
| SaveSystem missing characterMemory, epoch, bookedEvent, bankrupt | SaveSystem | Bumped to v2; v1 → v2 migration added |
| Magic numbers scattered across NightScene/EndNightScene | Multiple scenes | Extracted to `data/tuning.js`, used via `EconomySystem` |
| Tax rate hardcoded in EndNightScene | EndNightScene | Uses `EconomySystem.calcTax()` + `TAX_RATE` from tuning.js |
| Bar tick formula inconsistent with upgrade levels | NightScene.onBarTick() | Uses `EconomySystem.calcBarTick()` with `BAR_UPGRADE_MULT[]` |
| Fight chance formula duplicated | NightScene.init() | Uses `EconomySystem.calcFightChance()` |
| Underage fine hardcoded | NightScene.processEntry() | Uses `UNDERAGE_FINE/FBI_GAIN/POLICE_GAIN/CATCH_CHANCE` constants |

---

## 3. Architecture Recommendations

### Completed
- [x] `data/tuning.js` — single source of truth for all balance numbers
- [x] `systems/EconomySystem.js` — pure functions for financial calculations
- [x] `systems/ContentSystem.js` — versioned content resolver
- [x] `SaveSystem v2` — all GameState fields serialized with v1 migration
- [x] `AudioSystem.resetBPM()` — BPM resets to 120 each night

### Recommended (Sprint 2)

#### EventPopupScene → NightScene wiring
The `onClose` callback path is implemented but EventPopupScene needs to be confirmed to call `onClose` on all exit paths (confirm, deny, and timeout). Check `EventPopupScene.js` for any missing `this.data.get('onClose')` call.

#### FBI Meter as scaleX tween
Current FBI bar uses fixed-width rectangle. Should use `scaleX` tween for smooth animation. See plan: create `this.fbiBar` as a fixed-origin rect, update via `this.tweens.add({ targets: this.fbiBar, scaleX: pct, duration: 300 })`.

#### Tutorial overlay (Night 1)
`buildTutorial()` exists in NightScene but needs step content, arrows, and auto-advance. Flag `GameState.flags.tutorialDone` is wired.

#### Celebrity effects in NightScene
The `switch (celeb.effect)` block exists but some branches may be stubs. Verify:
- `andy_warholder` → rep +2 every 10s timer
- `mick_swagger` → spawn 3 extra guests immediately  
- `lisa_monelli` → `this.barBoost = 2.5`
- `donald_trumpet` → `this.ticketMultiplier = 3`
- `sly_steel` → `this.slyInClub = true`
- `mini_michael` → guest stay time longer (not yet implemented)

---

## 4. Balance Targets

| Night | Target Gross | Stash ≤ | FBI ≤ (normal play) |
|-------|-------------|---------|---------------------|
| 1     | $400–700    | $200    | 25% |
| 3     | $800–1500   | $600    | 40% |
| 6     | $2000–4000  | $1500   | 60% |

**Key levers in tuning.js:**
- `NIGHT_DURATION` — more time = more income
- `BAR_UPGRADE_MULT` — bar is biggest passive income source at higher levels
- `HIDE_FBI_GAIN` — increasing this forces player to choose risk more carefully
- `UNDERAGE_CATCH_CHANCE` — 0.40 is forgiving; raise to 0.55 for harder nights 4+

---

## 5. Modular Scene Map

```
BootScene
  └─ VersionSelectScene
       └─ MenuScene
            └─ NightScene ──── EventPopupScene (launch/sleep)
                 ├─────────── ClubScene (launch/sleep)
                 │                └─ BathroomScene (launch/sleep)
                 ├─────────── EndNightScene
                 │                └─ OfficeScene ──── EventsScene
                 └─────────── GameOverScene
```

---

## 6. Pending Work (Ordered)

1. **EventPopupScene onClose audit** — verify all exit paths call callback
2. **FBI meter scaleX** — animated bar instead of fill-rect
3. **Tutorial step content** — Night 1 overlay with arrows
4. **Celebrity effects validation** — confirm all 6 celeb effects active
5. **Arnie inter-night dialogue** — OfficeScene context-aware lines
6. **Detective Collins arc** — Night 3/5/7 escalation
7. **IRS letter event** — warning before FBI raid (Sprint 2)
8. **Telegram CloudStorage** — replace localStorage (Sprint 3)
9. **Share card** — RenderTexture → base64 → Telegram share (Sprint 3)

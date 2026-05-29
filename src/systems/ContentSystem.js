import { GameState } from '../GameState.js';

/**
 * Resolves versioned text for safe/adult/max content.
 *
 * Usage:
 *   ContentSystem.getText(event, 'title', 'ru')
 *   ContentSystem.getText(event, 'body', 'en')
 *
 * Expected item shape:
 *   { title_safe: {ru, en}, title_adult: {ru, en}, title_max: {ru, en} }
 *
 * Falls back to 'safe' if the version field is missing.
 */
export const ContentSystem = {
  getText(item, field, lang) {
    const version = GameState.contentVersion || 'safe';
    const key = `${field}_${version}`;
    const fallback = `${field}_safe`;
    const obj = item[key] || item[fallback] || {};
    return obj[lang] || obj['ru'] || obj['en'] || '';
  },

  /**
   * Convenience: get title for current lang.
   */
  getTitle(item) {
    return this.getText(item, 'title', GameState.lang || 'ru');
  },

  /**
   * Convenience: get body for current lang.
   */
  getBody(item) {
    return this.getText(item, 'body', GameState.lang || 'ru');
  },

  /**
   * Alternative resolver for bag-style versioned content:
   *   { safe: { ... }, adult: { ... }, max: { ... } }
   * Returns the correct version object, falling back to 'safe'.
   */
  getVersionedBag(bag) {
    const version = GameState.contentVersion || 'safe';
    return bag[version] || bag['safe'] || {};
  },
};

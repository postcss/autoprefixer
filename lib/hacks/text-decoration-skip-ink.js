let Declaration = require('../declaration')

class TextDecorationSkipInk extends Declaration {
  static names = ['text-decoration-skip-ink', 'text-decoration-skip']

  /**
   * Change prefix for ink value
   */
  set (decl, prefix) {
    if (decl.prop === 'text-decoration-skip-ink' && decl.value === 'auto') {
      decl.prop = prefix + 'text-decoration-skip'
      decl.value = 'ink'
      return decl
    } else {
      return super.set(decl, prefix)
    }
  }
}

module.exports = TextDecorationSkipInk

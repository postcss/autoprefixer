let Declaration = require('../declaration')

class Animation extends Declaration {
  static names = ['animation', 'animation-direction']

  /**
   * Don’t add prefixes for modern values.
   */
  check (decl) {
    return !decl.value.split(/\s+/).some(i => {
      let lower = i.toLowerCase()
      return lower === 'reverse' || lower === 'alternate-reverse'
    })
  }
}

module.exports = Animation

let Declaration = require('../declaration')

class Filter extends Declaration {
  static names = ['filter']

  /**
   * Check is it Internet Explorer filter
   */
  check (decl) {
    let v = decl.value
    return (
      !v.toLowerCase().includes('alpha(') &&
          !v.includes('DXImageTransform.Microsoft') &&
          !v.includes('data:image/svg+xml')
    )
  }
}

module.exports = Filter

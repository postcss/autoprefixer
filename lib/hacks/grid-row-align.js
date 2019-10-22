let Declaration = require('../declaration')

class GridRowAlign extends Declaration {
  static names = ['grid-row-align']

  /**
   * Do not prefix flexbox values
   */
  check (decl) {
    return !decl.value.includes('flex-') && decl.value !== 'baseline'
  }

  /**
   * Change property name for IE
   */
  prefixed (prop, prefix) {
    return prefix + 'grid-row-align'
  }

  /**
   * Change IE property back
   */
  normalize () {
    return 'align-self'
  }
}

module.exports = GridRowAlign

let Value = require('../value')

class DisplayGrid extends Value {
  static names = ['display-grid', 'inline-grid']

  constructor (name, prefixes) {
    super(name, prefixes)
    if (name === 'display-grid') {
      this.name = 'grid'
    }
  }

  /**
   * Faster check for flex value
   */
  check (decl) {
    return decl.prop === 'display' && decl.value === this.name
  }
}

module.exports = DisplayGrid

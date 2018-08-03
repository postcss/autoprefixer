let Value = require('../value')

class FilterValue extends Value {
  static names = ['filter', 'filter-function']

  constructor (name, prefixes) {
    super(name, prefixes)
    if (name === 'filter-function') {
      this.name = 'filter'
    }
  }
}

module.exports = FilterValue

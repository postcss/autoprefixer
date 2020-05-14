let Selector = require('../selector')

class PlaceholderShown extends Selector {
  static names = [':placeholder-shown']

  /**
   * Return different selectors depend on prefix
   */
  prefixed (prefix) {
    if (prefix === '-ms-') {
      return ':-ms-input-placeholder'
    }
    return `:${ prefix }placeholder-shown`
  }
}

module.exports = PlaceholderShown

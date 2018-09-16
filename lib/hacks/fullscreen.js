let Selector = require('../selector')

class Fullscreen extends Selector {
  static names = [':fullscreen']

  /**
   * Return different selectors depend on prefix
   */
  prefixed (prefix) {
    if (prefix === '-webkit-') {
      return ':-webkit-full-screen'
    }
    if (prefix === '-moz-') {
      return ':-moz-full-screen'
    }
    return `:${ prefix }fullscreen`
  }
}

module.exports = Fullscreen

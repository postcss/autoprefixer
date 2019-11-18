let Declaration = require('../declaration')

class UserSelect extends Declaration {
  static names = ['user-select']

  /**
   * Change prefixed value for IE
   */
  set (decl, prefix) {
    if (prefix === '-ms-' && decl.value === 'contain') {
      decl.value = 'element'
    }
    return super.set(decl, prefix)
  }
}

module.exports = UserSelect

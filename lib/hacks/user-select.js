let Declaration = require('../declaration')

class UserSelect extends Declaration {
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

UserSelect.names = ['user-select']

module.exports = UserSelect

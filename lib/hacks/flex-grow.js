let flexSpec = require('./flex-spec')
let Declaration = require('../declaration')

class Flex extends Declaration {
  static names = ['flex-grow', 'flex-positive']

  /**
   * Return property name by final spec
   */
  normalize () {
    return 'flex'
  }

  /**
   * Return flex property for 2009 and 2012 specs
   */
  prefixed (prop, prefix) {
    let spec;
    [spec, prefix] = flexSpec(prefix)
    if (spec === 2009) {
      return prefix + 'box-flex'
    }
    if (spec === 2012) {
      return prefix + 'flex-positive'
    }
    return super.prefixed(prop, prefix)
  }
}

module.exports = Flex

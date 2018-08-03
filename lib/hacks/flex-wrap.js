let flexSpec = require('./flex-spec')
let Declaration = require('../declaration')

class FlexWrap extends Declaration {
  static names = ['flex-wrap']

  /**
   * Don't add prefix for 2009 spec
   */
  set (decl, prefix) {
    let spec = flexSpec(prefix)[0]
    if (spec !== 2009) {
      return super.set(decl, prefix)
    }
    return undefined
  }
}

module.exports = FlexWrap

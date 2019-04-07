let Declaration = require('../declaration')
let utils = require('../utils')

class BackgroundClip extends Declaration {
  static names = ['background-clip']

  constructor (name, prefixes, all) {
    super(name, prefixes, all)

    if (this.prefixes) {
      this.prefixes = utils.uniq(this.prefixes.map(i => {
        return i === '-ms-' ? '-webkit-' : i
      }))
    }
  }

  check (decl) {
    return decl.value.toLowerCase() === 'text'
  }
}

module.exports = BackgroundClip

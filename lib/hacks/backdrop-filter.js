let Declaration = require('../declaration')
let utils = require('../utils')

class BackdropFilter extends Declaration {
  static names = ['backdrop-filter']

  constructor (name, prefixes, all) {
    super(name, prefixes, all)

    if (this.prefixes) {
      this.prefixes = utils.uniq(this.prefixes.map(i => {
        return i === '-ms-' ? '-webkit-' : i
      }))
    }
  }
}

module.exports = BackdropFilter

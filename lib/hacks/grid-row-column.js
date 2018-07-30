let Declaration = require('../declaration')
let utils = require('./grid-utils')

class GridRowColumn extends Declaration {
    static names = ['grid-row', 'grid-column'];

    /**
     * Translate grid-row / grid-column to separate -ms- prefixed properties
     */
    insert (decl, prefix, prefixes) {
      if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes)

      let values = utils.parse(decl)
      let [start, span] = utils.translate(values, 0, 1);

      [
        [decl.prop, start],
        [`${ decl.prop }-span`, span]

      ].forEach(([prop, value]) => {
        utils.insertDecl(decl, prop, value)
      })

      return undefined
    }
}

module.exports = GridRowColumn

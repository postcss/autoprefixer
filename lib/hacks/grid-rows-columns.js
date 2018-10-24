let Declaration = require('../declaration')
let {
  prefixTrackProp,
  prefixTrackValue,
  autoplaceGridItems,
  getGridGap
} = require('./grid-utils')

class GridRowsColumns extends Declaration {
  static names = [
    'grid-template-rows', 'grid-template-columns',
    'grid-rows', 'grid-columns'
  ]

  /**
   * Change property name for IE
   */
  prefixed (prop, prefix) {
    if (prefix === '-ms-') {
      return prefixTrackProp({ prop, prefix })
    }
    return super.prefixed(prop, prefix)
  }

  /**
   * Change IE property back
   */
  normalize (prop) {
    return prop.replace(/^grid-(rows|columns)/, 'grid-template-$1')
  }

  insert (decl, prefix, prefixes, result) {
    if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes)

    let { parent, prop, value } = decl

    let hasGridTemplate = parent.some(i =>
      i.prop === 'grid-template' || i.prop === 'grid-template-areas')

    /**
     * Not to prefix declaration if grid-template(-areas) is present
     */
    if (hasGridTemplate) {
      return false
    }

    let isRowProp = prop.includes('rows')
    let isColumnProp = prop.includes('columns')
    let { row, column } = getGridGap(decl)
    let prefixValue = prefixTrackValue({ value, gap: isRowProp ? row : column })

    /**
     * Insert prefixes
     */
    decl.cloneBefore({
      prop: prefixTrackProp({ prop, prefix }),
      value: prefixValue
    })

    if (isColumnProp) {
      autoplaceGridItems(decl, result)
    }

    return undefined
  }
}

module.exports = GridRowsColumns

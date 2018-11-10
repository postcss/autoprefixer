let Declaration = require('../declaration')
let {
  prefixTrackProp,
  prefixTrackValue,
  autoplaceGridItems,
  getGridGap,
  inheritGridGap
} = require('./grid-utils')
let Processor = require('../processor')

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
    let isRowProp = prop.includes('rows')
    let isColumnProp = prop.includes('columns')

    let hasGridTemplate = parent.some(i =>
      i.prop === 'grid-template' || i.prop === 'grid-template-areas')

    /**
     * Not to prefix rows declaration if grid-template(-areas) is present
     */
    if (hasGridTemplate && isRowProp) {
      return false
    }

    let processor = new Processor({})
    let status = processor.gridStatus(parent, result)
    let gap = getGridGap(decl)
    gap = inheritGridGap(decl, gap) || gap

    let gapValue = isRowProp ? gap.row : gap.column

    if ((status === 'no-autoplace' || status === true) && !hasGridTemplate) {
      gapValue = null
    }

    let prefixValue = prefixTrackValue({
      value,
      gap: gapValue
    })

    /**
     * Insert prefixes
     */
    decl.cloneBefore({
      prop: prefixTrackProp({ prop, prefix }),
      value: prefixValue
    })

    let autoflow = parent.nodes.find(i => i.prop === 'grid-auto-flow')
    let autoflowValue = 'row'

    if (autoflow && !processor.disabled(autoflow, result)) {
      autoflowValue = autoflow.value.trim()
    }

    /**
     * Show warning if grid-template-rows decl is not found
     */
    let rowDecl = parent.nodes.find(i => i.prop === 'grid-template-rows')

    if (!rowDecl && hasGridTemplate) {
      return undefined
    } else if (!rowDecl && !hasGridTemplate) {
      decl.warn(result,
        `Autoplacement does not work without grid-template-rows property`
      )
      return undefined
    }

    /**
     * Autoplace grid items
     */
    let autoplaceEnabled = status === 'autoplace'
    if (isColumnProp && !hasGridTemplate && autoplaceEnabled) {
      autoplaceGridItems(decl, result, gap, autoflowValue)
    }

    return undefined
  }
}

module.exports = GridRowsColumns

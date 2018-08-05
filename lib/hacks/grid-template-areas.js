let Declaration = require('../declaration')
let {
  parseGridAreas,
  insertAreas,
  prefixTrackProp,
  prefixTrackValue,
  getGridGap,
  warnGridGap,
  warnDuplicateNames,
  inheritGridGap
} = require('./grid-utils')

function getGridRows (tpl) {
  return tpl.trim().slice(1, -1).split(/['"]\s*['"]?/g)
}

class GridTemplateAreas extends Declaration {
  static names = ['grid-template-areas']

  /**
   * Translate grid-template-areas to separate -ms- prefixed properties
   */
  insert (decl, prefix, prefixes, result) {
    if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes)

    let hasColumns = false
    let hasRows = false
    let parent = decl.parent
    let gap = getGridGap(decl)
    let inheritedGap = inheritGridGap(decl, gap)

    // remove already prefixed rows and columns
    // without gutter to prevent doubling prefixes
    parent.walkDecls(/-ms-grid-(rows|columns)/, i => i.remove())

    // add empty tracks to rows and columns
    parent.walkDecls(/grid-template-(rows|columns)/, trackDecl => {
      if (trackDecl.prop === 'grid-template-rows') {
        hasRows = true
        let { prop, value } = trackDecl

        /**
         * we must insert inherited gap values in some cases:
         * if we are inside media query && if we have no grid-gap value
        */
        if (inheritedGap) {
          trackDecl.cloneBefore({
            prop: prefixTrackProp({ prop, prefix }),
            value: prefixTrackValue({ value, gap: inheritedGap.row })
          })
        } else {
          trackDecl.cloneBefore({
            prop: prefixTrackProp({ prop, prefix }),
            value: prefixTrackValue({ value, gap: gap.row })
          })
        }
      } else {
        hasColumns = true
        let { prop, value } = trackDecl

        /**
         * we must insert inherited gap values in some cases:
         * if we are inside media query && if we have no grid-gap value
        */
        if (inheritedGap) {
          trackDecl.cloneBefore({
            prop: prefixTrackProp({ prop, prefix }),
            value: prefixTrackValue({ value, gap: inheritedGap.column })
          })
        } else {
          trackDecl.cloneBefore({
            prop: prefixTrackProp({ prop, prefix }),
            value: prefixTrackValue({ value, gap: gap.column })
          })
        }
      }
    })

    let gridRows = getGridRows(decl.value)

    if (hasColumns && !hasRows && gap.row && gridRows.length > 1) {
      decl.cloneBefore({
        prop: '-ms-grid-rows',
        value: prefixTrackValue({
          value: `repeat(${ gridRows.length }, auto)`,
          gap: gap.row
        }),
        raws: {}
      })
    }

    // warnings
    warnGridGap({
      gap,
      hasColumns,
      decl,
      result
    })

    // warn if grid-template-areas has a duplicate area name
    warnDuplicateNames({ decl, result })

    let areas = parseGridAreas({
      rows: gridRows,
      gap
    })

    insertAreas(areas, decl, result)

    return decl
  }
}

module.exports = GridTemplateAreas

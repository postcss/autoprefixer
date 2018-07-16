const Declaration = require('../declaration')
const {
  parseGridAreas,
  insertAreas,
  prefixTrackProp,
  prefixTrackValue,
  getGridGap,
  warnGridGap
} = require('./grid-utils')

function getGridRows (tpl) {
  return tpl.trim().slice(1, -1).split(/['"]\s*['"]?/g)
}

class GridTemplateAreas extends Declaration {
    static names = ['grid-template-areas'];

    /**
     * Translate grid-template-areas to separate -ms- prefixed properties
     */
    insert (decl, prefix, prefixes, result) {
      if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes)

      let hasColumns = false
      let hasRows = false
      const parent = decl.parent
      const gap = getGridGap(decl)

      // remove already prefixed rows and columns
      // without gutter to prevent doubling prefixes
      parent.walkDecls(/-ms-grid-(rows|columns)/, i => i.remove())

      // add empty tracks to rows and columns
      parent.walkDecls(/grid-template-(rows|columns)/, trackDecl => {
        if (trackDecl.prop === 'grid-template-rows') {
          hasRows = true
          const { prop, value } = trackDecl
          trackDecl.cloneBefore({
            prop: prefixTrackProp({ prop, prefix }),
            value: prefixTrackValue({ value, gap: gap.row })
          })
        } else {
          hasColumns = true
          const { prop, value } = trackDecl
          trackDecl.cloneBefore({
            prop: prefixTrackProp({ prop, prefix }),
            value: prefixTrackValue({ value, gap: gap.column })
          })
        }
      })

      const gridRows = getGridRows(decl.value)

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

      const areas = parseGridAreas({
        rows: gridRows,
        gap
      })

      insertAreas(areas, decl, result)

      return decl
    }
}

module.exports = GridTemplateAreas

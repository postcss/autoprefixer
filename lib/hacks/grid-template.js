const Declaration = require('../declaration')
const {
  parseTemplate,
  insertAreas,
  getGridGap,
  warnGridGap
} = require('./grid-utils')

class GridTemplate extends Declaration {
    static names = [
      'grid-template'
    ];

    /**
     * Translate grid-template to separate -ms- prefixed properties
     */
    insert (decl, prefix, prefixes, result) {
      if (prefix !== '-ms-') return super.insert(decl, prefix, prefixes)

      if (decl.parent.some(i => i.prop === '-ms-grid-rows')) {
        return undefined
      }

      const gap = getGridGap(decl)
      const {
        rows,
        columns,
        areas
      } = parseTemplate({
        decl,
        gap
      })

      const hasAreas = Object.keys(areas).length > 0
      const hasRows = Boolean(rows)
      const hasColumns = Boolean(columns)

      warnGridGap({
        gap,
        hasColumns,
        decl,
        result
      })

      if ((hasRows && hasColumns) || hasAreas) {
        decl.cloneBefore({
          prop: '-ms-grid-rows',
          value: rows,
          raws: { }
        })
      }

      if (hasColumns) {
        decl.cloneBefore({
          prop: '-ms-grid-columns',
          value: columns,
          raws: { }
        })
      }

      if (hasAreas) {
        insertAreas(areas, decl, result)
      }

      return decl
    }
}

module.exports = GridTemplate

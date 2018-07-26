const parser = require('postcss-value-parser')
const list = require('postcss').list

function convert (value) {
  if (value &&
        value.length === 2 &&
        value[0] === 'span' &&
        parseInt(value[1], 10) > 0
  ) {
    return [false, parseInt(value[1], 10)]
  }

  if (value &&
        value.length === 1 &&
        parseInt(value[0], 10) > 0
  ) {
    return [parseInt(value[0], 10), false]
  }

  return [false, false]
}

function translate (values, startIndex, endIndex) {
  const startValue = values[startIndex]
  const endValue = values[endIndex]

  if (!startValue) {
    return [false, false]
  }

  const [start, spanStart] = convert(startValue)
  const [end, spanEnd] = convert(endValue)

  if (start && !endValue) {
    return [start, false]
  }

  if (spanStart && end) {
    return [end - spanStart, spanStart]
  }

  if (start && spanEnd) {
    return [start, spanEnd]
  }

  if (start && end) {
    return [start, end - start]
  }

  return [false, false]
}

function parse (decl) {
  const node = parser(decl.value)

  const values = []
  let current = 0
  values[current] = []

  for (const i of node.nodes) {
    if (i.type === 'div') {
      current += 1
      values[current] = []
    } else if (i.type === 'word') {
      values[current].push(i.value)
    }
  }

  return values
}

function insertDecl (decl, prop, value) {
  if (value && !decl.parent.some(i => i.prop === `-ms-${ prop }`)) {
    decl.cloneBefore({
      prop: `-ms-${ prop }`,
      value: value.toString()
    })
  }
}

// Track transforms

function prefixTrackProp ({ prop, prefix }) {
  return prefix + prop.replace('template-', '')
}

function transformRepeat ({ nodes }, { gap }) {
  const {
    count,
    size
  } = nodes.reduce((result, node) => {
    if (node.type === 'div' && node.value === ',') {
      result.key = 'size'
    } else {
      result[result.key].push(parser.stringify(node))
    }
    return result
  }, {
    key: 'count',
    size: [],
    count: []
  })

  if (gap) {
    const val = []
    for (let i = 1; i <= count; i++) {
      if (gap && i > 1) {
        val.push(gap)
      }
      val.push(size.join())
    }
    return val.join(' ')
  }

  return `(${ size.join('') })[${ count.join('') }]`
}

function prefixTrackValue ({ value, gap }) {
  const result = parser(value)
    .nodes
    .reduce((nodes, node) => {
      if (node.type === 'function' && node.value === 'repeat') {
        return nodes.concat({
          type: 'word',
          value: transformRepeat(node, { gap })
        })
      }
      if (gap && node.type === 'space') {
        return nodes.concat({
          type: 'space',
          value: ' '
        }, {
          type: 'word',
          value: gap
        }, node)
      }
      return nodes.concat(node)
    }, [])

  return parser.stringify(result)
}

/**
 * Parse grid areas from declaration
 * @param Declaration [decl]
 * @return Array<String>
 */
function parseGridTemplateStrings (decl) {
  const template = parseTemplate({ decl, gap: getGridGap(decl) })
  return Object.keys(template.areas)
}

/**
 * Walk through every grid-template(-areas)
 * declaration and try to find non-unique area names (duplicates)
 * @param  {Declaration} decl
 * @param  {Result} result
 * @return {void}
 */
function warnDuplicateNames ({ decl, result }) {
  const rule = decl.parent
  const inMediaRule = !!getParentMedia(rule)
  const areas = parseGridTemplateStrings(decl)
  const root = decl.root()

  // stop if no areas found
  if (areas.length === 0) {
    return false
  }

  root.walkDecls(/grid-template(-areas)?$/g, d => {
    const nodeRule = d.parent
    const nodeRuleMedia = getParentMedia(nodeRule)
    const isEqual = rule.toString() === nodeRule.toString()
    const foundAreas = parseGridTemplateStrings(d)
    const maxIndex = Math.max(root.index(nodeRule), root.index(nodeRuleMedia))
    const isLookingDown = root.index(rule) < maxIndex

    // abort if we outside media rule and walking below our rule
    // (we need to check ONLY the rules that are above)
    if (!inMediaRule && isLookingDown) {
      return false
    }

    // abort if we're in the same rule
    if (isEqual) {
      return false
    }

    // if we're inside media rule, we need to compare selectors
    if (inMediaRule) {
      const selectors = list.comma(nodeRule.selector)
      const selectorIsFound = selectors.some(sel => {
        if (sel === rule.selector) {
          // compare selectors as a comma list
          return true
        } else if (nodeRule.selector === rule.selector) {
          // compare selectors as a whole (e.g. ".i, .j" === ".i, .j")
          return true
        }
        return false
      })

      // stop walking if we found the selector
      if (selectorIsFound) {
        return false
      }
    }

    const duplicates = areas.filter(area => foundAreas.includes(area))
    if (duplicates.length > 0) {
      const word = duplicates.length > 1 ? 'names' : 'name'
      decl.warn(
        result,
        ['',
          `  duplicate area ${ word } detected in rule: ${ rule.selector }`,
          `  duplicate area ${ word }: ${ duplicates.join(', ') }`,
          `  duplicate area names cause unexpected behavior in IE`
        ].join('\n')
      )
      return false
    }
    return undefined
  })
  return undefined
}

// Parse grid-template-areas

const DOTS = /^\.+$/

function track (start, end) {
  return { start, end, span: end - start }
}

function getColumns (line) {
  return line.trim().split(/\s+/g)
}

function parseGridAreas ({
  rows,
  gap
}) {
  return rows.reduce((areas, line, rowIndex) => {
    if (gap.row) rowIndex *= 2

    if (line.trim() === '') return areas

    getColumns(line).forEach((area, columnIndex) => {
      if (DOTS.test(area)) return

      if (gap.column) columnIndex *= 2

      if (typeof areas[area] === 'undefined') {
        areas[area] = {
          column: track(columnIndex + 1, columnIndex + 2),
          row: track(rowIndex + 1, rowIndex + 2)
        }
      } else {
        const { column, row } = areas[area]

        column.start = Math.min(column.start, columnIndex + 1)
        column.end = Math.max(column.end, columnIndex + 2)
        column.span = column.end - column.start

        row.start = Math.min(row.start, rowIndex + 1)
        row.end = Math.max(row.end, rowIndex + 2)
        row.span = row.end - row.start
      }
    })

    return areas
  }, {})
}

// Parse grid-template

function testTrack (node) {
  return node.type === 'word' && /^\[.+\]$/.test(node.value)
}

function verifyRowSize (result) {
  if (result.areas.length > result.rows.length) {
    result.rows.push('auto')
  }
  return result
}

function parseTemplate ({
  decl,
  gap
}) {
  const gridTemplate = parser(decl.value)
    .nodes
    .reduce((result, node) => {
      const { type, value } = node

      if (testTrack(node) || type === 'space') return result

      // area
      if (type === 'string') {
        result = verifyRowSize(result)
        result.areas.push(value)
      }

      // values and function
      if (type === 'word' || type === 'function') {
        result[result.key].push(parser.stringify(node))
      }

      // devider(/)
      if (type === 'div' && value === '/') {
        result.key = 'columns'
        result = verifyRowSize(result)
      }

      return result
    }, {
      key: 'rows',
      columns: [],
      rows: [],
      areas: []
    })

  return {
    areas: parseGridAreas({
      rows: gridTemplate.areas,
      gap
    }),
    columns: prefixTrackValue({
      value: gridTemplate.columns.join(' '),
      gap: gap.column
    }),
    rows: prefixTrackValue({
      value: gridTemplate.rows.join(' '),
      gap: gap.row
    })
  }
}

// Insert parsed grid areas

function getMSDecls (area) {
  return [].concat(
    {
      prop: '-ms-grid-row',
      value: String(area.row.start)
    },
    area.row.span > 1 ? {
      prop: '-ms-grid-row-span',
      value: String(area.row.span)
    } : [],
    {
      prop: '-ms-grid-column',
      value: String(area.column.start)
    },
    area.column.span > 1 ? {
      prop: '-ms-grid-column-span',
      value: String(area.column.span)
    } : []
  )
}

function getParentMedia (parent) {
  if (parent.type === 'atrule' && parent.name === 'media') {
    return parent
  } else if (!parent.parent) {
    return false
  }
  return getParentMedia(parent.parent)
}

function insertAreas (areas, decl, result) {
  let missed = Object.keys(areas)

  const parentMedia = getParentMedia(decl.parent)
  const rules = []
  const areasLength = Object.keys(areas).length
  let areasCount = 0

  decl.root().walkDecls('grid-area', gridArea => {
    const value = gridArea.value
    const area = areas[value]

    missed = missed.filter(e => e !== value)

    if (area && parentMedia) {
      // create new rule
      const rule = decl.parent.clone({
        selector: gridArea.parent.selector
      })
      rule.removeAll()

      // insert prefixed decls in new rule
      getMSDecls(area)
        .forEach(i => rule.append(
          Object.assign(i, {
            raws: {
              between: gridArea.raws.between
            }
          })
        ))

      rules.push(rule)
      areasCount++
      if (areasCount === areasLength) {
        const next = gridArea.parent.next()

        if (
          next &&
                    next.type === 'atrule' &&
                    next.name === 'media' &&
                    next.params === parentMedia.params &&
                    next.first.type === 'rule' &&
                    next.first.selector && parentMedia.first.selector &&
                    /^-ms-/.test(next.first.first.prop)
        ) return undefined

        const areaParentMedia = getParentMedia(gridArea.parent)
        const areaMedia = parentMedia.clone().removeAll().append(rules)
        if (areaParentMedia) {
          areaParentMedia.after(areaMedia)
        } else {
          gridArea.parent.after(areaMedia)
        }
      }

      return undefined
    }

    if (area) {
      gridArea.parent
        .walkDecls(/-ms-grid-(row|column)/, d => {
          d.remove()
        })

      // insert prefixed decls before grid-area
      getMSDecls(area).forEach(i => gridArea.cloneBefore(i))
    }

    return undefined
  })

  if (missed.length > 0) {
    decl.warn(result, 'Can not find grid areas: ' + missed.join(', '))
  }
}

// Gap utils

function getGridGap (decl) {
  const gap = {}

  // try to find gap
  const testGap = /^(grid-)?((row|column)-)?gap$/
  decl.parent.walkDecls(testGap, ({ prop, value }) => {
    if (/^(grid-)?gap$/.test(prop)) {
      const [row = {},, column = {}] = parser(value).nodes

      gap.row = row.value
      gap.column = column.value || row.value
    }
    if (/^(grid-)?row-gap$/.test(prop)) gap.row = value
    if (/^(grid-)?column-gap$/.test(prop)) gap.column = value
  })

  return gap
}

function warnGridGap ({
  gap,
  hasColumns,
  decl,
  result
}) {
  const hasBothGaps = gap.row && gap.column
  if (!hasColumns && (hasBothGaps || (gap.column && !gap.row))) {
    delete gap.column
    decl.warn(
      result,
      'Can not impliment grid-gap without grid-tamplate-columns'
    )
  }
}

module.exports = {
  parse,
  translate,
  parseTemplate,
  parseGridAreas,
  insertAreas,
  insertDecl,
  prefixTrackProp,
  prefixTrackValue,
  getGridGap,
  warnGridGap,
  warnDuplicateNames
}

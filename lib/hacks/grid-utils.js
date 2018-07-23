const parser = require('postcss-value-parser')
const regexp = require('../utils').regexp
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
 * Check if css identifier is valid
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
 * @param String [identifier]
 * @return RegExp
 */
function isValidCssIdentifier (identifier) {
  const h = '[0-9a-f]'
  const unicode = `\\\\${ h }{1,6}(\\r\\n|[ \\t\\r\\n\\f])?`
  const escape = `(${ unicode }|\\\\[^\\r\\n\\f0-9a-f])`
  const nonascii = `[\\240-\\377]`
  const nmchar = `([_a-z0-9-]|${ nonascii }|${ escape })`
  const nmstart = `([_a-z]|${ nonascii }|${ escape })`
  const identifierRegexp = `-?${ nmstart }${ nmchar }*`

  return new RegExp(identifierRegexp).test(identifier)
}

/**
 * Parse grid-area identifiers
 * @param Declaration [decl]
 * @return Array<String>
 */
function parseGridAreaIdentifiers (decl) {
  const parsed = parser(decl.value)
  const identifiers = []
  parsed.walk(({ value, type }) => {
    if (type === 'word' && value !== 'span' && isValidCssIdentifier(value)) {
      identifiers.push(value)
    }
  })
  return identifiers
}

/**
 * Parse all grid-template(-areas) strings and return an array
 * @param Declaration [decl]
 * @return Array<String>
 */
function parseGridTemplateStrings (decl) {
  const result = []
  decl.root().walkDecls(/grid-template(-areas)?$/, d => {
    const media = getParentMedia(d.parent)
    if (!media) {
      const gap = getGridGap(decl)
      const template = parseTemplate({ decl: d, gap })
      const keys = Object.keys(template.areas)
      if (keys.length > 0) {
        result.push(keys.join(' '))
      }
    }
  })
  return result
}

/**
 * Find non-unique grid-area identifiers from declaration
 * @param Declaration [decl]
 * @return Array<String>
 */
function findNonUniqueAreaIdentifiers (decl) {
  const parent = decl.parent
  const media = getParentMedia(parent)
  const root = decl.root()

  if (media) {
    // break selector into list (e.g. ['.foo', '.bar'])
    const selectorList = list.comma(parent.selector)
    let shouldWarn = true
    // for every selector string
    for (const sel of selectorList) {
      // walk through every rule
      root.walkRules(rule => {
        const isEqual = parent.toString() === rule.toString()
        // if selectors are the same && we're not on the same rule
        if (rule.selector === sel && !isEqual) {
          rule.walkDecls('grid-area', d => {
            // compare declarations
            if (d.value === decl.value) {
              shouldWarn = false
            }
          })
        }
      })
    }
    if (!shouldWarn) {
      return false
    }
  }

  const customIdentifiers = parseGridAreaIdentifiers(decl)
  if (customIdentifiers.length > 0) {
    // parse grid-template strings from all rules
    const gridStrings = parseGridTemplateStrings(decl)

    // find non-unique items by filtering
    const result = customIdentifiers.filter(identifier => {
      let found = false
      return gridStrings.some((str, index) => {
        if (regexp(identifier, false).test(str) && found && index > 0) {
          return true
        } else if (regexp(identifier, false).test(str)) {
          found = true
        }
        return false
      })
    })
    return result
  }
  return false
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
  findNonUniqueAreaIdentifiers
}

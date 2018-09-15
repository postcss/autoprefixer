let parser = require('postcss-value-parser')
let list = require('postcss').list
let uniq = require('../utils').uniq

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
  let startValue = values[startIndex]
  let endValue = values[endIndex]

  if (!startValue) {
    return [false, false]
  }

  let [start, spanStart] = convert(startValue)
  let [end, spanEnd] = convert(endValue)

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
  let node = parser(decl.value)

  let values = []
  let current = 0
  values[current] = []

  for (let i of node.nodes) {
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
  let {
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
    let val = []
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
  let result = parser(value)
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

// Parse grid-template-areas

let DOTS = /^\.+$/

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
        let { column, row } = areas[area]

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
  let gridTemplate = parser(decl.value)
    .nodes
    .reduce((result, node) => {
      let { type, value } = node

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

/**
 * Get an array of -ms- prefixed props and values
 * @param  {Object} [area] area object with columm and row data
 * @param  {Boolean} [addRowSpan] should we add grid-column-row value?
 * @param  {Boolean} [addColumnSpan] should we add grid-column-span value?
 * @return {Array<Object>}
 */
function getMSDecls (area, addRowSpan = false, addColumnSpan = false) {
  return [].concat(
    {
      prop: '-ms-grid-row',
      value: String(area.row.start)
    },
    (area.row.span > 1 || addRowSpan) ? {
      prop: '-ms-grid-row-span',
      value: String(area.row.span)
    } : [],
    {
      prop: '-ms-grid-column',
      value: String(area.column.start)
    },
    (area.column.span > 1 || addColumnSpan) ? {
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

/**
 * change selectors for rules with duplicate grid-areas.
 * @param  {Array<Rule>} rules
 * @param  {Array<String>} templateSelectors
 * @return {Array<Rule>} rules with changed selectors
 */
function changeDuplicateAreaSelectors (ruleSelectors, templateSelectors) {
  ruleSelectors = ruleSelectors.map(selector => {
    let selectorBySpace = list.space(selector)
    let selectorByComma = list.comma(selector)

    if (selectorBySpace.length > selectorByComma.length) {
      selector = selectorBySpace.slice(-1).join('')
    }
    return selector
  })

  return ruleSelectors.map(ruleSelector => {
    let newSelector = templateSelectors.map((tplSelector, index) => {
      let space = index === 0 ? '' : ' '
      return `${ space }${ tplSelector } > ${ ruleSelector }`
    })

    return newSelector
  })
}

// TODO: add more comments to explain what's going on with the code
// TODO: refactoring
function insertAreas (css) {
  let gridTemplatesData = []
  css.walkDecls(/grid-template(-areas)?$/, d => {
    let rule = d.parent
    let media = getParentMedia(rule)
    let { areas } = parseTemplate({ decl: d, gap: getGridGap(d) })
    let areaNames = Object.keys(areas)

    if (areaNames.length === 0) {
      return true
    }

    let index = gridTemplatesData.reduce((acc, { allAreas }, idx) => {
      let hasAreas = allAreas && areaNames.some(area => allAreas.includes(area))
      return hasAreas ? idx : acc
    }, null)

    if (index !== null) {
      let { allAreas, rules } = gridTemplatesData[index]
      // chack if rule has any duplicate area names
      let hasNoDuplicates = rules.some(r => {
        let isEqual = r.selectors.some(sel => {
          return rule.selectors.some(s => s === sel)
        })
        return (r.hasDuplicates === false) && isEqual
      })

      let duplicatesFound = false
      let duplicateAreaNames = rules.reduce((acc, r) => {
        let isEqual = r.selectors.some(sel => {
          return rule.selectors.some(s => s === sel)
        })

        if (!r.params && isEqual) {
          duplicatesFound = true
          return r.duplicateAreaNames
        }

        if (!duplicatesFound) {
          areaNames.forEach(name => {
            if (r.areas[name]) {
              acc.push(name)
            }
          })
        }

        return uniq(acc)
      }, [])

      gridTemplatesData[index].allAreas = uniq([...allAreas, ...areaNames])
      gridTemplatesData[index].rules.push({
        hasDuplicates: !hasNoDuplicates,
        params: media.params,
        selectors: rule.selectors,
        node: rule,
        duplicateAreaNames,
        areas
      })
    } else {
      gridTemplatesData.push({
        allAreas: areaNames,
        areasCount: 0,
        rules: [{
          hasDuplicates: false,
          duplicateRules: [],
          params: media.params,
          selectors: rule.selectors,
          node: rule,
          duplicateAreaNames: [],
          areas
        }]
      })
    }

    return undefined
  })

  if (gridTemplatesData.length === 0) {
    return undefined
  }

  let rulesToInsert = {}

  css.walkDecls('grid-area', gridArea => {
    let gridAreaRule = gridArea.parent
    let hasPrefixedRow = gridAreaRule.first.prop === '-ms-grid-row'

    // prevent doubling of prefixes
    if (hasPrefixedRow) {
      return false
    }

    let gridAreaMedia = getParentMedia(gridAreaRule)

    let gridAreaRuleIndex =
      gridAreaMedia ? css.index(gridAreaMedia) : css.index(gridAreaRule)

    let value = gridArea.value
    // console.log(!!gridTemplatesData)
    let data = gridTemplatesData.filter(d => d.allAreas.includes(value))[0]

    let lastArea = data.allAreas[data.allAreas.length - 1]
    let selectorBySpace = list.space(gridAreaRule.selector)
    let selectorByComma = list.comma(gridAreaRule.selector)
    let selectorIsComplex = (
      (selectorBySpace.length > 1) &&
      (selectorBySpace.length > selectorByComma.length)
    )

    for (let rule of data.rules) {
      let area = rule.areas[value]
      let hasDuplicateName = rule.duplicateAreaNames.includes(value)

      if (!rulesToInsert[lastArea]) {
        rulesToInsert[lastArea] = {}
      }

      if (rule.params && !rulesToInsert[lastArea][rule.params]) {
        rulesToInsert[lastArea][rule.params] = []
      }

      if (area && (!rule.hasDuplicates || !hasDuplicateName) && !rule.params) {
        getMSDecls(area, false, false).reverse()
          .forEach(i => gridAreaRule.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea.raws.between
              }
            })
          ))

        rulesToInsert[lastArea].lastRule = gridAreaRule
      } else if (
        area &&
        rule.hasDuplicates &&
        !rule.params &&
        !selectorIsComplex
      ) {
        let cloned = gridAreaRule.clone()
        cloned.removeAll()

        getMSDecls(area, false, false).reverse()
          .forEach(i => cloned.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea.raws.between
              }
            })
          ))

        cloned.selectors = (
          changeDuplicateAreaSelectors(cloned.selectors, rule.selectors)
        )

        if (rulesToInsert[lastArea].lastRule) {
          rulesToInsert[lastArea].lastRule.after(cloned)
        }
        rulesToInsert[lastArea].lastRule = cloned
      } else if (
        area &&
        rule.hasDuplicates &&
        !rule.params &&
        selectorIsComplex &&
        gridAreaRule.selector.includes(rule.selectors[0])
      ) {
        gridAreaRule.walkDecls(/-ms-grid-(row|column)/, d => d.remove())

        getMSDecls(area, false, false).reverse()
          .forEach(i => gridAreaRule.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea.raws.between
              }
            })
          ))
      } else if (area && rule.params) {
        let cloned = gridAreaRule.clone()
        cloned.removeAll()

        // check if we need to add -ms-grid-row/column-span values
        // by comparing areas for rules with the same selectors
        let [addRowSpan, addColumnSpan] = data.rules.reduce(
          (acc, { areas, selectors }) => {
            if (!areas[value]) {
              return acc
            }
            let isEqual = selectors.some(sel =>
              rule.selectors.some(s => s === sel))
            if (isEqual && areas[value].row.span !== area.row.span) {
              acc[0] = true
            }
            if (isEqual && areas[value].column.span !== area.column.span) {
              acc[1] = true
            }
            return acc
          },
          [false, false]
        )

        getMSDecls(area, addRowSpan, addColumnSpan).reverse()
          .forEach(i => cloned.prepend(
            Object.assign(i, {
              raws: {
                between: gridArea.raws.between
              }
            })
          ))

        if (rule.hasDuplicates && hasDuplicateName) {
          cloned.selectors = (
            changeDuplicateAreaSelectors(cloned.selectors, rule.selectors)
          )
        }
        cloned.raws = rule.node.raws

        if (css.index(rule.node.parent) > gridAreaRuleIndex) {
          rule.node.parent.append(cloned)
        } else {
          rulesToInsert[lastArea][rule.params].push(cloned)
        }

        if (gridAreaMedia) {
          rulesToInsert[lastArea].lastRule = gridAreaMedia || gridAreaRule
        }
      } else {
        let lastRuleIndex = css.index(rulesToInsert[lastArea].lastRule)
        if (gridAreaRuleIndex > lastRuleIndex) {
          rulesToInsert[lastArea].lastRule = gridAreaMedia || gridAreaRule
        }
      }
    }

    return undefined
  })

  Object.keys(rulesToInsert).forEach(area => {
    let data = rulesToInsert[area]
    let lastRule = data.lastRule
    Object.keys(data)
      .reverse()
      // TODO: this filtering is not good
      .filter(p => p !== 'lastRule')
      .forEach(params => {
        if (data[params].length > 0 && lastRule) {
          lastRule.after({ name: 'media', nodes: data[params], params })
        }
      })
  })

  return undefined
}

/**
 * Warn user if grid area identifiers are not found
 * @param  {Object} areas
 * @param  {Declaration} decl
 * @param  {Result} result
 * @return {void}
 */
function warnMissedAreas (areas, decl, result) {
  let missed = Object.keys(areas)

  decl.root().walkDecls('grid-area', gridArea => {
    missed = missed.filter(e => e !== gridArea.value)
  })

  if (missed.length > 0) {
    decl.warn(result, 'Can not find grid areas: ' + missed.join(', '))
  }

  return undefined
}

/**
 * compare selectors with grid-area rule and grid-template rule
 * show warning if grid-template selector is not found
 * (this function used for grid-area rule)
 * @param  {Declaration} decl
 * @param  {Result} result
 * @return {void}
 */
function warnTemplateSelectorNotFound (decl, result) {
  let rule = decl.parent
  let root = decl.root()

  // slice selector array. Remove the last part (for comparison)
  let slicedSelectorArr = list
    .space(rule.selector)
    .filter(str => str !== '>')
    .slice(0, -1)

  // we need to compare only if selector is complex.
  // e.g '.grid-cell' is simple, but '.parent > .grid-cell' is complex
  if (slicedSelectorArr.length > 0) {
    let gridTemplateFound = false

    root.walkDecls(/grid-template(-areas)?$/, d => {
      let parent = d.parent
      let templateSelectors = parent.selectors

      for (let tplSelector of templateSelectors) {
        if (gridTemplateFound) {
          break
        }
        let tplSelectorArr = list
          .space(tplSelector)
          .filter(str => str !== '>')

        gridTemplateFound = tplSelectorArr.every(
          (item, idx) => item === slicedSelectorArr[idx]
        )
      }

      if (gridTemplateFound) {
        return true
      }

      return undefined
    })

    // warn user if we didn't find template
    if (!gridTemplateFound) {
      decl.warn(
        result,
        `Autoprefixer cannot find ` +
        `grid-template with selector: ${ slicedSelectorArr.join(' ') }`
      )
    }
  }
}

// Gap utils

function getGridGap (decl) {
  let gap = {}

  // try to find gap
  let testGap = /^(grid-)?((row|column)-)?gap$/
  decl.parent.walkDecls(testGap, ({ prop, value }) => {
    if (/^(grid-)?gap$/.test(prop)) {
      let [row = {},, column = {}] = parser(value).nodes

      gap.row = row.value
      gap.column = column.value || row.value
    }
    if (/^(grid-)?row-gap$/.test(prop)) gap.row = value
    if (/^(grid-)?column-gap$/.test(prop)) gap.column = value
  })

  return gap
}

/**
 * parse media parameters (for example 'min-width: 500px')
 * @param  {String} params parameter to parse
 * @return {}
 */
function parseMediaParams (params) {
  let parsed = parser(params)
  let prop
  let value

  parsed.walk(node => {
    if (node.type === 'word' && /min|max/g.test(node.value)) {
      prop = node.value
    } else if (node.value.includes('px')) {
      value = parseInt(node.value.replace(/\D/g, ''))
    }
  })

  return [prop, value]
}

/**
 * inherit grid gap values from the closest rule above
 * with the same selector
 * @param  {Declaration} decl
 * @param  {Object} gap gap values
 * @return {Object | Boolean} return gap values or false (if not found)
 */
function inheritGridGap (decl, gap) {
  let rule = decl.parent
  let mediaRule = getParentMedia(rule)
  let root = rule.root()
  if (Object.keys(gap).length > 0 || !mediaRule) {
    return false
  }

  // e.g ['min-width']
  let [prop] = parseMediaParams(mediaRule.params)

  // find the closest rule with the same selector
  let closestRuleGap
  root.walkRules(rule.selector, r => {
    let gridGap

    // abort if checking the same rule
    if (rule.toString() === r.toString()) {
      return false
    }

    // find grid-gap values
    r.walkDecls('grid-gap', d => (gridGap = getGridGap(d)))

    // skip rule without gaps
    if (!gridGap || Object.keys(gridGap).length === 0) {
      return true
    }

    let media = getParentMedia(r)

    if (media) {
      // if we are inside media, we need to check that media props match
      // e.g ('min-width' === 'min-width')
      let propToCompare = parseMediaParams(media.params)[0]
      if (propToCompare === prop) {
        closestRuleGap = gridGap
        return true
      }
    } else {
      closestRuleGap = gridGap
      return true
    }

    return undefined
  })

  // if we find the closest gap object
  if (closestRuleGap && Object.keys(closestRuleGap).length > 0) {
    return closestRuleGap
  } else {
    return false
  }
}

function warnGridGap ({
  gap,
  hasColumns,
  decl,
  result
}) {
  let hasBothGaps = gap.row && gap.column
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
  warnMissedAreas,
  insertAreas,
  insertDecl,
  prefixTrackProp,
  prefixTrackValue,
  getGridGap,
  warnGridGap,
  warnTemplateSelectorNotFound,
  inheritGridGap
}

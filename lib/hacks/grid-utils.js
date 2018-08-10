let parser = require('postcss-value-parser')
let list = require('postcss').list

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

/**
 * Parse grid areas from declaration
 * @param Declaration [decl]
 * @return Array<String>
 */
function parseGridTemplateStrings (decl) {
  let template = parseTemplate({ decl, gap: getGridGap(decl) })
  return Object.keys(template.areas)
}

/**
 * Walk through every grid-template(-areas)
 * declaration and try to find non-unique area names (duplicates)
 * @param  {Declaration} decl
 * @return {<Array<Array<String>>, Boolean>}
 */
function getDuplicateAreaNames (decl) {
  let rule = decl.parent
  let inMediaRule = !!getParentMedia(rule)
  let areas = parseGridTemplateStrings(decl)
  let root = decl.root()
  let duplicates = []
  let sameSelector = false

  root.walkDecls(/grid-template(-areas)?$/g, d => {
    // abort if we found all duplicates
    if (duplicates.length === areas.length) {
      return false
    }

    let nodeRule = d.parent
    let isEqual = rule.toString() === nodeRule.toString()
    let foundAreas = parseGridTemplateStrings(d)

    // skip node if no grid areas is found
    if (foundAreas.length === 0) {
      return true
    }

    // abort if we're in the same rule
    if (isEqual) {
      return false
    }

    // if we're inside media rule, we need to compare selectors
    if (inMediaRule) {
      // TODO: refactor this line when everything working
      let selectors = list.comma(nodeRule.selector)
      let selectorIsFound = selectors.some(sel => {
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
        sameSelector = true
      } else {
        sameSelector = false
      }
    }

    // for each found erea
    foundAreas.forEach(area => {
      if (areas.includes(area) && !duplicates.includes(area)) {
        duplicates.push(area)
      }
    })

    return undefined
  })

  return [duplicates, sameSelector]
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
 * Check grid-template(-areas) rules with the same selector for
 * -ms-grid-(row|column)-span values. If initial and compared values are
 * different - return an array of boolean values which need to be updated
 * @param  {Declaration} decl
 * @param  {Object} area area object with column and row data
 * @param  {String} areaName area name (e.g. "head")
 * @return {Array<Boolean, Boolean>}
 */
function shouldAddSpan (decl, area, areaName) {
  const root = decl.root()
  const rule = decl.parent
  const overrideValues = [false, false]

  root.walkRules(rule.selector, node => {
    // abort if we are on the same rule
    if (rule.toString() === node.toString()) {
      return false
    }

    // TODO: this should be regexp
    node.walkDecls('grid-template', d => {
      const template = parseTemplate({ decl: d, gap: getGridGap(d) })
      const comparedArea = template.areas[areaName]

      if (!comparedArea) {
        return true
      }

      if (area.row.span !== comparedArea.row.span) {
        overrideValues[0] = true
      }

      if (area.column.span !== comparedArea.column.span) {
        overrideValues[1] = true
      }

      return undefined
    })

    return undefined
  })

  return overrideValues
}

/**
 * search the next siblings and find the latest close rule with
 * the same selectors inside
 * @param  {Rule | AtRule} rule
 * @param  {Array<String>} selectors
 * @param  {Function<Rule>} onNextCallback
 * @return {Rule | AtRule}
 */
function getLastSimilarRule (rule, selectors, ruleToCompare) {
  if (!rule) {
    return false
  }

  let { type, name } = rule

  if (type === 'rule') {
    let hasPrefixedRow = rule.first.prop === '-ms-grid-row'
    let selectorMatch = selectors.some(sel => {
      return rule.selectors.some(s => {
        return s.includes(sel)
      })
    })
    if (selectorMatch && hasPrefixedRow) {
      return getLastSimilarRule(rule.next(), selectors, ruleToCompare)
    } else {
      return rule.prev()
    }
  } else if (type === 'atrule' && name === 'media') {
    let hasPrefixedRow = rule.first.first.prop === '-ms-grid-row'
    let selectorsToCompare = []
    // TODO: ask about bug with when selector is array
    rule.walkRules(r => {
      let sel = r.selector
      if (typeof sel === 'string') {
        return selectorsToCompare.push(sel)
      } else {
        return selectorsToCompare.push(sel[0])
      }
    })

    // check if every selector match
    let selectorsEqual = selectors.every((sel, index) => {
      return selectorsToCompare[index].includes(sel)
    })

    if (selectorsEqual && hasPrefixedRow) {
      // to check the next rule
      return getLastSimilarRule(rule.next(), selectors, ruleToCompare)
    } else {
      // or return the last similar media
      return rule.prev()
    }
  } else {
    return rule.prev()
  }
}

/**
 * change selectors for rules with duplicate grid-areas
 * @param  {Array<Rule>} rules
 * @param  {Array<String>} templateSelectors
 * @return {Array<Rule>} rules with changed selectors
 */
function changeDuplicateAreaSelectors (rules, templateSelectors) {
  return rules.map(rule => {
    let newSelectors = templateSelectors.map((tplSelector, index) => {
      let space = index === 0 ? '' : ' '

      let result = rule.selectors.map((ruleSelector, idx) => {
        let innerSpace = idx === 0 ? '' : ' '
        return `${ innerSpace }${ tplSelector } > ${ ruleSelector }`
      })

      return space + result
    })

    rule.selector = newSelectors
    return rule
  })
}

function insertAreas (areas, decl, result) {
  let missed = Object.keys(areas)

  let parentMedia = getParentMedia(decl.parent)
  let rules = []
  let areasLength = Object.keys(areas).length
  let areasCount = 0

  let [duplicates, sameSelector] = getDuplicateAreaNames(decl)
  let hasDuplicates = duplicates.length > 0

  decl.root().walkDecls('grid-area', gridArea => {
    let areaParentMedia = getParentMedia(gridArea.parent)
    let value = gridArea.value
    let area = areas[value]

    missed = missed.filter(e => e !== value)

    // create new rule
    let rule = decl.parent.clone({
      selector: gridArea.parent.selector
    })
    rule.removeAll()

    if (area && parentMedia) {
      // insert prefixed decls in new rule
      const [addRowSpan, addColumnSpan] = shouldAddSpan(decl, area, value)
      getMSDecls(area, addRowSpan, addColumnSpan)
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
        let next = gridArea.parent.next()
        let selectors = rules.map(r => r.selector)
        let lastSimilarRule = getLastSimilarRule(next, selectors)

        if (hasDuplicates && !sameSelector) {
          let templateSelectors = decl.parent.selectors
          rules = (
            changeDuplicateAreaSelectors(rules, templateSelectors)
          )
        }

        // prevent doubling media rules with this condition
        if (
          next &&
          next.type === 'atrule' &&
          next.name === 'media' &&
          next.params === parentMedia.params &&
          next.first.type === 'rule' &&
          next.first.selector && parentMedia.first.selector &&
          next.first.selector === rules[0].selector &&
          /^-ms-/.test(next.first.first.prop)
        ) {
          return undefined
        }

        // prevent doubling media rules with this condition
        let hasDuplicateRules = rules.some(r => {
          let duplicateMedia = (
            lastSimilarRule &&
            lastSimilarRule.type === 'atrule' &&
            lastSimilarRule.name === 'media' &&
            lastSimilarRule.first.type === 'rule' &&
            lastSimilarRule.params === parentMedia.params &&
            (lastSimilarRule.first.selector.toString() ===
            r.selector.toString()) &&
            /^-ms-/.test(lastSimilarRule.first.first.prop)
          )

          return duplicateMedia
        })

        if (hasDuplicateRules) {
          return false
        }
        let areaMedia = parentMedia.clone().removeAll().append(rules)

        if (areaParentMedia) {
          // insert after @media
          areaParentMedia.after(areaMedia)
        } else {
          // insert after every other Rule
          // insert after the closest rule with the same selectors
          lastSimilarRule.after(areaMedia)
        }
      }

      return undefined
    }

    if (area && !parentMedia) {
      if (!hasDuplicates) {
        gridArea.parent
          .walkDecls(/-ms-grid-(row|column)/, d => {
            d.remove()
          })

        // insert prefixed decls before grid-area
        getMSDecls(area).forEach(i => gridArea.cloneBefore(i))
      }

      getMSDecls(area, false, false)
        .forEach(i => rule.append(
          Object.assign(i, {
            raws: {
              between: gridArea.raws.between
            }
          })
        ))

      if (!areaParentMedia) {
        rules.push(rule)
        areasCount++
      }

      if ((areasLength === areasCount) && hasDuplicates) {
        let gridAreaSelector = gridArea.parent.selector
        let selectorBySpaceLength = list.space(gridAreaSelector).length
        let selectorByCommaLength = list.comma(gridAreaSelector).length

        if (selectorBySpaceLength > 1 && selectorByCommaLength === 1) {
          return false
        }

        let next = gridArea.parent.next()

        // prevent doubling media rules with this condition
        let selectors = rules.map(r => r.selector)
        let lastSimilarRule = getLastSimilarRule(next, selectors, rules[0])

        let templateSelectors = decl.parent.selectors
        rules = (
          changeDuplicateAreaSelectors(rules, templateSelectors)
        )

        let hasDuplicateRules = rules.some(r => {
          let duplicateMedia = (
            lastSimilarRule &&
            lastSimilarRule.type === 'atrule' &&
            lastSimilarRule.name === 'media' &&
            lastSimilarRule.first.type === 'rule' &&
            (lastSimilarRule.first.selector.toString() ===
            r.selector.toString()) &&
            /^-ms-/.test(lastSimilarRule.first.first.prop)
          )

          let duplicateRule = (
            lastSimilarRule &&
            lastSimilarRule.type === 'rule' &&
            (lastSimilarRule.selector.toString() ===
            r.selector.toString()) &&
            /^-ms-/.test(lastSimilarRule.first.prop)
          )

          return duplicateMedia || duplicateRule
        })

        if (hasDuplicateRules) {
          return false
        }

        if (lastSimilarRule) {
          lastSimilarRule.after(rules)
        }

        return false
      }
    }

    return undefined
  })

  /**
   * show warning if no grid-area identifiers found in the area template
   */
  if (missed.length > 0) {
    decl.warn(result, 'Can not find grid areas: ' + missed.join(', '))
  }

  /**
   * show warning duplicate area names are found
   * (only if duplicated found in the differen selector)
   */
  if (hasDuplicates && !sameSelector) {
    let word = duplicates.length > 1 ? 'names' : 'name'
    let rule = decl.parent
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

  // slice selector array. Remove the last part (for comparison)
  let slicedSelectorArr = list
    .space(rule.selector)
    .filter(str => str !== '>')
    .slice(0, -1)

  // we need to compare only if selector is complex.
  // e.g '.grid-cell' is simple, but '.parent > .grid-cell' is complex
  if (slicedSelectorArr.length > 0) {
    let gridTemplateFound = false

    decl.root().walkDecls(/grid-template(-areas)?$/, d => {
      let templateSelectors = d.parent.selectors

      for (let tplSelector of templateSelectors) {
        let tplSelectorArr = list
          .space(tplSelector)
          .filter(str => str !== '>')

        gridTemplateFound = tplSelectorArr.every(
          (item, idx) => item === slicedSelectorArr[idx]
        )
      }

      if (gridTemplateFound) {
        return false
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
  insertAreas,
  insertDecl,
  prefixTrackProp,
  prefixTrackValue,
  getGridGap,
  warnGridGap,
  warnTemplateSelectorNotFound,
  getDuplicateAreaNames,
  inheritGridGap
}

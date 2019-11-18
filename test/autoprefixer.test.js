let postcss = require('postcss')
let path = require('path')
let fs = require('fs')

let autoprefixer = require('../lib/autoprefixer')

let grider = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Edge 12', 'IE 10'],
  cascade: false,
  grid: 'autoplace'
})

let cleaner = autoprefixer({
  overrideBrowserslist: []
})
let compiler = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Opera 12']
})
let filterer = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Safari 9', 'Firefox 39']
})
let borderer = autoprefixer({
  overrideBrowserslist: ['Safari 4', 'Firefox 3.6']
})
let cascader = autoprefixer({
  overrideBrowserslist: ['Chrome > 19', 'Firefox 21', 'IE 10'],
  cascade: true
})
let keyframer = autoprefixer({
  overrideBrowserslist: ['Chrome > 19', 'Opera 12']
})
let flexboxer = autoprefixer({
  overrideBrowserslist: ['Chrome > 19', 'Firefox 21', 'IE 10']
})
let without3d = autoprefixer({
  overrideBrowserslist: ['Opera 12', 'IE > 0']
})
let supporter = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Chrome 28', 'IE > 0']
})
let uncascader = autoprefixer({
  overrideBrowserslist: ['Firefox 15']
})
let gradienter = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Opera 12', 'Android 2.3']
})
let grouping = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Firefox > 17', 'IE 10', 'Edge 12'],
  grid: 'autoplace'
})
let ffgradienter = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Opera 12', 'Firefox 6']
})
let selectorer = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Firefox > 17', 'IE 10', 'Edge 12']
})
let transitionSpec = autoprefixer({
  overrideBrowserslist: ['Chrome > 19', 'Firefox 14', 'IE 10', 'Opera 12']
})
let intrinsicer = autoprefixer({
  overrideBrowserslist: ['Chrome 25', 'Firefox 22', 'Safari 10']
})
let imagerender = autoprefixer({
  overrideBrowserslist: ['iOS 8', 'iOS 6.1', 'FF 22', 'IE 11', 'Opera 12']
})
let backgrounder = autoprefixer({
  overrideBrowserslist: ['Firefox 3.6', 'Android 2.3']
})
let resolutioner = autoprefixer({
  overrideBrowserslist: ['Safari 7', 'Opera 12', 'Firefox 15']
})
let overscroller = autoprefixer({
  overrideBrowserslist: ['Edge 17']
})
let clipper = autoprefixer({
  overrideBrowserslist: ['Safari 7', 'Edge 14']
})

function prefixer (name) {
  if (
    name === 'grid' ||
    name === 'grid-gap' ||
    name === 'grid-area' ||
    name === 'grid-template' ||
    name === 'grid-template-areas'
  ) {
    return grider
  } else if (name === 'keyframes') {
    return keyframer
  } else if (name === 'border-radius') {
    return borderer
  } else if (name === 'vendor-hack' || name === 'value-hack') {
    return cleaner
  } else if (name === 'mistakes') {
    return cleaner
  } else if (name === 'gradient') {
    return gradienter
  } else if (name === 'gradient-fix') {
    return ffgradienter
  } else if (name === 'grouping-rule') {
    return grouping
  } else if (name === 'flexbox' || name === 'flex-rewrite') {
    return flexboxer
  } else if (name === 'double') {
    return flexboxer
  } else if (name === 'selectors' || name === 'placeholder') {
    return selectorer
  } else if (name === 'intrinsic' || name === 'multicolumn') {
    return intrinsicer
  } else if (name === 'cascade') {
    return cascader
  } else if (name === '3d-transform') {
    return without3d
  } else if (name === 'background-size') {
    return backgrounder
  } else if (name === 'backdrop-filter') {
    return overscroller
  } else if (name === 'background-clip' || name === 'user-select') {
    return clipper
  } else if (name === 'uncascade') {
    return uncascader
  } else if (name === 'example') {
    return autoprefixer({ overrideBrowserslist: ['defaults'] })
  } else if (name === 'viewport' || name === 'appearance') {
    return flexboxer
  } else if (name === 'resolution') {
    return resolutioner
  } else if (name === 'filter' || name === 'advanced-filter') {
    return filterer
  } else if (name === 'element') {
    return filterer
  } else if (name === 'image-rendering' || name === 'writing-mode') {
    return imagerender
  } else if (name === 'logical' || name === 'text-decoration') {
    return intrinsicer
  } else if (name === 'supports') {
    return supporter
  } else if (name === 'overscroll-behavior') {
    return overscroller
  } else if (name === 'transition-spec') {
    return transitionSpec
  } else {
    return compiler
  }
}

function read (name) {
  let file = path.join(__dirname, '/cases/' + name + '.css')
  return fs.readFileSync(file).toString()
}

function universalizer (string) {
  return string.replace(/\r/g, '')
}

function check (from, instance = prefixer(from)) {
  let input = read(from)
  let output = read(from + '.out')
  let result = postcss([instance]).process(input)
  expect(result.warnings()).toHaveLength(0)
  expect(universalizer(result.css)).toEqual(universalizer(output))
}

const COMMONS = [
  'transition', 'values', 'keyframes', 'gradient', 'flex-rewrite',
  'flexbox', 'filter', 'border-image', 'border-radius', 'notes', 'selectors',
  'placeholder', 'fullscreen', 'intrinsic', 'mistakes', 'custom-prefix',
  'cascade', 'double', 'multicolumn', '3d-transform', 'background-size',
  'supports', 'viewport', 'resolution', 'logical', 'appearance',
  'advanced-filter', 'element', 'image-set', 'image-rendering',
  'mask-border', 'writing-mode', 'cross-fade', 'gradient-fix',
  'text-emphasis-position', 'grid', 'grid-area', 'grid-template',
  'grid-template-areas', 'grid-gap', 'color-adjust'
]

afterEach(() => {
  delete process.env.AUTOPREFIXER_GRID
})

it('throws on wrong options', () => {
  expect(() => {
    autoprefixer({ browser: ['chrome 25', 'opera 12'] })
  }).toThrow(/overrideBrowserslist/)
  expect(() => {
    autoprefixer({ browserslist: ['chrome 25', 'opera 12'] })
  }).toThrow(/overrideBrowserslist/)
})

let options = {
  cascade: false,
  grid: false
}

let browsers = ['chrome 25', 'opera 12']

it('sets options via options object', () => {
  let allOptions = Object.assign(options, { overrideBrowserslist: browsers })
  let instance = autoprefixer(allOptions)
  expect(instance.options).toEqual(allOptions)
  expect(instance.browsers).toEqual(browsers)
})

it('sets options via array of browsers as first argument and object', () => {
  let instance = autoprefixer(browsers, options)
  expect(instance.options).toEqual(options)
  expect(instance.browsers).toEqual(browsers)
})

it('sets options via browsers as arguments and options object', () => {
  let instance = autoprefixer(...browsers, options)
  expect(instance.options).toEqual(options)
  expect(instance.browsers).toEqual(browsers)
})

it('has default browsers', () => {
  expect(autoprefixer.defaults.length).toBeDefined()
})

it('shows warning on browsers option', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  let instance = autoprefixer({ browsers: ['last 1 version'] })
  expect(instance.browsers).toEqual(['last 1 version'])
  expect(console.warn).toHaveBeenCalledTimes(1)
  expect(console.warn.mock.calls[0][0]).toContain('overrideBrowserslist')
})

it('passes statistics to Browserslist', () => {
  let stats = {
    chrome: {
      10: 10,
      11: 40
    },
    ie: {
      10: 10,
      11: 40
    }
  }
  expect(autoprefixer({
    overrideBrowserslist: '> 20% in my stats', stats
  }).info()).toMatch(/Browsers:\n\s\sChrome: 11\n\s\sIE: 11\n/)
})

it('prefixes values', () => check('values'))
it('prefixes @keyframes', () => check('keyframes'))
it('prefixes @viewport', () => check('viewport'))
it('prefixes selectors', () => check('selectors'))
it('prefixes resolution query', () => check('resolution'))
it('removes common mistakes', () => check('mistakes'))
it('reads notes for prefixes', () => check('notes'))
it('keeps vendor-specific hacks', () => check('vendor-hack'))
it('keeps values with vendor hacks', () => check('value-hack'))
it('works with comments', () => check('comments'))
it('uses visual cascade', () => check('cascade'))
it('works with properties near', () => check('double'))
it('checks prefixed in hacks', () => check('check-down'))
it('normalize cascade after remove', () => check('uncascade'))
it('prefix decls in @supports', () => check('supports'))
it('saves declaration style', () => check('style'))
it('uses ignore next control comments', () => check('ignore-next'))
it('uses block control comments', () => check('disabled'))
it('has actual example in docs', () => check('example'))
it('process grouping rules correctly', () => check('grouping-rule'))
it('transition on vendor specific rule', () => check('transition-spec'))

it('uses control comments to whole scope', () => {
  let input = read('scope')
  let output = read('scope.out')
  let result = postcss([prefixer('scope')]).process(input)

  expect(result.css).toEqual(output)
  expect(result.warnings().map(i => i.toString())).toEqual([
    'autoprefixer: <css input>:5:3: Second Autoprefixer control comment ' +
        'was ignored. Autoprefixer applies control comment to whole block, ' +
        'not to next rules.'
  ])
})

it('sets grid option via comment', () => {
  let input = read('grid-status')
  let output = read('grid-status.out')
  let ap = autoprefixer({ overrideBrowserslist: ['last 2 versions', 'IE 11'] })
  let result = postcss([ap]).process(input)

  expect(result.css).toEqual(output)
  expect(result.warnings().map(i => i.toString())).toEqual([
    'autoprefixer: <css input>:2:1: Second Autoprefixer grid control ' +
        'comment was ignored. Autoprefixer applies control comments ' +
        'to the whole block, not to the next rules.',
    'autoprefixer: <css input>:20:3: Second Autoprefixer grid control ' +
        'comment was ignored. Autoprefixer applies control comments ' +
        'to the whole block, not to the next rules.',
    'autoprefixer: <css input>:47:3: Second Autoprefixer grid control ' +
        'comment was ignored. Autoprefixer applies control comments ' +
        'to the whole block, not to the next rules.'
  ])
})

it('prefixes transition', () => {
  let input = read('transition')
  let output = read('transition.out')
  let result = postcss([prefixer('transition')]).process(input)

  expect(result.css).toEqual(output)
  expect(result.warnings().map(i => i.toString())).toEqual([
    'autoprefixer: <css input>:23:3: Replace transition-property ' +
        'to transition, because Autoprefixer could not support any cases ' +
        'of transition-property and other transition-*'
  ])
})

it('works with broken transition', () => {
  let input = 'a{transition:,,}'
  let output = 'a{-webkit-transition:;-o-transition:;transition:}'
  let result = postcss([prefixer('transition')]).process(input)
  expect(result.css).toEqual(output)
})

it('should ignore spaces inside values', () => {
  let css = read('trim')
  expect(postcss([flexboxer]).process(css).css).toEqual(css)
})

it('removes unnecessary prefixes', () => {
  let processor = postcss([cleaner])
  for (let type of COMMONS) {
    if (type === 'gradient-fix') continue
    if (type === 'cascade') continue
    if (type === 'mistakes') continue
    if (type === 'flex-rewrite') continue
    if (type === 'grid') continue
    if (type === 'grid-gap') continue
    if (type === 'grid-area') continue
    if (type === 'grid-template') continue
    if (type === 'grid-template-areas') continue
    let input = read(type + '.out')
    let output = read(type)
    expect(processor.process(input).css).toEqual(output)
  }
})

it('media does not should nested', () => {
  let processor = postcss([grider])
  let input = read('grid-media-rules')
  let output = read('grid-media-rules.out')
  expect(processor.process(input).css).toEqual(output)
})

it('does not remove unnecessary prefixes on request', () => {
  for (let type of ['transition', 'values', 'fullscreen']) {
    let keeper = autoprefixer({ overrideBrowserslist: [], remove: false })
    let css = read(type + '.out')
    expect(postcss([keeper]).process(css).css).toEqual(css)
  }
})

it('does not add prefixes on request', () => {
  for (let type of ['transition', 'values', 'fullscreen']) {
    let remover = autoprefixer({
      overrideBrowserslist: ['Opera 12'], add: false
    })
    let unprefixed = read(type)
    expect(postcss([remover]).process(unprefixed).css).toEqual(unprefixed)
  }
})

it('prevents doubling prefixes', () => {
  for (let type of COMMONS) {
    let processor = postcss([prefixer(type)])
    let input = read(type)
    let output = read(type + '.out')
    let result = processor.process(processor.process(input)).css
    expect(universalizer(result)).toEqual(universalizer(output))
  }
})

it('does not broke AST', () => {
  function checkParent (node) {
    node.walk(child => {
      expect(child.parent).toBeDefined()
      if (child.nodes) checkParent(child)
    })
  }
  for (let type of COMMONS) {
    let processor = postcss([prefixer(type)])
    let input = read(type)
    checkParent(processor.process(input).root)
  }
})

it('parses difficult files', () => {
  let input = read('syntax')
  let result = postcss([cleaner]).process(input)
  expect(result.css).toEqual(input)
})

it('marks parsing errors', () => {
  expect(() => {
    postcss([cleaner]).process('a {').css
  }).toThrow('<css input>:1:1: Unclosed block')
})

it('shows file name in parse error', () => {
  expect(() => {
    postcss([cleaner]).process('a {', { from: 'a.css' }).css
  }).toThrow(/a.css:1:1: /)
})

it('uses browserslist config', () => {
  let from = path.join(__dirname, 'cases/config/test.css')
  let input = read('config/test')
  let output = read('config/test.out')
  let processor = postcss([autoprefixer])
  expect(processor.process(input, { from }).css).toEqual(output)
})

it('sets browserslist environment', () => {
  let from = path.join(__dirname, 'cases/config/test.css')
  let input = read('config/test')
  let output = read('config/test.production')
  let processor = postcss([autoprefixer({ env: 'production' })])
  expect(processor.process(input, { from }).css).toEqual(output)
})

it('works without source in nodes', () => {
  let root = postcss.root()
  root.append({ selector: 'a' })
  root.first.append({ prop: 'display', value: 'flex' })
  compiler(root)
  expect(root.toString()).toEqual(
    'a {\n    display: -webkit-flex;\n    display: flex\n}')
})

it('takes values from other PostCSS plugins', () => {
  function plugin (root) {
    root.walkDecls(i => {
      i.value = 'calc(0)'
    })
  }
  let result = postcss([plugin, compiler]).process('a{width:0/**/0}')
  expect(result.css).toEqual('a{width:-webkit-calc(0);width:calc(0)}')
})

it('has option to disable @supports support', () => {
  let css = '@supports (cursor: grab) {}'
  let instance = autoprefixer({
    overrideBrowserslist: ['Chrome 28'], supports: false
  })
  let result = postcss([instance]).process(css)
  expect(result.css).toEqual(css)
})

it('has disabled grid options by default', () => {
  let ap = autoprefixer({ overrideBrowserslist: ['Edge 12', 'IE 10'] })
  let input = read('grid')
  let output = read('grid.disabled')
  let result = postcss([ap]).process(input)
  expect(result.css).toEqual(output)
})

it('has different outputs for different grid options', () => {
  function ap (gridValue) {
    return autoprefixer({
      overrideBrowserslist: ['Edge 12', 'IE 10'], grid: gridValue
    })
  }
  let input = read('grid-options')
  let outputAutoplace = read('grid-options.autoplace.out')
  let outputNoAutoplace = read('grid-options.no-autoplace.out')
  let outputDisabled = read('grid-options.disabled.out')

  let resultAutoplace = postcss([ap('autoplace')]).process(input).css
  let resultNoAutoplace = postcss([ap('no-autoplace')]).process(input).css
  let resultEnabled = postcss([ap(true)]).process(input).css
  let resultDisabled = postcss([ap(false)]).process(input).css

  // output for grid: 'autoplace'
  expect(resultAutoplace).toEqual(outputAutoplace)
  // output for grid: 'no-autoplace'
  expect(resultNoAutoplace).toEqual(outputNoAutoplace)
  // output for grid: true is the same as for 'no-autoplace'
  expect(resultEnabled).toEqual(outputNoAutoplace)
  // output for grid: false
  expect(resultDisabled).toEqual(outputDisabled)
})

it('has different outputs for different grid environment variables', () => {
  function ap (gridValue) {
    process.env.AUTOPREFIXER_GRID = gridValue
    return autoprefixer({ overrideBrowserslist: ['Edge 12', 'IE 10'] })
  }
  let input = read('grid-options')
  let outputAutoplace = read('grid-options.autoplace.out')
  let outputNoAutoplace = read('grid-options.no-autoplace.out')
  let outputDisabled = read('grid-options.disabled.out')

  let resultAutoplace = postcss([ap('autoplace')]).process(input).css
  expect(resultAutoplace).toEqual(outputAutoplace)

  let resultNoAutoplace = postcss([ap('no-autoplace')]).process(input).css
  expect(resultNoAutoplace).toEqual(outputNoAutoplace)
})

it('has option to disable flexbox support', () => {
  let css = read('flexbox')
  let instance = autoprefixer({
    overrideBrowserslist: ['IE 10'], flexbox: false
  })
  let result = postcss([instance]).process(css)
  expect(result.css).toEqual(css)
})

it('has option to disable 2009 flexbox support', () => {
  let ap = autoprefixer({
    overrideBrowserslist: ['Chrome > 19'], flexbox: 'no-2009'
  })
  let css = 'a{flex:1;transition:flex}'
  let result = postcss([ap]).process(css)
  expect(result.css).toEqual('a{' +
        '-webkit-flex:1;flex:1;' +
        '-webkit-transition:-webkit-flex;transition:-webkit-flex;' +
        'transition:flex;transition:flex, -webkit-flex' +
    '}')
})

it('returns inspect string', () => {
  expect(autoprefixer({ overrideBrowserslist: ['chrome 25'] }).info())
    .toMatch(/Browsers:\s+Chrome: 25/)
})

it('uses browserslist config in inspect', () => {
  let from = path.join(__dirname, 'cases/config')
  expect(autoprefixer().info({ from })).toMatch(/Browsers:\s+IE: 10/)
})

it('ignores unknown versions on request', () => {
  expect(() => {
    autoprefixer({ overrideBrowserslist: ['ie 100'] }).info()
  }).toThrow(/Unknown version 100 of ie/)
  expect(() => {
    autoprefixer({
      overrideBrowserslist: ['ie 100'], ignoreUnknownVersions: true
    }).info()
  }).not.toThrow()
})

describe('hacks', () => {
  it('ignores prefix IE filter', () => check('filter'))
  it('supports webkit filters', () => check('advanced-filter'))
  it('changes border image syntax', () => check('border-image'))
  it('supports old Mozilla prefixes', () => check('border-radius'))
  it('supports all flexbox syntaxes', () => check('flexbox'))
  it('supports map flexbox props', () => check('flex-rewrite'))
  it('supports all fullscreens', () => check('fullscreen'))
  it('supports custom prefixes', () => check('custom-prefix'))
  it('fixes break properties', () => check('multicolumn'))
  it('ignores some 3D transforms', () => check('3d-transform'))
  it('supports background-size', () => check('background-size'))
  it('supports background-clip', () => check('background-clip'))
  it('supports logical properties', () => check('logical'))
  it('supports appearance', () => check('appearance'))
  it('supports all placeholders', () => check('placeholder'))
  it('supports image-rendering', () => check('image-rendering'))
  it('supports border-box mask', () => check('mask-border'))
  it('supports mask-composite', () => check('mask-composite'))
  it('supports image-set()', () => check('image-set'))
  it('supports writing-mode', () => check('writing-mode'))
  it('supports cross-fade()', () => check('cross-fade'))
  it('ignores modern direction', () => check('animation'))
  it('supports overscroll-behavior', () => check('overscroll-behavior'))
  it('supports color-adjust', () => check('color-adjust'))
  it('supports backdrop-filter', () => check('backdrop-filter'))
  it('supports user-select hack for IE', () => check('user-select'))

  it('supports appearance for IE', () => {
    let instance = autoprefixer({ overrideBrowserslist: 'Edge 15' })
    let result = postcss([instance]).process('a { appearance: none }')
    expect(result.css).toEqual(
      'a { -webkit-appearance: none; appearance: none }')
  })

  it('changes angle in gradient', () => {
    let input = read('gradient')
    let output = read('gradient.out')
    let result = postcss([prefixer('gradient')]).process(input)

    expect(result.css).toEqual(output)
    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:18:3: Gradient has outdated direction ' +
            'syntax. New syntax is like `closest-side at 0 0` instead of ' +
            '`0 0, closest-side`.',
      'autoprefixer: <css input>:38:3: Gradient has outdated direction ' +
            'syntax. New syntax is like `to left` instead of `right`.',
      'autoprefixer: <css input>:100:3: Gradient has outdated ' +
            'direction syntax. Replace `cover` to `farthest-corner`.',
      'autoprefixer: <css input>:104:3: Gradient has outdated ' +
            'direction syntax. Replace `contain` to `closest-side`.'
    ])

    check('gradient-fix')
  })

  it('warns on old flexbox display', () => {
    let result = postcss([flexboxer]).process('a{ display: box; }')
    expect(result.css).toEqual('a{ display: box; }')
    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:1:4: You should write display: flex ' +
            'by final spec instead of display: box'
    ])
  })

  it('warns on mixed support usage', () => {
    let css =
      'a { display: flex; align-content: start; justify-content: end; }'
    let result = postcss([
      autoprefixer({
        overrideBrowserslist: ['IE 11']
      })
    ]).process(css)
    expect(result.css).toEqual(css)
    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:1:20: start value has mixed support, ' +
        'consider using flex-start instead',
      'autoprefixer: <css input>:1:42: end value has mixed support, ' +
        'consider using flex-end instead'
    ])
  })

  it('supports intrinsic sizing', () => {
    let input = read('intrinsic')
    let output = read('intrinsic.out')
    let result = postcss([prefixer('intrinsic')]).process(input)

    expect(result.css).toEqual(output)
    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:15:3: Replace fill to stretch, ' +
            'because spec had been changed',
      'autoprefixer: <css input>:19:3: Replace fill-available ' +
            'to stretch, because spec had been changed'
    ])
  })

  it('supports text-emphasis', () => {
    let input = read('text-emphasis-position')
    let output = read('text-emphasis-position.out')
    let instance = prefixer('text-emphasis-position')
    let result = postcss([instance]).process(input)

    expect(result.css).toEqual(output)
    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:14:3: You should use 2 values ' +
            'for text-emphasis-position For example, `under left` ' +
            'instead of just `under`.'
    ])
  })

  it('supports grid layout', () => {
    let input = read('grid')
    let output = read('grid.out')
    let instance = prefixer('grid')
    let result = postcss([instance]).process(input)

    expect(result.css).toEqual(output)
    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:3:3: Autoplacement does not work ' +
        'without grid-template-rows property',
      'autoprefixer: <css input>:12:3: Autoplacement does not work ' +
        'without grid-template-columns property',
      'autoprefixer: <css input>:36:3: Can not prefix grid-column-end ' +
        '(grid-column-start is not found)',
      'autoprefixer: <css input>:39:3: Can not implement grid-gap ' +
        'without grid-template-columns',
      'autoprefixer: <css input>:39:3: Can not find grid areas: ' +
        'head, nav, main, foot',
      'autoprefixer: <css input>:47:3: Can not implement grid-gap ' +
        'without grid-template-columns',
      'autoprefixer: <css input>:47:3: Can not find grid areas: a',
      'autoprefixer: <css input>:55:3: Can not implement grid-gap ' +
        'without grid-template-columns',
      'autoprefixer: <css input>:55:3: Can not find grid areas: b',
      'autoprefixer: <css input>:63:3: Can not find grid areas: c',
      'autoprefixer: <css input>:71:3: Can not find grid areas: d',
      'autoprefixer: <css input>:99:3: grid-column-span is not part ' +
        'of final Grid Layout. Use grid-column.',
      'autoprefixer: <css input>:100:3: grid-row-span is not part ' +
        'of final Grid Layout. Use grid-row.',
      'autoprefixer: <css input>:101:3: grid-auto-columns is not ' +
        'supported by IE',
      'autoprefixer: <css input>:102:3: grid-auto-rows is not ' +
        'supported by IE',
      'autoprefixer: <css input>:104:33: auto-fill value is not ' +
        'supported by IE',
      'autoprefixer: <css input>:105:30: auto-fit value is not ' +
        'supported by IE',
      'autoprefixer: <css input>:121:3: Please do not use ' +
        'display: contents; if you have grid setting enabled',
      'autoprefixer: <css input>:125:3: IE does not support align-items ' +
        'on grid containers. Try using align-self on child elements instead: ' +
        '.warn_ie_align > * { align-self: center }',
      'autoprefixer: <css input>:130:3: IE does not support justify-items ' +
        'on grid containers. Try using justify-self on child elements ' +
        'instead: .warn_ie_justify > * { justify-self: center }',
      'autoprefixer: <css input>:135:3: IE does not support justify-content ' +
        'on grid containers',
      'autoprefixer: <css input>:140:3: IE does not support place-items ' +
        'on grid containers. Try using place-self on child elements ' +
        'instead: .warn_place_items > * { place-self: start end }',
      'autoprefixer: <css input>:164:3: grid-auto-flow is not supported by IE',
      'autoprefixer: <css input>:186:26: Autoprefixer currently does not ' +
        'support line names. Try using grid-template-areas instead.'
    ])

    let input2 = read('grid-template')
    let output2 = read('grid-template.out')
    let instance2 = prefixer('grid-template')
    let result2 = postcss([instance2]).process(input2)
    expect(result2.css).toEqual(output2)
  })

  it('supports grid autoplacement', () => {
    let input = read('grid-autoplacement')
    let output = read('grid-autoplacement.out')
    let instance = prefixer('grid')
    let result = postcss([instance]).process(input)
    expect(result.css).toEqual(output)

    expect(result.warnings().map(i => i.toString())).toEqual([
      'autoprefixer: <css input>:47:3: grid-auto-flow: dense ' +
        'is not supported by IE',
      'autoprefixer: <css input>:48:3: Autoplacement does not work ' +
        'without grid-template-rows property',
      'autoprefixer: <css input>:53:3: grid-auto-flow works only if grid-temp' +
      'late-rows and grid-template-columns are present in the same rule',
      'autoprefixer: <css input>:60:3: grid-gap only works if grid-temp' +
      'late(-areas) is being used',
      'autoprefixer: <css input>:64:3: Autoplacement does not work ' +
      'without grid-template-rows property',
      'autoprefixer: <css input>:65:3: grid-gap only works if grid-temp' +
      'late(-areas) is being used or both rows and columns have been ' +
      'declared and cells have not been ' +
      'manually placed inside the explicit grid'
    ])
  })

  it('shows Grid warnings only for IE', () => {
    let input = 'a { grid-template-rows: repeat(auto-fit, 1px) }'
    let instance = autoprefixer({
      overrideBrowserslist: 'chrome 27', grid: true
    })
    let result = postcss([instance]).process(input)
    expect(result.warnings()).toEqual([])
  })

  it('warns if rule has both grid-area and grid-(row|column) decls', () => {
    let input = read('grid-area')
    let instance = prefixer('grid-area')
    let result = postcss([instance]).process(input)
    expect(result.warnings()
      .map(i => i.toString()))
      .toEqual([
        'autoprefixer: <css input>:28:3: You already have a grid-area ' +
        'declaration present in the rule. You should use either ' +
        'grid-area or grid-row, not both',
        'autoprefixer: <css input>:29:3: You already have a grid-area ' +
        'declaration present in the rule. You should use either ' +
        'grid-area or grid-column, not both',
        'autoprefixer: <css input>:34:3: You already have a grid-area ' +
        'declaration present in the rule. You should use either ' +
        'grid-area or grid-column, not both'
      ])
  })

  it('warns if rule with grid-area has no parent with grid-template', () => {
    let input = read('grid-template-areas')
    let instance = prefixer('grid-area')
    let result = postcss([instance]).process(input)

    expect(result.warnings()
      .map(i => i.toString())
      .filter(str => str.includes('grid-template')))
      .toEqual([
        'autoprefixer: <css input>:144:3: Autoprefixer cannot find ' +
        'a grid-template containing the duplicate grid-area ' +
        '"child" with full selector matching: .uncle',
        'autoprefixer: <css input>:149:3: Autoprefixer cannot find ' +
        'a grid-template containing the duplicate grid-area ' +
        '"child" with full selector matching: .uncle',
        'autoprefixer: <css input>:154:3: Autoprefixer cannot find ' +
        'a grid-template containing the duplicate grid-area ' +
        '"child" with full selector matching: .grand-parent .uncle-second',
        'autoprefixer: <css input>:159:3: Autoprefixer cannot find ' +
        'a grid-template containing the duplicate grid-area ' +
        '"child" with full selector matching: .grand-parent .uncle-second',
        'autoprefixer: <css input>:164:3: Autoprefixer cannot find ' +
        'a grid-template containing the duplicate grid-area ' +
        '"child" with full selector matching: .grand-parent .father.uncle',
        'autoprefixer: <css input>:169:3: Autoprefixer cannot find ' +
        'a grid-template containing the duplicate grid-area ' +
        '"child" with full selector matching: .grand-parent.uncle .father'
      ])
  })

  it('should preserve @media rules with grid-area', () => {
    let input = read('grid-area-media-sequence')
    let output = read('grid-area-media-sequence.out')
    let instance = prefixer('grid-area')
    let result = postcss([instance]).process(input)
    expect(result.css).toEqual(output)
  })

  it('should merge complex duplicate grid-area rules successfully', () => {
    let input = read('grid-areas-duplicate-complex')
    let output = read('grid-areas-duplicate-complex.out')
    let instance = prefixer('grid-area')
    let result = postcss([instance]).process(input)
    expect(result.css).toEqual(output)
  })

  it('ignores values for CSS3PIE props', () => {
    let css = read('pie')
    expect(postcss([compiler]).process(css).css).toEqual(css)
  })

  it('add prefix for backface-visibility for Safari 9', () => {
    let input = 'a{ ' +
                'backface-visibility: hidden; ' +
                'transform-style: preserve-3d }'
    let ap = autoprefixer({
      overrideBrowserslist: ['Safari 9'], flexbox: false
    })
    expect(postcss([ap]).process(input).css).toEqual(
      'a{ ' +
      '-webkit-backface-visibility: hidden; ' +
      'backface-visibility: hidden; ' +
      'transform-style: preserve-3d }'
    )
  })

  it('supports text-decoration', () => {
    let input = read('text-decoration')
    let instance = prefixer('text-decoration')
    let result = postcss([instance]).process(input)
    expect(result.warnings()
      .map(i => i.toString()))
      .toEqual([
        'autoprefixer: <css input>:26:3: Replace text-decoration-skip: ink ' +
        'to text-decoration-skip-ink: auto, because spec had been changed'
      ])
  })

  it('supports -webkit-line-clamp', () => {
    let input = read('webkit-line-clamp')
    let result = postcss([cleaner]).process(input)
    expect(result.css).toEqual(input)
    expect(result.warnings()).toHaveLength(0)
  })
})

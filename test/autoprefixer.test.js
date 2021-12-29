let { equal, throws, type, match, not } = require('uvu/assert')
let { restoreAll, spyOn } = require('nanospy')
let { readFileSync } = require('fs')
let { join } = require('path')
let { test } = require('uvu')
let postcss = require('postcss')

let autoprefixer = require('..')

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
let fileSelectorButtoner = autoprefixer({
  overrideBrowserslist: ['Chrome > 25', 'Firefox >= 82']
})
let placeholderShowner = autoprefixer({
  overrideBrowserslist: ['IE >= 10']
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
let example = autoprefixer({
  overrideBrowserslist: ['defaults']
})
let autofiller = autoprefixer({
  overrideBrowserslist: ['Chrome > 90', 'Firefox >= 82']
})
let content = autoprefixer({
  overrideBrowserslist: [
    '> 2%',
    'last 2 years',
    'ie 11',
    'not ie_mob > 0',
    'not dead'
  ]
})

function prefixer(name) {
  if (
    name === 'grid' ||
    name === 'grid-gap' ||
    name === 'grid-area' ||
    name === 'grid-template' ||
    name === 'grid-template-areas'
  ) {
    return grider
  } else if (
    name === 'filter' ||
    name === 'advanced-filter' ||
    name === 'element'
  ) {
    return filterer
  } else if (
    name === 'vendor-hack' ||
    name === 'value-hack' ||
    name === 'mistakes'
  ) {
    return cleaner
  } else if (
    name === 'flexbox' ||
    name === 'flex-rewrite' ||
    name === 'double' ||
    name === 'viewport' ||
    name === 'appearance'
  ) {
    return flexboxer
  } else if (
    name === 'intrinsic' ||
    name === 'multicolumn' ||
    name === 'logical' ||
    name === 'text-decoration' ||
    name === 'at-rules'
  ) {
    return intrinsicer
  } else if (name === 'selectors' || name === 'placeholder') {
    return selectorer
  } else if (name === 'selectors' || name === 'file-selector-button') {
    return fileSelectorButtoner
  } else if (name === 'selectors' || name === 'autofill') {
    return autofiller
  } else if (name === 'placeholder-shown') {
    return placeholderShowner
  } else if (name === 'backdrop-filter' || name === 'overscroll-behavior') {
    return overscroller
  } else if (name === 'background-clip' || name === 'user-select') {
    return clipper
  } else if (name === 'image-rendering' || name === 'writing-mode') {
    return imagerender
  } else if (name === 'keyframes') {
    return keyframer
  } else if (name === 'border-radius') {
    return borderer
  } else if (name === 'gradient') {
    return gradienter
  } else if (name === 'gradient-fix') {
    return ffgradienter
  } else if (name === 'grouping-rule') {
    return grouping
  } else if (name === 'cascade') {
    return cascader
  } else if (name === '3d-transform') {
    return without3d
  } else if (name === 'background-size') {
    return backgrounder
  } else if (name === 'uncascade') {
    return uncascader
  } else if (name === 'example') {
    return example
  } else if (name === 'resolution') {
    return resolutioner
  } else if (name === 'supports') {
    return supporter
  } else if (name === 'transition-spec') {
    return transitionSpec
  } else if (name === 'content') {
    return content
  } else {
    return compiler
  }
}

function read(name) {
  let file = join(__dirname, '/cases/' + name + '.css')
  return readFileSync(file).toString()
}

function universalizer(string) {
  return string.replace(/\r/g, '')
}

function check(from, instance = prefixer(from)) {
  let input = read(from)
  let output = read(from + '.out')
  let result = postcss([instance]).process(input)
  equal(result.warnings().length, 0)
  equal(universalizer(result.css), universalizer(output))
}

const COMMONS = [
  'transition',
  'values',
  'keyframes',
  'gradient',
  'flex-rewrite',
  'flexbox',
  'filter',
  'border-image',
  'border-radius',
  'notes',
  'selectors',
  'placeholder',
  'placeholder-shown',
  'fullscreen',
  'intrinsic',
  'mistakes',
  'custom-prefix',
  'cascade',
  'double',
  'multicolumn',
  '3d-transform',
  'background-size',
  'supports',
  'viewport',
  'resolution',
  'logical',
  'appearance',
  'advanced-filter',
  'element',
  'image-set',
  'image-rendering',
  'mask-border',
  'writing-mode',
  'cross-fade',
  'gradient-fix',
  'text-emphasis-position',
  'grid',
  'grid-area',
  'grid-template',
  'grid-template-areas',
  'grid-gap',
  'color-adjust'
]

test.after.each(() => {
  delete process.env.AUTOPREFIXER_GRID
  restoreAll()
})

test('throws on wrong options', () => {
  throws(() => {
    autoprefixer({ browser: ['chrome 25', 'opera 12'] })
  }, /overrideBrowserslist/)
  throws(() => {
    autoprefixer({
      browserslist: ['chrome 25', 'opera 12']
    })
  }, /overrideBrowserslist/)
})

let options = {
  cascade: false,
  grid: false
}

let browsers = ['chrome 25', 'opera 12']

test('sets options via options object', () => {
  let allOptions = Object.assign(options, { overrideBrowserslist: browsers })
  let instance = autoprefixer(allOptions)
  equal(instance.options, allOptions)
  equal(instance.browsers, browsers)
})

test('sets options via array of browsers as first argument and object', () => {
  let instance = autoprefixer(browsers, options)
  equal(instance.options, options)
  equal(instance.browsers, browsers)
})

test('sets options via browsers as arguments and options object', () => {
  let instance = autoprefixer(...browsers, options)
  equal(instance.options, options)
  equal(instance.browsers, browsers)
})

test('has default browsers', () => {
  type(autoprefixer.defaults.length, 'number')
})

test('shows warning on browsers option', () => {
  let consoleWarn = spyOn(console, 'warn', () => {})
  let instance = autoprefixer({
    browsers: ['last 1 version']
  })
  equal(instance.browsers, ['last 1 version'])
  equal(consoleWarn.callCount, 1)
  match(consoleWarn.calls[0][0], 'overrideBrowserslist')
})

test('passes statistics to Browserslist', () => {
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
  match(
    autoprefixer({
      overrideBrowserslist: '> 20% in my stats',
      stats
    }).info(),
    /Browsers:\n\s\sChrome: 11\n\s\sIE: 11\n/
  )
})

test('prefixes values', () => {
  check('values')
})

test('prefixes @keyframes', () => {
  check('keyframes')
})

test('prefixes @viewport', () => {
  check('viewport')
})

test('prefixes selectors', () => {
  check('selectors')
})

test('prefixes resolution query', () => {
  check('resolution')
})

test('removes common mistakes', () => {
  check('mistakes')
})

test('reads notes for prefixes', () => {
  check('notes')
})

test('keeps vendor-specific hacks', () => {
  check('vendor-hack')
})

test('keeps values with vendor hacks', () => {
  check('value-hack')
})

test('works with comments', () => {
  check('comments')
})

test('uses visual cascade', () => {
  check('cascade')
})

test('works with properties near', () => {
  check('double')
})

test('checks prefixed in hacks', () => {
  check('check-down')
})

test('normalize cascade after remove', () => {
  check('uncascade')
})

test('prefix decls in @supports', () => {
  check('supports')
})

test('saves declaration style', () => {
  check('style')
})

test('uses ignore next control comments', () => {
  check('ignore-next')
})

test('uses block control comments', () => {
  check('disabled')
})

test('has actual example in docs', () => {
  check('example')
})

test('process grouping rules correctly', () => {
  check('grouping-rule')
})

test('transition on vendor specific rule', () => {
  check('transition-spec')
})

test('ignore prefix in vendor at rules', () => {
  check('at-rules')
})

test('ignore content property', () => {
  let input = read('content')
  let result = postcss([prefixer('scope')]).process(input)
  equal(result.css, input)
})

test('uses control comments to whole scope', () => {
  let input = read('scope')
  let output = read('scope.out')
  let result = postcss([prefixer('scope')]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:5:3: Second Autoprefixer control comment ' +
        'was ignored. Autoprefixer applies control comment to whole block, ' +
        'not to next rules.'
    ]
  )
})

test('sets grid option via comment', () => {
  let input = read('grid-status')
  let output = read('grid-status.out')
  let ap = autoprefixer({ overrideBrowserslist: ['last 2 versions', 'IE 11'] })
  let result = postcss([ap]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:2:1: Second Autoprefixer grid control ' +
        'comment was ignored. Autoprefixer applies control comments ' +
        'to the whole block, not to the next rules.',
      'autoprefixer: <css input>:20:3: Second Autoprefixer grid control ' +
        'comment was ignored. Autoprefixer applies control comments ' +
        'to the whole block, not to the next rules.',
      'autoprefixer: <css input>:47:3: Second Autoprefixer grid control ' +
        'comment was ignored. Autoprefixer applies control comments ' +
        'to the whole block, not to the next rules.'
    ]
  )
})

test('prefixes transition', () => {
  let input = read('transition')
  let output = read('transition.out')
  let result = postcss([prefixer('transition')]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:23:3: Replace transition-property ' +
        'to transition, because Autoprefixer could not support any cases ' +
        'of transition-property and other transition-*'
    ]
  )
})

test('does not raise unnecessary warnings when prefixing transition', () => {
  check('transition-no-warning')
})

test('works with broken transition', () => {
  let input = 'a{transition:,,}'
  let output = 'a{-webkit-transition:;-o-transition:;transition:}'
  let result = postcss([prefixer('transition')]).process(input)
  equal(result.css, output)
})

test('should ignore spaces inside values', () => {
  let css = read('trim')
  equal(postcss([flexboxer]).process(css).css, css)
})

test('removes unnecessary prefixes', () => {
  let processor = postcss([cleaner])
  for (let i of COMMONS) {
    if (i === 'gradient-fix') continue
    if (i === 'cascade') continue
    if (i === 'mistakes') continue
    if (i === 'flex-rewrite') continue
    if (i === 'grid') continue
    if (i === 'grid-gap') continue
    if (i === 'grid-area') continue
    if (i === 'grid-template') continue
    if (i === 'grid-template-areas') continue
    let input = read(i + '.out')
    let output = read(i)
    equal(processor.process(input).css, output)
  }
})

test('media does not should nested', () => {
  let processor = postcss([grider])
  let input = read('grid-media-rules')
  let output = read('grid-media-rules.out')
  equal(processor.process(input).css, output)
})

test('does not remove unnecessary prefixes on request', () => {
  for (let i of ['transition', 'values', 'fullscreen']) {
    let keeper = autoprefixer({ overrideBrowserslist: [], remove: false })
    let css = read(i + '.out')
    equal(postcss([keeper]).process(css).css, css)
  }
})

test('does not add prefixes on request', () => {
  for (let i of ['transition', 'values', 'fullscreen']) {
    let remover = autoprefixer({
      overrideBrowserslist: ['Opera 12'],
      add: false
    })
    let unprefixed = read(i)
    equal(postcss([remover]).process(unprefixed).css, unprefixed)
  }
})

test('prevents doubling prefixes', () => {
  for (let i of COMMONS) {
    let processor = postcss([prefixer(i)])
    let input = read(i)
    let output = read(i + '.out')
    let result = processor.process(processor.process(input)).css
    equal(universalizer(result), universalizer(output))
  }
})

function isContainerNode(node) {
  return 'nodes' in node
}

test('does not broke AST', () => {
  function checkParent(node) {
    node.walk(child => {
      type(child.parent, 'object')
      if (isContainerNode(child)) checkParent(child)
    })
  }
  for (let i of COMMONS) {
    let processor = postcss([prefixer(i)])
    let input = read(i)
    checkParent(processor.process(input).root)
  }
})

test('parses difficult files', () => {
  let input = read('syntax')
  let result = postcss([cleaner]).process(input)
  equal(result.css, input)
})

test('marks parsing errors', () => {
  throws(() => {
    postcss([cleaner]).process('a {').css
  }, '<css input>:1:1: Unclosed block')
})

test('shows file name in parse error', () => {
  throws(() => {
    postcss([cleaner]).process('a {', { from: 'a.css' }).css
  }, /a.css:1:1: /)
})

test('uses browserslist config', () => {
  let from = join(__dirname, 'cases/config/test.css')
  let input = read('config/test')
  let output = read('config/test.out')
  let processor = postcss([autoprefixer])
  equal(processor.process(input, { from }).css, output)
})

test('sets browserslist environment', () => {
  let from = join(__dirname, 'cases/config/test.css')
  let input = read('config/test')
  let output = read('config/test.production')
  let processor = postcss([autoprefixer({ env: 'development' })])
  equal(processor.process(input, { from }).css, output)
})

test('takes values from other PostCSS plugins', () => {
  function plugin(root) {
    root.walkDecls(i => {
      i.value = 'calc(0)'
    })
  }
  let result = postcss([plugin, compiler]).process('a{width:0/**/0}')
  equal(result.css, 'a{width:-webkit-calc(0);width:calc(0)}')
})

test('has option to disable @supports support', () => {
  let css = '@supports (cursor: grab) {}'
  let instance = autoprefixer({
    overrideBrowserslist: ['Chrome 28'],
    supports: false
  })
  let result = postcss([instance]).process(css)
  equal(result.css, css)
})

test('has disabled grid options by default', () => {
  let ap = autoprefixer({ overrideBrowserslist: ['Edge 12', 'IE 10'] })
  let input = read('grid')
  let output = read('grid.disabled')
  let result = postcss([ap]).process(input)
  equal(result.css, output)
})

test('has different outputs for different grid options', () => {
  function ap(gridValue) {
    return autoprefixer({
      overrideBrowserslist: ['Edge 12', 'IE 10'],
      grid: gridValue
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
  equal(resultAutoplace, outputAutoplace)
  // output for grid: 'no-autoplace'
  equal(resultNoAutoplace, outputNoAutoplace)
  // output for grid: true is the same as for 'no-autoplace'
  equal(resultEnabled, outputNoAutoplace)
  // output for grid: false
  equal(resultDisabled, outputDisabled)
})

test('has different outputs for different grid environment variables', () => {
  function ap(gridValue) {
    process.env.AUTOPREFIXER_GRID = gridValue
    return autoprefixer({ overrideBrowserslist: ['Edge 12', 'IE 10'] })
  }
  let input = read('grid-options')
  let outputAutoplace = read('grid-options.autoplace.out')
  let outputNoAutoplace = read('grid-options.no-autoplace.out')

  let resultAutoplace = postcss([ap('autoplace')]).process(input).css
  equal(resultAutoplace, outputAutoplace)

  let resultNoAutoplace = postcss([ap('no-autoplace')]).process(input).css
  equal(resultNoAutoplace, outputNoAutoplace)
})

test('has option to disable flexbox support', () => {
  let css = read('flexbox')
  let instance = autoprefixer({
    overrideBrowserslist: ['IE 10'],
    flexbox: false
  })
  let result = postcss([instance]).process(css)
  equal(result.css, css)
})

test('has option to disable 2009 flexbox support', () => {
  let ap = autoprefixer({
    overrideBrowserslist: ['Chrome > 19'],
    flexbox: 'no-2009'
  })
  let css = 'a{flex:1;transition:flex}'
  let result = postcss([ap]).process(css)
  equal(
    result.css,
    'a{' +
      '-webkit-flex:1;flex:1;' +
      '-webkit-transition:-webkit-flex;transition:-webkit-flex;' +
      'transition:flex;transition:flex, -webkit-flex' +
      '}'
  )
})

test('returns inspect string', () => {
  match(
    autoprefixer({ overrideBrowserslist: ['chrome 25'] }).info(),
    /Browsers:\s+Chrome: 25/
  )
})

test('uses browserslist config in inspect', () => {
  let from = join(__dirname, 'cases/config')
  match(autoprefixer().info({ from }), /Browsers:\s+IE: 10/)
})

test('ignores unknown versions on request', () => {
  throws(() => {
    autoprefixer({ overrideBrowserslist: ['ie 100'] }).info()
  }, /Unknown version 100 of ie/)
  not.throws(() => {
    autoprefixer({
      overrideBrowserslist: ['ie 100'],
      ignoreUnknownVersions: true
    }).info()
  })
})

test('works with CSS Modules', () => {
  postcss([autoprefixer()]).process(':export { selectors: _1q6ho_2 }').css
})

test('ignores prefix IE filter', () => {
  check('filter')
})

test('supports webkit filters', () => {
  check('advanced-filter')
})

test('changes border image syntax', () => {
  check('border-image')
})

test('supports old Mozilla prefixes', () => {
  check('border-radius')
})

test('supports all flexbox syntaxes', () => {
  check('flexbox')
})

test('supports map flexbox props', () => {
  check('flex-rewrite')
})

test('supports all fullscreens', () => {
  check('fullscreen')
})

test('supports file-selector-button', () => {
  check('file-selector-button')
})

test('supports custom prefixes', () => {
  check('custom-prefix')
})

test('fixes break properties', () => {
  check('multicolumn')
})

test('ignores some 3D transforms', () => {
  check('3d-transform')
})

test('supports background-size', () => {
  check('background-size')
})

test('supports background-clip', () => {
  check('background-clip')
})

test('supports logical properties', () => {
  check('logical')
})

test('supports appearance', () => {
  check('appearance')
})

test('supports all placeholders', () => {
  check('placeholder')
})

test('supports placeholder-shown', () => {
  check('placeholder-shown')
})

test('supports image-rendering', () => {
  check('image-rendering')
})

test('supports border-box mask', () => {
  check('mask-border')
})

test('supports mask-composite', () => {
  check('mask-composite')
})

test('supports image-set()', () => {
  check('image-set')
})

test('supports writing-mode', () => {
  check('writing-mode')
})

test('supports cross-fade()', () => {
  check('cross-fade')
})

test('ignores modern direction', () => {
  check('animation')
})

test('supports overscroll-behavior', () => {
  check('overscroll-behavior')
})

test('supports color-adjust', () => {
  check('color-adjust')
})

test('supports backdrop-filter', () => {
  check('backdrop-filter')
})

test('supports user-select hack for IE', () => {
  check('user-select')
})

test('supports appearance for IE', () => {
  let instance = autoprefixer({ overrideBrowserslist: 'Edge 15' })
  let result = postcss([instance]).process('a { appearance: none }')
  equal(result.css, 'a { -webkit-appearance: none; appearance: none }')
})

test('changes angle in gradient', () => {
  let input = read('gradient')
  let output = read('gradient.out')
  let result = postcss([prefixer('gradient')]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:18:3: Gradient has outdated direction ' +
        'syntax. New syntax is like `closest-side at 0 0` instead of ' +
        '`0 0, closest-side`.',
      'autoprefixer: <css input>:38:3: Gradient has outdated direction ' +
        'syntax. New syntax is like `to left` instead of `right`.',
      'autoprefixer: <css input>:100:3: Gradient has outdated ' +
        'direction syntax. Replace `cover` to `farthest-corner`.',
      'autoprefixer: <css input>:104:3: Gradient has outdated ' +
        'direction syntax. Replace `contain` to `closest-side`.'
    ]
  )

  check('gradient-fix')
})

test('warns on old flexbox display', () => {
  let result = postcss([flexboxer]).process('a{ display: box; }')
  equal(result.css, 'a{ display: box; }')
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:1:4: You should write display: flex ' +
        'by final spec instead of display: box'
    ]
  )
})

test('warns on mixed support usage', () => {
  let css = 'a { display: flex; align-content: start; justify-content: end; }'
  let result = postcss([
    autoprefixer({
      overrideBrowserslist: ['IE 11']
    })
  ]).process(css)
  equal(result.css, css)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:1:20: start value has mixed support, ' +
        'consider using flex-start instead',
      'autoprefixer: <css input>:1:42: end value has mixed support, ' +
        'consider using flex-end instead'
    ]
  )
})

test('supports intrinsic sizing', () => {
  let input = read('intrinsic')
  let output = read('intrinsic.out')
  let result = postcss([prefixer('intrinsic')]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:15:3: Replace fill to stretch, ' +
        'because spec had been changed',
      'autoprefixer: <css input>:19:3: Replace fill-available ' +
        'to stretch, because spec had been changed'
    ]
  )
})

test('supports text-emphasis', () => {
  let input = read('text-emphasis-position')
  let output = read('text-emphasis-position.out')
  let instance = prefixer('text-emphasis-position')
  let result = postcss([instance]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:14:3: You should use 2 values ' +
        'for text-emphasis-position For example, `under left` ' +
        'instead of just `under`.'
    ]
  )
})

test('supports grid layout', () => {
  let input = read('grid')
  let output = read('grid.out')
  let instance = prefixer('grid')
  let result = postcss([instance]).process(input)

  equal(result.css, output)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:3:3: Autoplacement does not work ' +
        'without grid-template-rows property',
      'autoprefixer: <css input>:12:3: Autoplacement does not work ' +
        'without grid-template-columns property',
      'autoprefixer: <css input>:36:3: Can not prefix grid-column-end ' +
        '(grid-column-start is not found)',
      'autoprefixer: <css input>:37:3: IE does not support subgrid',
      'autoprefixer: <css input>:39:3: Can not implement grid-gap ' +
        'without grid-template-columns',
      'autoprefixer: <css input>:39:3: Can not find grid areas: ' +
        'head, nav, main, foot',
      'autoprefixer: <css input>:57:3: Can not implement grid-gap ' +
        'without grid-template-columns',
      'autoprefixer: <css input>:57:3: Can not find grid areas: a',
      'autoprefixer: <css input>:65:3: Can not implement grid-gap ' +
        'without grid-template-columns',
      'autoprefixer: <css input>:65:3: Can not find grid areas: b',
      'autoprefixer: <css input>:73:3: Can not find grid areas: c',
      'autoprefixer: <css input>:81:3: Can not find grid areas: d',
      'autoprefixer: <css input>:116:3: grid-column-span is not part ' +
        'of final Grid Layout. Use grid-column.',
      'autoprefixer: <css input>:117:3: grid-row-span is not part ' +
        'of final Grid Layout. Use grid-row.',
      'autoprefixer: <css input>:118:3: grid-auto-columns is not ' +
        'supported by IE',
      'autoprefixer: <css input>:119:3: grid-auto-rows is not ' +
        'supported by IE',
      'autoprefixer: <css input>:121:33: auto-fill value is not ' +
        'supported by IE',
      'autoprefixer: <css input>:122:30: auto-fit value is not ' +
        'supported by IE',
      'autoprefixer: <css input>:138:3: Please do not use ' +
        'display: contents; if you have grid setting enabled',
      'autoprefixer: <css input>:142:3: IE does not support align-items ' +
        'on grid containers. Try using align-self on child elements instead: ' +
        '.warn_ie_align > * { align-self: center }',
      'autoprefixer: <css input>:147:3: IE does not support justify-items ' +
        'on grid containers. Try using justify-self on child elements ' +
        'instead: .warn_ie_justify > * { justify-self: center }',
      'autoprefixer: <css input>:152:3: IE does not support justify-content ' +
        'on grid containers',
      'autoprefixer: <css input>:157:3: IE does not support place-items ' +
        'on grid containers. Try using place-self on child elements ' +
        'instead: .warn_place_items > * { place-self: start end }',
      'autoprefixer: <css input>:181:3: grid-auto-flow is not supported by IE',
      'autoprefixer: <css input>:203:26: Autoprefixer currently does not ' +
        'support line names. Try using grid-template-areas instead.'
    ]
  )

  let input2 = read('grid-template')
  let output2 = read('grid-template.out')
  let instance2 = prefixer('grid-template')
  let result2 = postcss([instance2]).process(input2)
  equal(result2.css, output2)
})

test('supports grid autoplacement', () => {
  let input = read('grid-autoplacement')
  let output = read('grid-autoplacement.out')
  let instance = prefixer('grid')
  let result = postcss([instance]).process(input)
  equal(result.css, output)

  equal(
    result.warnings().map(i => i.toString()),
    [
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
    ]
  )
})

test('shows Grid warnings only for IE', () => {
  let input = 'a { grid-template-rows: repeat(auto-fit, 1px) }'
  let instance = autoprefixer({
    overrideBrowserslist: 'chrome 27',
    grid: true
  })
  let result = postcss([instance]).process(input)
  equal(result.warnings().length, 0)
})

test('warns if rule has both grid-area and grid-(row|column) decls', () => {
  let input = read('grid-area')
  let instance = prefixer('grid-area')
  let result = postcss([instance]).process(input)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:28:3: You already have a grid-area ' +
        'declaration present in the rule. You should use either ' +
        'grid-area or grid-row, not both',
      'autoprefixer: <css input>:29:3: You already have a grid-area ' +
        'declaration present in the rule. You should use either ' +
        'grid-area or grid-column, not both',
      'autoprefixer: <css input>:34:3: You already have a grid-area ' +
        'declaration present in the rule. You should use either ' +
        'grid-area or grid-column, not both'
    ]
  )
})

test('warns if rule with grid-area has no parent with grid-template', () => {
  let input = read('grid-template-areas')
  let instance = prefixer('grid-area')
  let result = postcss([instance]).process(input)

  equal(
    result
      .warnings()
      .map(i => i.toString())
      .filter(str => str.includes('grid-template')),
    [
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
    ]
  )
})

test('should preserve @media rules with grid-area', () => {
  let input = read('grid-area-media-sequence')
  let output = read('grid-area-media-sequence.out')
  let instance = prefixer('grid-area')
  let result = postcss([instance]).process(input)
  equal(result.css, output)
})

test('should merge complex duplicate grid-area rules successfully', () => {
  let input = read('grid-areas-duplicate-complex')
  let output = read('grid-areas-duplicate-complex.out')
  let instance = prefixer('grid-area')
  let result = postcss([instance]).process(input)
  equal(result.css, output)
})

test('ignores values for CSS3PIE props', () => {
  let css = read('pie')
  equal(postcss([compiler]).process(css).css, css)
})

test('add prefix for backface-visibility for Safari 9', () => {
  let input =
    'a{ ' + 'backface-visibility: hidden; ' + 'transform-style: preserve-3d }'
  let ap = autoprefixer({
    overrideBrowserslist: ['Safari 9'],
    flexbox: false
  })
  equal(
    postcss([ap]).process(input).css,
    'a{ ' +
      '-webkit-backface-visibility: hidden; ' +
      'backface-visibility: hidden; ' +
      'transform-style: preserve-3d }'
  )
})

test('supports text-decoration', () => {
  let input = read('text-decoration')
  let instance = prefixer('text-decoration')
  let result = postcss([instance]).process(input)
  equal(
    result.warnings().map(i => i.toString()),
    [
      'autoprefixer: <css input>:26:3: Replace text-decoration-skip: ink ' +
        'to text-decoration-skip-ink: auto, because spec had been changed'
    ]
  )
})

test('supports -webkit-line-clamp', () => {
  let input = read('webkit-line-clamp')
  let result = postcss([cleaner]).process(input)
  equal(result.css, input)
  equal(result.warnings().length, 0)
})

test('supports latest Firefox stretch', () => {
  let input = read('intrinsic')
  let output = read('intrinsic.ff')
  let result = postcss([
    autoprefixer({ overrideBrowserslist: 'firefox 90' })
  ]).process(input)
  equal(result.css, output)
  equal(result.warnings().length, 2)
})

test.run()

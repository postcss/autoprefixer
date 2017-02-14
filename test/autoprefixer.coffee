autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/browsers')

postcss = require('postcss')
fs      = require('fs')

grider = autoprefixer(browsers: ['Chrome 25', 'Edge 12', 'IE 10'], cascade: no)

cleaner      = autoprefixer(browsers: [])
compiler     = autoprefixer(browsers: ['Chrome 25', 'Opera 12'])
filterer     = autoprefixer(browsers: ['Chrome 25', 'Safari 9', 'Firefox 39'])
borderer     = autoprefixer(browsers: ['Safari 4', 'Firefox 3.6'])
keyframer    = autoprefixer(browsers: ['Chrome > 19', 'Opera 12'])
flexboxer    = autoprefixer(browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'])
without3d    = autoprefixer(browsers: ['Opera 12', 'IE > 0'])
uncascader   = autoprefixer(browsers: ['Firefox 15'])
supporter    = autoprefixer(browsers: ['Chrome 25', 'Chrome 28', 'IE > 0'])
gradienter   = autoprefixer(browsers: ['Chrome 25', 'Opera 12', 'Android 2.3'])
selectorer   = autoprefixer(browsers: ['Chrome 25', 'Firefox > 17', 'IE 10'])
intrinsicer  = autoprefixer(browsers: ['Chrome 25', 'Firefox 22'])
imagerender  = autoprefixer(browsers: ['iOS 8', 'iOS 6.1', 'FF 22', 'IE 11'])
backgrounder = autoprefixer(browsers: ['Firefox 3.6', 'Android 2.3'])
resolutioner = autoprefixer(browsers: ['Safari 7', 'Opera 12'])
transitioner = autoprefixer(browsers: ['Chrome 25', 'Firefox 15'])

cascader = autoprefixer
  browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'],
  cascade:  true

prefixer = (name) ->
  if name == 'grid'
    grider
  else if name == 'keyframes'
    keyframer
  else if name == 'border-radius'
    borderer
  else if name == 'vendor-hack' or name == 'value-hack' or name == 'mistakes'
    cleaner
  else if name == 'gradient'
    gradienter
  else if name == 'flexbox' or name == 'flex-rewrite' or name == 'double'
    flexboxer
  else if name == 'selectors' or name == 'placeholder'
    selectorer
  else if name == 'intrinsic' or name == 'multicolumn'
    intrinsicer
  else if name == 'cascade'
    cascader
  else if name == '3d-transform'
    without3d
  else if name == 'background-size'
    backgrounder
  else if name == 'background-clip'
    cleaner
  else if name == 'uncascade'
    uncascader
  else if name == 'example'
    autoprefixer
  else if name == 'viewport' or name == 'appearance'
    flexboxer
  else if name == 'resolution'
    resolutioner
  else if name == 'filter' or name == 'advanced-filter' or name == 'element'
    filterer
  else if name == 'image-rendering' or name == 'writing-mode'
    imagerender
  else if name == 'logical'
    intrinsicer
  else if name == 'supports'
    supporter
  else
    compiler

read = (name) ->
  fs.readFileSync(__dirname + "/cases/#{ name }.css").toString()

test = (from, instance = prefixer(from)) ->
  input  = read(from)
  output = read(from + '.out')
  result = postcss([instance]).process(input)
  result.warnings().length.should.eql(0)
  result.css.should.eql(output)

commons = ['transition', 'values', 'keyframes', 'gradient', 'flex-rewrite',
           'flexbox', 'filter', 'border-image', 'border-radius', 'notes',
           'selectors', 'placeholder', 'fullscreen', 'intrinsic', 'mistakes',
           'custom-prefix', 'cascade', 'double', 'multicolumn', '3d-transform',
           'background-size', 'supports', 'viewport', 'resolution', 'logical',
           'appearance', 'advanced-filter', 'element', 'image-set',
           'image-rendering', 'mask-border', 'writing-mode', 'cross-fade',
           'gradient-fix', 'text-emphasis-position', 'grid']

describe 'autoprefixer()', ->

  it 'throws on wrong options', ->
    ( ->
      autoprefixer({ browser: ['chrome 25', 'opera 12'] })
    ).should.throw(/browsers/)

  it 'sets options', ->
    opts = { browsers: ['chrome 25', 'opera 12'], cascade: false }
    autoprefixer(opts).options.should.eql(opts)

  it 'has default browsers', ->
    autoprefixer.defaults.should.be.an.instanceOf(Array)

  it 'passes statistics to Browserslist', ->
    stats =
      chrome:
        10: 10
        11: 40
      ie:
        10: 10
        11: 40

    autoprefixer(browsers: '> 20% in my stats', stats: stats).info()
      .should.match(/Browsers:\n  Chrome: 11\n  IE: 11\n/)

describe 'Autoprefixer', ->

  it 'prefixes values',                -> test('values')
  it 'prefixes @keyframes',            -> test('keyframes')
  it 'prefixes @viewport',             -> test('viewport')
  it 'prefixes selectors',             -> test('selectors')
  it 'prefixes resolution query',      -> test('resolution')
  it 'removes common mistakes',        -> test('mistakes')
  it 'reads notes for prefixes',       -> test('notes')
  it 'keeps vendor-specific hacks',    -> test('vendor-hack')
  it 'keeps values with vendor hacks', -> test('value-hack')
  it 'works with comments',            -> test('comments')
  it 'uses visual cascade',            -> test('cascade')
  it 'works with properties near',     -> test('double')
  it 'checks prefixed in hacks',       -> test('check-down')
  it 'normalize cascade after remove', -> test('uncascade')
  it 'prefix decls in @supports',      -> test('supports')
  it 'saves declaration style',        -> test('style')
  it 'uses control comments',          -> test('disabled')
  it 'has actual example in docs',     -> test('example')

  it 'prefixes transition', ->
    input  = read('transition')
    output = read('transition.out')
    result = postcss([prefixer('transition')]).process(input)

    result.css.should.eql(output)
    result.warnings().map( (i) -> i.toString() ).should.eql(
      ['autoprefixer: <css input>:23:5: Replace transition-property ' +
       'to transition, because Autoprefixer could not support any cases ' +
       'of transition-property and other transition-*'])

  it 'works with broken transition', ->
    input  = 'a{transition:,,}'
    output = 'a{-webkit-transition:;-o-transition:;transition:}'
    postcss([prefixer('transition')]).process(input).css.should.eql(output)

  it 'should ignore spaces inside values', ->
      css = read('trim')
      postcss([flexboxer]).process(css).css.should.eql(css)

  it 'removes unnecessary prefixes', ->
    for type in commons
      continue if type == 'gradient-fix'
      continue if type == 'cascade'
      continue if type == 'mistakes'
      continue if type == 'flex-rewrite'
      input  = read(type + '.out')
      output = read(type)
      postcss([cleaner]).process(input).css.should.eql(output)

  it 'does not remove unnecessary prefixes on request', ->
    for type in ['transition', 'values', 'fullscreen']
      keeper = autoprefixer(browsers: [], remove: false)
      css    = read(type + '.out')
      postcss([keeper]).process(css).css.should.eql(css)

  it 'does not add prefixes on request', ->
    for type in ['transition', 'values', 'fullscreen']
      remover    = autoprefixer(browsers: ['Opera 12'], add: false)
      unprefixed = read(type)
      postcss([remover]).process(unprefixed).css.should.eql(unprefixed)

  it 'prevents doubling prefixes', ->
    for type in commons
      processor = postcss([prefixer(type)])

      input  = read(type)
      output = read(type + '.out')
      processor.process( processor.process(input) ).css.should.eql(output)

  it 'parses difficult files', ->
    input  = read('syntax')
    result = postcss([cleaner]).process(input)
    result.css.should.eql(input)

  it 'marks parsing errors', ->
    ( ->
      postcss([cleaner]).process('a {').css
    ).should.throw("<css input>:1:1: Unclosed block")

  it 'shows file name in parse error', ->
    ( ->
      postcss([cleaner]).process('a {', from: 'a.css').css
    ).should.throw(/a.css:1:1: /)

  it 'uses browserslist config', ->
    path   = __dirname + '/cases/config/test.css'
    input  = read('config/test')
    output = read('config/test.out')
    postcss([autoprefixer]).process(input, from: path).css.should.eql(output)

  it 'sets browserslist environment', ->
    path   = __dirname + '/cases/config/test.css'
    input  = read('config/test')
    output = read('config/test.production')
    postcss([autoprefixer({ env: 'production' })])
      .process(input, from: path).css.should.eql(output)

  it 'works without source in nodes', ->
    root = postcss.root()
    root.append(selector: 'a')
    root.first.append(prop: 'display', value: 'flex')
    compiler(root)
    root.toString().should.eql(
      'a {\n    display: -webkit-flex;\n    display: flex\n}')

  it 'takes values from other PostCSS plugins', ->
    plugin = (css) ->
      css.walkDecls (i) -> i.value = "calc(0)"
    result = postcss([plugin, compiler]).process('a{width:0/**/0}')
    result.css.should.eql('a{width:-webkit-calc(0);width:calc(0)}')

  it 'has option to disable @supports support', ->
    css      = '@supports (cursor: grab) {}'
    instance = autoprefixer(browsers: ['Chrome 28'], supports: false)
    result   = postcss([instance]).process(css)
    result.css.should.eql(css)

  it 'has option to disable grid support', ->
    input    = read('grid')
    output   = read('grid.disabled')
    instance = autoprefixer(browsers: ['Edge 12', 'IE 10'], grid: false)
    result   = postcss([instance]).process(input)
    result.css.should.eql(output)

  it 'has option to disable flexbox support', ->
    css      = read('flexbox')
    instance = autoprefixer(browsers: ['IE 10'], flexbox: false)
    result   = postcss([instance]).process(css)
    result.css.should.eql(css)

  it 'has option to disable 2009 flexbox support', ->
    css      = 'a{flex:1}'
    instance = autoprefixer(browsers: ['Chrome > 19'], flexbox: 'no-2009')
    result   = postcss([instance]).process(css)
    result.css.should.eql('a{-webkit-flex:1;flex:1}')

  describe 'info()', ->

    it 'returns inspect string', ->
      autoprefixer(browsers: ['chrome 25']).info()
        .should.match(/Browsers:\s+Chrome: 25/)

  describe 'hacks', ->

    it 'ignores prefix IE filter',      -> test('filter')
    it 'changes border image syntax',   -> test('border-image')
    it 'supports old Mozilla prefixes', -> test('border-radius')
    it 'supports all flexbox syntaxes', -> test('flexbox')
    it 'supports map flexbox props',    -> test('flex-rewrite')
    it 'supports all fullscreens',      -> test('fullscreen')
    it 'supports custom prefixes',      -> test('custom-prefix')
    it 'fixes break properties',        -> test('multicolumn')
    it 'ignores some 3D transforms',    -> test('3d-transform')
    it 'supports background-size',      -> test('background-size')
    it 'supports background-clip',      -> test('background-clip')
    it 'supports logical properties',   -> test('logical')
    it 'supports appearance',           -> test('appearance')
    it 'supports all placeholders',     -> test('placeholder')
    it 'supports image-rendering',      -> test('image-rendering')
    it 'supports border-box mask',      -> test('mask-border')
    it 'supports image-set()',          -> test('image-set')
    it 'supports writing-mode',         -> test('writing-mode')
    it 'supports cross-fade()',         -> test('cross-fade')
    it 'supports grid layout',          -> test('grid')

    it 'changes angle in gradient', ->
      input  = read('gradient')
      output = read('gradient.out')
      result = postcss([prefixer('gradient')]).process(input)

      result.css.should.eql(output)
      result.warnings().map( (i) -> i.toString() ).should.eql(
        ['autoprefixer: <css input>:38:5: Gradient has outdated direction ' +
         'syntax. New syntax is like `to left` instead of `right`.'])

    it 'warns on old flexbox display', ->
      result = postcss([flexboxer]).process('a{ display: box; }')
      result.css.should.eql('a{ display: box; }')
      result.warnings().map( (i) -> i.toString() ).should.eql(
        ['autoprefixer: <css input>:1:4: You should write display: flex ' +
         'by final spec instead of display: box'])

     it 'warns on unsupported grid features', ->
       css      = read('nogrid')
       instance = autoprefixer(browsers: ['IE 10'], flexbox: false)
       result   = postcss([instance]).process(css)
       result.warnings().length.should.eql(0)

    it 'does not warns on unsupported grid on disabled grid', ->
      css    = read('nogrid')
      result = postcss([prefixer('transition')]).process(css)

    it 'supports intrinsic sizing', ->
      input  = read('intrinsic')
      output = read('intrinsic.out')
      result = postcss([prefixer('intrinsic')]).process(input)

      result.css.should.eql(output)
      result.warnings().map( (i) -> i.toString() ).should.eql([
        'autoprefixer: <css input>:15:5: Replace fill to stretch, ' +
        'because spec had been changed',
        'autoprefixer: <css input>:19:5: Replace fill-available to stretch, ' +
        'because spec had been changed'
      ])

    it 'supports text-emphasis', ->
      input  = read('text-emphasis-position')
      output = read('text-emphasis-position.out')
      result = postcss([prefixer('text-emphasis-position')]).process(input)

      result.css.should.eql(output)
      result.warnings().map( (i) -> i.toString() ).should.eql(
        ['autoprefixer: <css input>:14:5: You should use 2 values ' +
         'for text-emphasis-position For example, `under left` ' +
         'instead of just `under`.'])

    it 'ignores values for CSS3PIE props', ->
      css = read('pie')
      postcss([compiler]).process(css).css.should.eql(css)

    it 'add prefix for backface-visibility for Safari 9', ->
      input = 'a{ ' +
        'backface-visibility: hidden; ' +
        'transform-style: preserve-3d }'
      instance = autoprefixer(browsers: ['Safari 9'], flexbox: false)
      postcss([instance]).process(input).css.should.eql('a{ ' +
          '-webkit-backface-visibility: hidden; ' +
          'backface-visibility: hidden; ' +
          'transform-style: preserve-3d }')

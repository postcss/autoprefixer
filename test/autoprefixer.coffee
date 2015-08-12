autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/browsers')

postcss = require('postcss')
fs      = require('fs')

cleaner      = autoprefixer(browsers: [])
compiler     = autoprefixer(browsers: ['Chrome 25', 'Opera 12'])
filterer     = autoprefixer(browsers: ['Chrome 39', 'Opera 12', 'Safari 9', 'Firefox 39'])
borderer     = autoprefixer(browsers: ['Safari 4', 'Firefox 3.6'])
keyframer    = autoprefixer(browsers: ['Chrome > 19', 'Opera 12'])
flexboxer    = autoprefixer(browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'])
without3d    = autoprefixer(browsers: ['Opera 12', 'IE > 0'])
uncascader   = autoprefixer(browsers: ['Firefox 15'])
gradienter   = autoprefixer(browsers: ['Chrome 25', 'Opera 12', 'Android 2.3'])
selectorer   = autoprefixer(browsers: ['Chrome 25', 'Firefox > 17', 'IE 10'])
intrinsicer  = autoprefixer(browsers: ['Chrome 25', 'Firefox 22'])
imagerender  = autoprefixer(browsers: ['iOS 8', 'iOS 6.1', 'FF 22', 'IE 11'])
backgrounder = autoprefixer(browsers: ['Firefox 3.6', 'Android 2.3'])
resolutioner = autoprefixer(browsers: ['Safari 7', 'Opera 12'])

cascader = autoprefixer
  browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'],
  cascade:  true

prefixer = (name) ->
  if name == 'keyframes'
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
  else if name == 'image-rendering'
    imagerender
  else if name == 'logical'
    intrinsicer
  else
    compiler

read = (name) ->
  fs.readFileSync(__dirname + "/cases/#{ name }.css").toString()

test = (from, instance = prefixer(from)) ->
  input  = read(from)
  output = read(from + '.out')
  postcss([instance]).process(input).css.should.eql(output)

commons = ['transition', 'values', 'keyframes', 'gradient', 'flex-rewrite',
           'flexbox', 'filter', 'border-image', 'border-radius', 'notes',
           'selectors', 'placeholder', 'fullscreen', 'intrinsic', 'mistakes',
           'custom-prefix', 'cascade', 'double', 'multicolumn', '3d-transform',
           'background-size', 'supports', 'viewport', 'resolution', 'logical',
           'appearance', 'advanced-filter', 'element']

describe 'autoprefixer()', ->

  it 'sets options', ->
    opts = { browsers: ['chrome 25', 'opera 12'], cascade: false }
    autoprefixer(opts).options.should.eql(opts)

  it 'has default browsers', ->
    autoprefixer.defaults.should.be.an.instanceOf(Array)

describe 'Autoprefixer', ->

  it 'prefixes transition',            -> test('transition')
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

  it 'should ignore spaces inside values', ->
      css = read('trim')
      postcss([flexboxer]).process(css).css.should.eql(css)

  it 'removes unnecessary prefixes', ->
    for type in commons
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
      remover = autoprefixer(browsers: ['Opera 12'], add: false)
      opera   = autoprefixer(browsers: ['Opera 12'])

      unprefixed = read(type)
      prefixed   = read(type + '.out')

      output = postcss([opera]).process(unprefixed).css
      postcss([remover]).process(prefixed).css.should.eql(output)

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
    it 'supports intrinsic sizing',     -> test('intrinsic')
    it 'supports custom prefixes',      -> test('custom-prefix')
    it 'fixes break-inside property',   -> test('multicolumn')
    it 'ignores some 3D transforms',    -> test('3d-transform')
    it 'supports background-size',      -> test('background-size')
    it 'supports background-clip',      -> test('background-clip')
    it 'supports logical properties',   -> test('logical')
    it 'supports appearance',           -> test('appearance')
    it 'supports all placeholders',     -> test('placeholder')

    it 'changes angle in gradient', ->
      input  = read('gradient')
      output = read('gradient.out')
      result = postcss([prefixer('gradient')]).process(input)

      result.css.should.eql(output)
      result.warnings().map( (i) -> i.toString() ).should.eql(
        ['autoprefixer: <css input>:38:5: Gradient has outdated direction ' +
         'syntax. New syntax is like "to left" instead of "right".'])

    it 'supports image-rendering', ->
      input  = read('image-rendering')
      output = read('image-rendering.out')
      result = postcss([prefixer('image-rendering')]).process(input)

      result.css.should.eql(output)
      result.warnings().map( (i) -> i.toString() ).should.eql(
        ['autoprefixer: <css input>:2:5: There is no browsers with ' +
         'crisp-edges rendering support.Maybe you mean pixelated?'])

    it 'warn on old flexbox display', ->
      result = postcss([flexboxer]).process('a{ display: box; }')
      result.css.should.eql('a{ display: box; }')
      result.warnings().map( (i) -> i.toString() ).should.eql(
        ['autoprefixer: <css input>:1:4: You should write display: flex ' +
         'by final spec instead of display: box'])

    it 'ignores values for CSS3PIE props', ->
      css = read('pie')
      postcss([compiler]).process(css).css.should.eql(css)

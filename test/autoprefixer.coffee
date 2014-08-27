autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/browsers')
postcss      = require('postcss')
fs           = require('fs')

cleaner      = autoprefixer(browsers: [])
compiler     = autoprefixer(browsers: ['Chrome 25', 'Opera 12'])
borderer     = autoprefixer(browsers: ['Safari 4', 'Firefox 3.6'])
keyframer    = autoprefixer(browsers: ['Chrome > 19', 'Opera 12'])
flexboxer    = autoprefixer(browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'])
without3d    = autoprefixer(browsers: ['Opera 12', 'IE > 0'])
uncascader   = autoprefixer(browsers: ['Firefox 15'])
gradienter   = autoprefixer(browsers: ['Chrome 25', 'Opera 12', 'Android 2.3'])
selectorer   = autoprefixer(browsers: ['Chrome 25', 'Firefox > 17', 'IE 10'])
intrinsicer  = autoprefixer(browsers: ['Chrome 25', 'Firefox 22'])
backgrounder = autoprefixer(browsers: ['Firefox 3.6', 'Android 2.3'])


cascader = autoprefixer
  browsers: ['Chrome > 19', 'Firefox 21', 'IE 10'],
  cascade:  true

prefixer = (name) ->
  if name == 'keyframes'
    keyframer
  else if name == 'border-radius'
    borderer
  else if name == 'vendor-hack' or name == 'mistakes'
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
  else if name == 'uncascade'
    uncascader
  else if name == 'example'
    autoprefixer
  else
    compiler

read = (name) ->
  fs.readFileSync(__dirname + "/cases/#{ name }.css").toString()

test = (from, instansce = prefixer(from)) ->
  input  = read(from)
  output = read(from + '.out')
  result = instansce.process(input)
  result.css.should.eql(output)

commons = ['transition', 'values', 'keyframes', 'gradient', 'flex-rewrite',
           'flexbox', 'filter', 'border-image', 'border-radius', 'notes',
           'selectors', 'placeholder', 'fullscreen', 'intrinsic', 'mistakes',
           'custom-prefix', 'cascade', 'double', 'multicolumn', '3d-transform',
           'background-size', 'supports']

describe 'autoprefixer()', ->

  it 'sets options', ->
    opts = { browsers: ['chrome 25', 'opera 12'], cascade: false }
    processor = autoprefixer(opts)
    processor.prefixes.options.should.eql(opts)
    processor.browsers.should.eql(['chrome 25', 'opera 12'])

  it 'has default browsers', ->
    autoprefixer.default.should.be.an.instanceOf(Array)

  it 'sets default browser', ->
    defaults  = new Browsers(autoprefixer.data.browsers, autoprefixer.default)
    processor = autoprefixer()
    processor.browsers.should.eql(defaults.selected)
    processor.prefixes.options.should.eql({ })

describe 'Autoprefixer', ->

  describe 'process()', ->

    it 'prefixes transition',            -> test('transition')
    it 'prefixes values',                -> test('values')
    it 'prefixes @keyframes',            -> test('keyframes')
    it 'prefixes selectors',             -> test('selectors')
    it 'removes common mistakes',        -> test('mistakes')
    it 'reads notes for prefixes',       -> test('notes')
    it 'keeps vendor-specific hacks',    -> test('vendor-hack')
    it 'works with comments',            -> test('comments')
    it 'uses visual cascade',            -> test('cascade')
    it 'works with properties near',     -> test('double')
    it 'checks prefixed in hacks',       -> test('check-down')
    it 'normalize cascade after remove', -> test('uncascade')
    it 'prefix decls in @supports',      -> test('supports')
    it 'saves declaration style',        -> test('style')
    it 'uses control comments',          -> test('disabled')
    it 'has actual example in docs',     -> test('example')

    it 'should irgnore spaces inside values', ->
        css = read('trim')
        flexboxer.process(css).css.should.eql(css)

    it 'removes unnecessary prefixes', ->
      for type in commons
        continue if type == 'cascade'
        continue if type == 'mistakes'
        continue if type == 'flex-rewrite'
        input  = read(type + '.out')
        output = read(type)
        result = cleaner.process(input)
        result.css.should.eql(output)

    it 'prevents doubling prefixes', ->
      for type in commons
        instance = prefixer(type)

        input  = read(type)
        output = read(type + '.out')
        result = instance.process( instance.process(input) )
        result.css.should.eql(output)

    it 'parses difficult files', ->
      input  = read('syntax')
      result = cleaner.process(input)
      result.css.should.eql(input)

    it 'marks parsing errors', ->
      ( ->
        cleaner.process('a {')
      ).should.throw("<css input>:1:1: Unclosed block")

    it 'shows file name in parse error', ->
      ( ->
        cleaner.process('a {', from: 'a.css')
      ).should.throw(/^a.css:1:1: /)

  describe 'postcss()', ->

    it 'is a PostCSS filter', ->
      postcss( compiler ).process( read('values') ).css
        .should.eql( read('values.out') )

    it 'is a PostCSS filter with default browsers', ->
      postcss( autoprefixer ).process( read('values') ).css
        .should.be.type('string')

  describe 'info()', ->

    it 'returns inspect string', ->
      autoprefixer(browsers: ['chrome 25']).info()
        .should.match(/Browsers:\s+Chrome: 25/)

  describe 'hacks', ->

    it 'changes angle in gradient',     -> test('gradient')
    it 'ignores prefix IE filter',      -> test('filter')
    it 'change border image syntax',    -> test('border-image')
    it 'supports old Mozilla prefixes', -> test('border-radius')
    it 'supports all flexbox syntaxes', -> test('flexbox')
    it 'supports map flexbox props',    -> test('flex-rewrite')
    it 'supports all placeholders',     -> test('placeholder')
    it 'supports all fullscreens',      -> test('fullscreen')
    it 'supports intrinsic sizing',     -> test('intrinsic')
    it 'supports custom prefixes',      -> test('custom-prefix')
    it 'fix break-inside property',     -> test('multicolumn')
    it 'ignores some 3D transforms',    -> test('3d-transform')
    it 'support background-size',       -> test('background-size')

    it 'ignores values for CSS3PIE props', ->
      input  = read('pie')
      result = compiler.process(input)
      result.css.should.eql(input)

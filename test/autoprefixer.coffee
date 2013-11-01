autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/autoprefixer/browsers')
postcss      = require('postcss')
fs           = require('fs')

cleaner     = autoprefixer('none')
compiler    = autoprefixer('chrome 25', 'opera 12')
borderer    = autoprefixer('safari 4',  'ff 3.6')
keyframer   = autoprefixer('safari 6',  'chrome 25', 'opera 12')
flexboxer   = autoprefixer('safari 6',  'chrome 25', 'ff 21', 'ie 10')
gradienter  = autoprefixer('chrome 25', 'opera 12', 'android 2.3')
selectorer  = autoprefixer('chrome 25', 'ff 22', 'ie 10')
intrinsicer = autoprefixer('chrome 25', 'ff 22')

prefixer = (name) ->
  if name == 'keyframes'
    keyframer
  else if name == 'border-radius'
    borderer
  else if name == 'vendor-hack' or name == 'mistakes'
    cleaner
  else if name == 'gradient'
    gradienter
  else if name == 'flexbox' or name == 'flex-rewrite'
    flexboxer
  else if name == 'selectors' or name == 'placeholder'
    selectorer
  else if name == 'intrinsic'
    intrinsicer
  else
    compiler

read = (name) ->
  fs.readFileSync(__dirname + "/cases/#{ name }.css").toString()

test = (from, instansce = prefixer(from)) ->
  input  = read(from)
  output = read(from + '.out')
  css    = instansce.compile(input)
  css.should.eql(output)

commons = ['transition', 'values', 'keyframes', 'gradient', 'flex-rewrite',
           'flexbox', 'filter', 'border-image', 'border-radius', 'notes',
           'selectors', 'placeholder', 'fullscreen', 'intrinsic', 'mistakes',
           'custom-prefix']

describe 'autoprefixer()', ->

  it 'sets browsers', ->
    compiler.browsers.should.eql ['chrome 25', 'opera 12']

  it 'receives array', ->
    autoprefixer(['chrome 25', 'opera 12']).browsers.
      should.eql ['chrome 25', 'opera 12']

  it 'has default browsers', ->
    autoprefixer.default.should.be.an.instanceOf(Array)

  it 'sets default browser', ->
    browsers = new Browsers(autoprefixer.data.browsers, autoprefixer.default)
    autoprefixer().browsers.should.eql(browsers.selected)

describe 'Autoprefixer', ->

  describe 'compile()', ->

    it 'prefixes transition',         -> test('transition')
    it 'prefixes values',             -> test('values')
    it 'prefixes @keyframes',         -> test('keyframes')
    it 'prefixes selectors',          -> test('selectors')
    it 'removes common mistakes',     -> test('mistakes')
    it 'reads notes for prefixes',    -> test('notes')
    it 'keeps vendor-specific hacks', -> test('vendor-hack')

    it 'removes unnecessary prefixes', ->
      test('old', cleaner)

      for type in commons
        continue if type == 'mistakes' or type == 'flex-rewrite'
        input  = read(type + '.out')
        output = read(type)
        css    = cleaner.compile(input)
        css.should.eql(output)

    it "doesn't double prefixes", ->
      for type in commons
        instance = prefixer(type)

        input  = read(type)
        output = read(type + '.out')
        css    = instance.compile( instance.compile(input) )
        css.should.eql(output)

    it 'parses difficult files', ->
      input  = read('syntax')
      output = cleaner.compile(input)
      input.should.eql(output)

    it 'marks parsing errors', ->
      error = null
      try
        cleaner.compile('a {')
      catch e
        error = e

      error.message.should.eql "Can't parse CSS: Unclosed block at line 1:1"

  describe 'postcss()', ->

    it 'is a PostCSS filter', ->
      processor = postcss( compiler.postcss )
      processor.process( read('values') ).should.eql( read('values.out') )

  describe 'inspect()', ->

    it 'returns inspect string', ->
      autoprefixer('chrome 25').inspect().should.match(/Browsers:\s+Chrome: 25/)

  describe 'hacks', ->

    it 'changes angle in gradient',     -> test('gradient')
    it "doesn't prefix IE filter",      -> test('filter')
    it 'change border image syntax',    -> test('border-image')
    it 'supports old Mozilla prefixes', -> test('border-radius')
    it 'supports all flexbox syntaxes', -> test('flexbox')
    it 'supports map flexbox props',    -> test('flex-rewrite')
    it 'supports all placeholders',     -> test('placeholder')
    it 'supports all fullscreens',      -> test('fullscreen')
    it 'supports intrinsic sizing',     -> test('intrinsic')
    it 'supports custom prefixes',      -> test('custom-prefix')

    it 'ignores transform in transition for IE', ->
      input  = read('ie-transition')
      output = autoprefixer('ie > 0').compile(input)
      input.should.eql(output)

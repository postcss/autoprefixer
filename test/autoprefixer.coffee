autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/autoprefixer/browsers')
cases        = require('./lib/cases')
rework       = require('rework')

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

compare = (from, to) ->
  cases.clean(from).should.eql cases.clean(to)

compareWithoutComments = (from, to) ->
  clean = (string) -> string.replace(/\/\*[^\*]*\*\//g, '')
  compare(clean(from), clean(to))

test = (from, instansce = prefixer(from)) ->
  input  = cases.read('autoprefixer/' + from)
  output = cases.read('autoprefixer/' + from + '.out')
  css    = instansce.compile(input)
  compare(css, output)

commons = ['transition', 'values', 'keyframes', 'gradient', 'filter', 'notes',
           'flexbox', 'flex-rewrite', 'border-image', 'border-radius',
           'selectors', 'placeholder', 'fullscreen', 'intrinsic', 'mistakes']

describe 'autoprefixer()', ->

  it 'sets browsers', ->
    compiler.browsers.should.eql ['chrome 25', 'opera 12']

  it 'receives array', ->
    autoprefixer(['chrome 25', 'opera 12']).browsers.
      should.eql ['chrome 25', 'opera 12']

  it 'has default browsers', ->
    autoprefixer.default.should.eql(['last 2 versions'])

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
        input  = cases.read('autoprefixer/' + type + '.out')
        output = cases.read('autoprefixer/' + type)
        css    = cleaner.compile(input)
        compare(css, output)

    it "doesn't double prefixes", ->
      for type in commons
        instansce = prefixer(type)

        input  = cases.read('autoprefixer/' + type)
        output = cases.read('autoprefixer/' + type + '.out')
        css    = instansce.compile( instansce.compile(input) )
        compare(css, output)

    it 'parses difficult files', ->
      input  = cases.read('autoprefixer/syntax')
      output = cleaner.compile(input)
      compareWithoutComments(input, output)

    it 'marks parsing errors', ->
      error = null
      try
        cleaner.compile('a {')
      catch e
        error = e

      error.message.should.eql "Can't parse CSS: missing '}' near line 1:4"
      error.css.should.be.true

  describe 'rework()', ->

    it 'is a Rework filter', ->
      for type in commons
        instansce = prefixer(type)

        real = rework(cases.read('autoprefixer/' + type)).
          use(instansce.rework).
          toString()
        compare(real, cases.read('autoprefixer/' + type + '.out'))

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

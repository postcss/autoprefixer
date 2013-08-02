autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/autoprefixer/browsers')
cases        = require('./lib/cases')
rework       = require('rework')

cleaner     = autoprefixer('none')
compiler    = autoprefixer('chrome 25', 'opera 12')
borderer    = autoprefixer('safari 4', 'ff 3.6')
flexboxer   = autoprefixer('chrome 25', 'ff 21', 'ie 10')
selectioner = autoprefixer('ff 22')

prefixer = (name) ->
  if name == 'border-radius'
    borderer
  else if name == 'flexbox'
    flexboxer
  else if name == 'selectors'
    selectioner
  else
    compiler

compare = (from, to) ->
  cases.clean(from).should.eql cases.clean(to)

test = (from, instansce = prefixer(from)) ->
  input  = cases.read('autoprefixer/' + from)
  output = cases.read('autoprefixer/' + from + '.out')
  css    = instansce.compile(input)
  compare(css, output)

commons = ['transition', 'values', 'keyframes', 'gradient', 'filter', 'flexbox',
            'border-image', 'border-radius', 'background-clip', 'selectors',
            'placeholder']

describe 'autoprefixer()', ->

  it 'sets browsers', ->
    compiler.browsers.should.eql ['chrome 25', 'opera 12']

  it 'receives array', ->
    autoprefixer(['chrome 25', 'opera 12']).browsers.
      should.eql ['chrome 25', 'opera 12']

  it 'sets default browser', ->
    defalt = new Browsers(autoprefixer.data.browsers)
    autoprefixer().browsers.should.eql defalt.selected

describe 'Autoprefixer', ->

  describe 'compile()', ->

    it 'prefixes transition', -> test('transition')
    it 'prefixes values',     -> test('values')
    it 'prefixes @keyframes', -> test('keyframes')
    it 'prefixes selectors',  -> test('selectors', selectioner)

    it 'removes unnecessary prefixes', ->
      test('old', cleaner)
      for type in commons
        continue if type == 'background-clip'
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
      compare(input.replace('/*{}*/', ''), output)

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
    it "doesn't remove text clip",      -> test('background-clip')
    it 'change border image syntax',    -> test('border-image')
    it 'supports old Mozilla prefixes', -> test('border-radius', borderer)
    it 'supports all flexbox syntaxes', -> test('flexbox',       flexboxer)
    it 'supports all placeholders',     -> test('placeholder')

autoprefixer = require('../lib/autoprefixer')
Browsers     = require('../lib/autoprefixer/browsers')
cases        = require('./lib/cases')

cleaner   = autoprefixer('none')
compiler  = autoprefixer('chrome 25', 'opera 12')
borderer  = autoprefixer('safari 4', 'ff 3.6')
flexboxer = autoprefixer('chrome 25', 'ff 21', 'ie 10')

commons = ['transition', 'values', 'keyframes', 'gradient', 'filter', 'clip']

describe 'autoprefixer', ->
  compare = (from, to) ->
    cases.clean(from).should.eql cases.clean(to)

  test = (from, to) ->
    input  = cases.read('autoprefixer.' + from)
    output = cases.read('autoprefixer.' + to)
    css    = compiler.compile(input)
    compare(css, output)

  describe '()', ->

    it 'sets browsers', ->
      compiler.browsers.should.eql ['chrome 25', 'opera 12']

    it 'receives array', ->
      autoprefixer(['chrome 25', 'opera 12']).browsers.
        should.eql ['chrome 25', 'opera 12']

    it 'sets default browser', ->
      defalt = new Browsers(autoprefixer.data.browsers)
      autoprefixer().browsers.should.eql defalt.selected

  describe 'compile()', ->

    it 'prefixes transition', -> test('transition', 'transition.out')
    it 'prefixes values',     -> test('values', 'values.out')
    it 'prefixes @keyframes', -> test('keyframes', 'keyframes.out')

    it 'removes unnecessary prefixes', ->
      for type in ['transition', 'values', 'keyframes', 'gradient', 'filter',
                   'border-radius', 'flexbox']
        input  = cases.read('autoprefixer.' + type + '.out')
        output = cases.read('autoprefixer.' + type)
        css    = cleaner.compile(input)
        compare(css, output)

      input  = cases.read('autoprefixer.old')
      output = cases.read('autoprefixer.old.out')
      css    = cleaner.compile(input)
      compare(css, output)

    it "doesn't double prefixes", ->
      check = (type, instansce) ->
        input  = cases.read('autoprefixer.' + type)
        output = cases.read('autoprefixer.' + type + '.out')
        css    = instansce.compile( instansce.compile(input) )
        compare(css, output)

      for i in commons
        check(i, compiler)
      check('border-radius', borderer)
      check('flexbox',       flexboxer)

    it 'parses difficult files', ->
      input  = cases.read('autoprefixer.syntax')
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
      rework = require('rework')
      for type in commons
        ideal = cases.read('autoprefixer.' + type + '.out')
        real  = rework(cases.read('autoprefixer.' + type)).
          use(compiler.rework).
          toString()
        compare(ideal, real)

  describe 'inspect()', ->

    it 'returns inspect string', ->
      autoprefixer('chrome 25').inspect().should.match(/Browsers:\s+Chrome: 25/)

  describe 'hacks', ->

    it 'changes angle in gradient',  -> test('gradient',     'gradient.out')
    it "doesn't prefix IE filter",   -> test('filter',       'filter.out')
    it "doesn't remove text clip",   -> test('clip',         'clip.out')
    it 'change border image syntax', -> test('border-image', 'border-image.out')

    it 'supports old Mozilla prefixes', ->
      input  = cases.read('autoprefixer.border-radius')
      output = cases.read('autoprefixer.border-radius.out')
      css    = borderer.compile(input)
      compare(css, output)

    it 'supports all flexbox syntaxes', ->
      input  = cases.read('autoprefixer.flexbox')
      output = cases.read('autoprefixer.flexbox.out')
      css    = flexboxer.compile(input)
      compare(css, output)

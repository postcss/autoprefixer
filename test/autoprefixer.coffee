autoprefixer = require('../lib/autoprefixer')
cases        = require('./lib/cases')

describe 'Autoprefixer', ->
  compare = (from, to) ->
    cases.clean(from).should.eql cases.clean(to)

  test = (from, to) ->
    input  = cases.read('autoprefixer.' + from)
    output = cases.read('autoprefixer.' + to)
    css    = autoprefixer.compile(input, ['chrome 25', 'opera 12'])
    compare(css, output)

  describe 'compile()', ->

    it 'should prefix transition', -> test('transition', 'transition.out')
    it 'should prefix values',     -> test('values', 'values.out')
    it 'should prefix @keyframes', -> test('keyframes', 'keyframes.out')

    it 'should remove unnecessary prefixes', ->
      for type in ['transition', 'values', 'keyframes', 'gradient']
        input  = cases.read('autoprefixer.' + type + '.out')
        output = cases.read('autoprefixer.' + type)
        css    = autoprefixer.compile(input, [])
        compare(css, output)

      input  = cases.read('autoprefixer.old')
      output = cases.read('autoprefixer.old.out')
      css    = autoprefixer.compile(input, [])
      compare(css, output)

    it 'should not double prefixes', ->
      for type in ['transition', 'values', 'keyframes', 'gradient']
        input  = cases.read('autoprefixer.' + type)
        output = cases.read('autoprefixer.' + type + '.out')
        css    = autoprefixer.compile(input, ['chrome 25', 'opera 12'])
        css    = autoprefixer.compile(css,   ['chrome 25', 'opera 12'])
        compare(css, output)

    it 'should parse difficult files', ->
      input  = cases.read('autoprefixer.syntax')
      output = autoprefixer.compile(input, [])
      compare(input.replace('/**/', '').replace('/*{}*/', ''), output)

  describe 'rework()', ->

    it 'should be a Rework filter', ->
      rework = require('rework')
      for type in ['transition', 'values', 'keyframes', 'gradient']
        ideal = cases.read('autoprefixer.' + type + '.out')
        real  = rework(cases.read('autoprefixer.' + type)).
          use(autoprefixer.rework(['chrome 25', 'opera 12'])).
          toString()
        compare(ideal, real)

  describe 'inspect()', ->

    it 'should return inspect string', ->
      autoprefixer.inspect('chrome 25').should.match(/Browsers:\s+Chrome: 25/)

  describe 'hacks', ->

    it 'should change angles in gradients', -> test('gradient', 'gradient.out')

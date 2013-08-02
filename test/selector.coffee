Selector = require('../lib/autoprefixer/selector')

describe 'Selector', ->
  beforeEach ->
    @selector = new Selector('::selection')

  describe '.load()', ->

    it 'loads class by value', ->
      class Hacked
        @names = ['hacked', 'hhacked']
        constructor: (@name, @prefixes) ->
      Selector.register(Hacked)

      hacked = Selector.load('hacked', ['-o-'])
      hacked.should.be.an.instanceof(Hacked)
      hacked.name.should.eql 'hacked'
      hacked.prefixes.should.eql ['-o-']

      Selector.load('hhacked').should.be.an.instanceof(Hacked)
      Selector.load('b').should.be.an.instanceof(Selector)

  describe 'prefixed()', ->

    it 'adds prefix after non-letters symbols', ->
      @selector.prefixed('-moz-').should.eql('::-moz-selection')

  describe 'check()', ->

    it 'shecks rule selectors', ->
      @selector.check('body ::selection').should.be.true
      @selector.check('body .selection').should.be.false

  describe 'replace()', ->

    it 'should add prefix to selectors', ->
      @selector.replace('body ::selection, input::selection, a', '-ms-').
        should.eql('body ::-ms-selection, input::-ms-selection, a')

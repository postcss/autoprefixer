OldValue = require('../lib/autoprefixer/old-value')
Value    = require('../lib/autoprefixer/value')
utils    = require('../lib/autoprefixer/utils')

describe 'Value', ->
  beforeEach ->
    @calc  = new Value('calc', ['-o-'])
    @hacks = Value.hacks
    Value.hacks = { }

  afterEach ->
    Value.hachs = @hacks

  describe '.regexp()', ->

    it 'caches RegExp', ->
      Object.keys(Value.regexps).should.not.include('rg')
      Value.regexp('rg').should.eql Value.regexps.rg
      Object.keys(Value.regexps).should.include('rg')

  describe '.load()', ->

    it 'loads class by value', ->
      class Hacked
        @names = ['hacked', 'hhacked']
        constructor: (@name, @prefixes) ->
      Value.register(Hacked)

      hacked = Value.load('hacked', ['-o-'])
      hacked.should.be.an.instanceof(Hacked)
      hacked.name.should.eql 'hacked'
      hacked.prefixes.should.eql ['-o-']

      Value.load('hhacked').should.be.an.instanceof(Hacked)
      Value.load('b').should.be.an.instanceof(Value)

  describe 'check()', ->

    it 'checks value in string', ->
      @calc.check('calc(1px + 1em)'    ).should.be.true
      @calc.check('1px calc(1px + 1em)').should.be.true
      @calc.check('(calc(1px + 1em))'  ).should.be.true

      @calc.check('-o-calc').should.be.false
      @calc.check('calced' ).should.be.false

  describe 'old()', ->

    it 'check prefixed value', ->
      @calc.old('-o-').should.eql new OldValue('-o-calc')

  describe 'addPrefix()', ->

    it 'adds prefix to value', ->
      @calc.addPrefix('-o-', '1px calc(1em)').should.eql '1px -o-calc(1em)'
      @calc.addPrefix('-o-', '1px,calc(1em)').should.eql '1px,-o-calc(1em)'

Value = require('../lib/autoprefixer/value')

describe 'Value', ->
  beforeEach ->
    @calc = new Value('calc', ['-o-'])
    @hacks = Value.hacks

  afterEach ->
    Value.hachs = @hacks

  describe '.load()', ->

    it 'should load class by value', ->
      class A
        constructor: (@name, @prefixes) ->
      Value.register('a', 'aa', A)

      a = Value.load('a', ['-o-'])
      a.should.be.an.instanceof(A)
      a.name.should.eql 'a'
      a.prefixes.should.eql ['-o-']

      Value.load('aa').should.be.an.instanceof(A)
      Value.load('b').should.be.an.instanceof(Value)

  describe 'check()', ->

    it 'should check value in string', ->
      @calc.check(value: 'calc(1px + 1em)'    ).should.be.true
      @calc.check(value: '1px calc(1px + 1em)').should.be.true
      @calc.check(value: '(calc(1px + 1em))'  ).should.be.true

      @calc.check(value: '-o-calc').should.be.false
      @calc.check(value: 'calced' ).should.be.false

  describe 'prefixed()', ->

    it 'should check prefixed value', ->
      regexp = @calc.prefixed('-o-')
      regexp.test('1px -o-calc(1px)').should.be.true
      regexp.test('1px calc(1px)').should.be.false

  describe 'addPrefix()', ->

    it 'should add prefix to value', ->
      @calc.addPrefix('-o-', '1px calc(1em)').should.eql '1px -o-calc(1em)'
      @calc.addPrefix('-o-', '1px,calc(1em)').should.eql '1px,-o-calc(1em)'

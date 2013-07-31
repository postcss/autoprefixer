cases        = require('./lib/cases')
utils        = require('../lib/autoprefixer/utils')

Rule         = require('../lib/autoprefixer/rule')
Value        = require('../lib/autoprefixer/value')
Declaration  = require('../lib/autoprefixer/declaration')

describe 'Declaration', ->
  decl = null

  beforeEach ->
    @hacks = utils.clone Declaration.hacks

    @nodes = cases.load('declaration/declaration')
    @list  = @nodes.stylesheet.rules[0].declarations
    @rule  = new Rule(@list)

    decl = (number) =>
      @rule.number = number
      Declaration.load(@rule, number, @list[number])

  afterEach ->
    Declaration.hachs = @hacks

  describe '.split()', ->

    it 'splits prefix', ->
      Declaration.split('color').should.eql ['', 'color']
      Declaration.split('-webkit-filter').should.eql ['-webkit-', 'filter']

  describe '.load()', ->

    it 'loads class by property', ->
      class Hacked
        @names = ['hacked', 'hhacked']
      Declaration.register(Hacked)

      load = (prop) -> Declaration.load({ }, 0, property: prop)

      load('hacked'   ).should.be.an.instanceof(Hacked)
      load('hhacked'  ).should.be.an.instanceof(Hacked)
      load('-o-hacked').should.be.an.instanceof(Hacked)

      load('color'    ).should.be.an.instanceof(Declaration)
      load('-o-color' ).should.be.an.instanceof(Declaration)

  describe 'unprefixed', ->

    it 'splits prefix and property name', ->
      decl(0).unprefixed.should.eql 'transform'
      decl(0).prefix.should.eql     '-moz-'
      decl(0).prop.should.eql       '-moz-transform'

  describe 'valueContain()', ->

    it 'checks value to contain any of the strings', ->
      decl(0).valueContain(['-webkit-', '-moz-']).should.be.true
      decl(0).valueContain(['-ms-', '-o-']).should.be.false

  describe 'prefixProp()', ->

    it 'inserts a new rule with prefix', ->
      decl(1).prefixProp('-webkit-')
      cases.compare(@nodes, 'declaration/prefix')

    it "doesn't insert double prefixed values", ->
      decl(1).insertBefore('-webkit-display', 'inline')
      decl(2).prefixProp('-webkit-')
      @list.length.should.eql 4

    it "doesn't double prefixes", ->
      decl(0).prefixProp('-webkit-')
      decl(0).prop.should.eql('-webkit-transform')

    it "should change value", ->
      decl(0).prefixProp('-webkit-', '1')
      decl(0).value.should.eql('1')

  describe 'insertBefore()', ->

    it 'inserts clone before', ->
      display = decl(1)
      display.node.one = 1
      display.insertBefore('color', 'black')

      @list[1].one.should.eql 1
      @list[1].property.should.eql 'color'
      @list[1].value.should.eql 'black'

      @list.length.should.eql 4

    it "doesn't insert the same declaration twice", ->
      decl(1).insertBefore('display', 'block')
      cases.compare(@nodes, 'declaration/declaration')

  describe 'remove()', ->

    it 'removes self', ->
      decl(0).remove()
      cases.compare(@nodes, 'declaration/remove')

  describe 'setValue()', ->

    it 'updates local and node values', ->
      margin = decl(2)
      margin.setValue('0')
      margin.value.should.eql '0'
      margin.node.value.should.eql '0'

  describe 'prefixValue()', ->

    it 'combines value changes', ->
      margin = decl(2)
      calc   = new Value('calc', ['-moz-', '-o-'])
      step   = new Value('step', ['-o-'])

      margin.prefixValue('-moz-', calc)
      margin.prefixValue('-o-',   calc)
      margin.prefixValue('-o-',   step)
      margin.saveValues()

      cases.compare(@nodes, 'declaration/values')

    it 'combines prefix value changes', ->
      @rule.prefix = '-o-'
      margin = decl(2)
      calc   = new Value('calc', ['-o-'])

      margin.prefixValue('-o-', calc)
      margin.saveValues()

      cases.compare(@nodes, 'declaration/prefix-value')

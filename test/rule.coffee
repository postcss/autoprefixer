Rule  = require('../lib/autoprefixer/rule')
cases = require('./lib/cases')
utils = require('../lib/autoprefixer/utils')

describe 'Rule', ->
  beforeEach ->
    @nodes = cases.load('rule')
    @rule  = new Rule(@nodes.stylesheet.rules[0].declarations)

  describe 'each()', ->

    it 'should iterate declarations', ->
      decls = []
      @rule.each (i) -> decls.push(i.prop + ' ' + i.value)
      decls.should.eql ['color black', 'top 1px', 'left 2px']

    it 'should set declaration prefix', ->
      nodes = cases.load('rule.prefix')
      rule  = new Rule(nodes.stylesheet.rules[0].declarations)

      prefixes = []
      rule.each (i, prefix) -> prefixes.push(prefix)
      prefixes.should.eql [undefined, '-webkit-']

    it 'should set keyframes prefix', ->
      nodes = cases.load('rule.prefix')
      rule  = new Rule(nodes.stylesheet.rules[0].declarations, '-moz-')

      prefixes = []
      rule.each (i, prefix) -> prefixes.push(prefix)
      prefixes.should.eql ['-moz-', '-webkit-']

  describe 'contain()', ->

    it 'should check declarations', ->
      @rule.contain('color').should.be.true
      @rule.contain('position').should.be.false

      @rule.contain('color', 'black').should.be.true
      @rule.contain('color', 'white').should.be.false

  describe 'add()', ->

    it 'should add declaration in interation', ->
      @rule.each (i) => @rule.add(i.number, utils.clone(i.node))
      cases.compare(@nodes, 'rule.double')

  describe 'byProp()', ->

    it 'should return declaration by property', ->
      @rule.byProp('top').value.should.eql '1px'
      (!!@rule.byProp('position')).should.be.false

  describe 'remove()', ->

    it 'should remove declaration in interation', ->
      decls = []

      @rule.each (i) =>
        decls.push(i.prop + ' ' + i.value)
        @rule.remove(i.number) if i.prop == 'top'

      cases.compare(@nodes, 'rule.remove')
      decls.should.eql ['color black', 'top 1px', 'left 2px']

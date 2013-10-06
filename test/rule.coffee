Rule     = require('../lib/autoprefixer/rule')
Rules    = require('../lib/autoprefixer/rules')
Selector = require('../lib/autoprefixer/selector')
utils    = require('../lib/autoprefixer/utils')
cases    = require('./lib/cases')

describe 'Rule', ->
  beforeEach ->
    @nodes = cases.load('rule/rule')
    @rules = new Rules(@nodes.stylesheet.rules)
    @rule  = new Rule(@rules, 0, @nodes.stylesheet.rules[0])

  describe 'prefix', ->

    it 'can be taken from selectors', ->
      nodes = cases.load('rule/selector')
      rules = new Rules(nodes.stylesheet.rules)

      rule = new Rule(rules, 0, nodes.stylesheet.rules[0])
      rule.prefix.should.eql('-ms-')

      rule = new Rule(rules, 1, nodes.stylesheet.rules[1])
      rule.prefix.should.eql('-moz-')

      rule = new Rule(rules, 2, nodes.stylesheet.rules[2])
      rule.prefix.should.eql('-webkit-')

      rule = new Rule(rules, 0, nodes.stylesheet.rules[0], '-o-')
      rule.prefix.should.eql('-o-')

  describe 'each()', ->

    it 'iterates over declarations', ->
      decls = []
      @rule.each (i) -> decls.push(i.prop + ' ' + i.value)
      decls.should.eql ['color black', 'top 1px', 'left 2px']

    it 'sets declaration prefix', ->
      nodes = cases.load('rule/prefix')
      rules = new Rules(nodes.stylesheet)
      rule  = new Rule(rules, 0, nodes.stylesheet.rules[0])

      prefixes = []
      rule.each (i, prefix) -> prefixes.push(prefix)
      prefixes.should.eql [undefined, '-webkit-']

    it 'sets keyframes prefix', ->
      nodes = cases.load('rule/prefix')
      rules = new Rules(nodes.stylesheet)
      rule  = new Rule(rules, 0, nodes.stylesheet.rules[0], '-moz-')

      prefixes = []
      rule.each (i, prefix) -> prefixes.push(prefix)
      prefixes.should.eql ['-moz-', '-webkit-']

  describe 'contain()', ->

    it 'checks declarations', ->
      @rule.contain('color').should.be.true
      @rule.contain('position').should.be.false

      @rule.contain('color', 'black').should.be.true
      @rule.contain('color', 'white').should.be.false

  describe 'add()', ->

    it 'adds declaration in interation', ->
      @rule.each (i) => @rule.add(i.number, utils.clone(i.node))
      cases.compare(@nodes, 'rule/double')

  describe 'byProp()', ->

    it 'returns declaration by its property', ->
      @rule.byProp('top').value.should.eql '1px'
      (!!@rule.byProp('position')).should.be.false

  describe 'removeDecl()', ->

    it 'removes declaration in interation', ->
      decls = []

      @rule.each (i) =>
        decls.push(i.prop + ' ' + i.value)
        @rule.removeDecl(i.number) if i.prop == 'top'

      cases.compare(@nodes, 'rule/remove')
      decls.should.eql ['color black', 'top 1px', 'left 2px']

  describe 'prefixSelector()', ->

    it 'clone itself with prefixed selectors', ->
      selector = new Selector('a', ['-webkit-', '-moz-'])
      @rule.prefixSelector(selector)
      cases.compare(@nodes, 'rule/prefix-selector')

    it "don't clone twice", ->
      selector = new Selector('a', ['-moz-', '-webkit-'])
      @rule.prefixSelector(selector)
      @rule.prefixSelector(selector)
      cases.compare(@nodes, 'rule/prefix-selector')

  describe 'remove()', ->

    it 'removes itself', ->
      @rule.remove()
      @nodes.stylesheet.rules.should.be.empty

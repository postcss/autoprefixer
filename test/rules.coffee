Rules = require('../lib/autoprefixer/rules')
cases = require('./lib/cases')
utils = require('../lib/autoprefixer/utils')

describe 'Rules', ->
  beforeEach ->
    @nodes = cases.load('rules/rules')
    @rules = new Rules(@nodes.stylesheet.rules)

  describe 'each()', ->

    it 'iterates over rules', ->
      list = []
      @rules.each (i) -> list.push [i.type, i.selectors, i.prefix]

      list.should.eql [['keyframe', undefined, '-moz-'],
                       ['rule',    'a',       undefined],
                       ['rule',    'div',     undefined]]

  describe 'contain()', ->

    it 'checks selectors', ->
      @rules.contain('a').should.be.true
      @rules.contain('b, a').should.be.false

  describe 'add()', ->

    it 'adds new rules', ->
      @rules.each (i) =>
        @rules.add(0, utils.clone(i.node)) if i.selectors == 'a'
      cases.compare(@nodes, 'rules/double')

  describe 'remove()', ->

    it 'removes rules', ->
      @rules.each (i) =>
        @rules.remove(i.number) if i.selectors == 'a'
      cases.compare(@nodes, 'rules/remove')

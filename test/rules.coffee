Rules = require('../lib/autoprefixer/rules')
cases = require('./lib/cases')

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

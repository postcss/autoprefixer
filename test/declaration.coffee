Declaration = require('../lib/declaration')
Prefixes    = require('../lib/prefixes')
parse       = require('postcss/lib/parse')

describe 'Declaration', ->
  beforeEach ->
    @prefixes = new Prefixes({ }, { })
    @tabsize  = new Declaration('tab-size', ['-moz-', '-ms-'], @prefixes)

  describe 'otherPrefixes()', ->

    it 'checks values for other prefixes', ->
      @tabsize.otherPrefixes('black', '-moz-').should.be.false
      @tabsize.otherPrefixes('-moz-black', '-moz-').should.be.false
      @tabsize.otherPrefixes('-dev-black', '-moz-').should.be.false
      @tabsize.otherPrefixes('-ms-black',  '-moz-').should.be.true

  describe 'needCascade()', ->
    after -> delete @prefixes.options.cascade

    it 'returns true by default', ->
      css = parse("a {\n  tab-size: 4 }")
      @tabsize.needCascade(css.first.first).should.be.true

    it 'return false is disabled', ->
      @prefixes.options.cascade = false
      css = parse("a {\n  tab-size: 4 }")
      @tabsize.needCascade(css.first.first).should.be.false

    it 'returns false on declarations in one line', ->
      css = parse("a { tab-size: 4 } a {\n  tab-size: 4 }")

      @tabsize.needCascade(css.first.first).should.be.false
      @tabsize.needCascade(css.last.first).should.be.true

  describe 'maxPrefixed()', ->

    it 'returns max prefix length', ->
      decl     = parse('a { tab-size: 4 }').first.first
      prefixes = ['-webkit-', '-webkit- old', '-moz-']
      @tabsize.maxPrefixed(prefixes, decl).should.eql 8

  describe 'calcBefore()', ->

    it 'returns before with cascade', ->
      decl     = parse('a { tab-size: 4 }').first.first
      prefixes = ['-webkit-', '-moz- old', '-moz-']
      @tabsize.calcBefore(prefixes, decl, '-moz- old').should.eql '    '

  describe 'restoreBefore()', ->

    it 'removes cascade', ->
      css  = parse("a {\n  -moz-tab-size: 4;\n       tab-size: 4 }")
      decl = css.first.nodes[1]
      @tabsize.restoreBefore(decl)
      decl.raws.before.should.eql("\n  ")

  describe 'prefixed()', ->

    it 'returns prefixed property', ->
      css  = parse('a { tab-size: 2 }')
      decl = css.first.first
      @tabsize.prefixed(decl.prop, '-moz-').should.eql('-moz-tab-size')

  describe 'normalize()', ->

    it 'returns property name by specification', ->
      @tabsize.normalize('tab-size').should.eql('tab-size')

  describe 'process()', ->

    it 'adds prefixes', ->
      css = parse('a { -moz-tab-size: 2; tab-size: 2 }')
      @tabsize.process(css.first.nodes[1])
      css.toString().should.eql(
        'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }')

    it 'checks parents prefix', ->
      css = parse('::-moz-selection a { tab-size: 2 }')
      @tabsize.process(css.first.first)
      css.toString().should.eql(
        '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }')

    it 'checks value for prefixes', ->
      css = parse('a { tab-size: -ms-calc(2) }')
      @tabsize.process(css.first.first)
      css.toString().should.eql(
        'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }')

  describe 'old()', ->

    it 'returns list of prefixeds', ->
      @tabsize.old('tab-size', '-moz-').should.eql ['-moz-tab-size']

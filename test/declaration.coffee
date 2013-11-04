Declaration = require('../lib/autoprefixer/declaration')
parse       = require('postcss/lib/parse')

describe 'Declaration', ->
  beforeEach ->
    @tabsize = new Declaration('tab-size', ['-moz-', '-ms-'])

  describe 'otherPrefixes()', ->

    it 'checks values for other prefixes', ->
      @tabsize.otherPrefixes('black', '-moz-').should.be.false
      @tabsize.otherPrefixes('-moz-black', '-moz-').should.be.false
      @tabsize.otherPrefixes('-dev-black', '-moz-').should.be.false
      @tabsize.otherPrefixes('-ms-black',  '-moz-').should.be.true

  describe 'prefixed()', ->

    it 'returns prefixed property', ->
      css  = parse('a { tab-size: 2 }')
      decl = css.rules[0].decls[0]
      @tabsize.prefixed(decl.prop, '-moz-').should.eql('-moz-tab-size')

  describe 'normalize()', ->

    it 'returns property name by specification', ->
      @tabsize.normalize('tab-size').should.eql('tab-size')

  describe 'process()', ->

    it 'adds prefixes', ->
      css = parse('a { -moz-tab-size: 2; tab-size: 2 }')
      @tabsize.process(css.rules[0].decls[1])
      css.toString().should.eql(
        'a { -moz-tab-size: 2; -ms-tab-size: 2; tab-size: 2 }')

    it 'checks parents prefix', ->
      css = parse('::-moz-selection a { tab-size: 2 }')
      @tabsize.process(css.rules[0].decls[0])
      css.toString().should.eql(
        '::-moz-selection a { -moz-tab-size: 2; tab-size: 2 }')

    it 'checks value for prefixes', ->
      css = parse('a { tab-size: -ms-calc(2) }')
      @tabsize.process(css.rules[0].decls[0])
      css.toString().should.eql(
        'a { -ms-tab-size: -ms-calc(2); tab-size: -ms-calc(2) }')

  describe 'old()', ->

    it 'returns list of prefixeds', ->
      @tabsize.old('tab-size', '-moz-').should.eql ['-moz-tab-size']

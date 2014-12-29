Selector = require('../lib/selector')
parse    = require('postcss/lib/parse')

describe 'Selector', ->
  beforeEach ->
    @selector = new Selector('::selection', ['-moz-', '-ms-'])

  describe 'prefixed()', ->

    it 'adds prefix after non-letters symbols', ->
      @selector.prefixed('-moz-').should.eql('::-moz-selection')

  describe 'regexp()', ->

    it 'creates regexp for prefix', ->
      regexp = @selector.regexp('-moz-')
      regexp.test('::-moz-selection').should.be.true
      regexp.test('::selection').should.be.false

    it 'creates regexp without prefix', ->
      regexp = @selector.regexp()
      regexp.test('::-moz-selection').should.be.false
      regexp.test('::selection').should.be.true

  describe 'check()', ->

    it 'shecks rule selectors', ->
      css = parse('body .selection {}, :::selection {}, body ::selection {}')
      @selector.check(css.nodes[0]).should.be.false
      @selector.check(css.nodes[1]).should.be.false
      @selector.check(css.nodes[2]).should.be.true

  describe 'prefixeds()', ->

    it 'returns all avaiable prefixed selectors', ->
      css = parse('::selection {}')
      @selector.prefixeds(css.first).should.eql(
        '-webkit-': '::-webkit-selection'
        '-moz-':    '::-moz-selection'
        '-ms-':     '::-ms-selection'
        '-o-':      '::-o-selection')

  describe 'already()', ->
    beforeEach ->
      css        = parse('::selection {}')
      @prefixeds = @selector.prefixeds(css.first)

    it 'returns false on first element', ->
      css = parse('::selection {}')
      @selector.already(css.first, @prefixeds, '-moz-').should.be.false

    it 'stops on another type', ->
      css = parse('::-moz-selection {} @keyframes anim {} ::selection {}')
      @selector.already(css.nodes[2], @prefixeds, '-moz-').should.be.false

    it 'stops on another selector', ->
      css = parse('::-moz-selection {} a {} ::selection {}')
      @selector.already(css.nodes[2], @prefixeds, '-moz-').should.be.false

    it 'finds prefixed even if unknown prefix is between', ->
      css = parse('::-moz-selection {} ::-o-selection {} ::selection {}')
      @selector.already(css.nodes[2], @prefixeds, '-moz-').should.be.true

  describe 'replace()', ->

    it 'should add prefix to selectors', ->
      @selector.replace('body ::selection, input::selection, a', '-ms-').
        should.eql('body ::-ms-selection, input::-ms-selection, a')

  describe 'process()', ->

    it 'adds prefixes', ->
      css = parse('b ::-moz-selection{} b ::selection{}')
      @selector.process(css.nodes[1])
      css.toString().should.eql(
        'b ::-moz-selection{} b ::-ms-selection{} b ::selection{}')

    it 'checks parents prefix', ->
      css = parse('@-moz-page{ ::selection{} }')
      @selector.process(css.first.first)
      css.toString().should.eql(
        '@-moz-page{ ::-moz-selection{} ::selection{} }')

  describe 'old()', ->

    it 'returns object to find old selector', ->
      old = @selector.old('-moz-')
      old.unprefixed.should.eql '::selection'
      old.prefix.should.eql     '-moz-'

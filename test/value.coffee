OldValue = require('../lib/old-value')
Value    = require('../lib//value')
parse    = require('postcss/lib/parse')

Prefixes = require('../lib/prefixes')
prefixes = new Prefixes()

describe 'Value', ->

  beforeEach ->
    @calc = new Value('calc', ['-moz-', '-ms-'])

  describe '.save()', ->

    it 'clones declaration', ->
      css   = parse('a { prop: v }')
      width = css.first.first

      width._autoprefixerValues = { '-ms-': '-ms-v' }
      Value.save(prefixes, width)

      css.toString().should.eql('a { prop: -ms-v; prop: v }')

    it 'updates declaration with prefix', ->
      css   = parse('a { -ms-prop: v }')
      width = css.first.first

      width._autoprefixerValues = { '-ms-': '-ms-v' }
      Value.save(prefixes, width)

      css.toString().should.eql('a { -ms-prop: -ms-v }')

    it 'ignores on another prefix property', ->
      css   = parse('a { -ms-prop: v; prop: v }')
      width = css.first.last

      width._autoprefixerValues = { '-ms-': '-ms-v' }
      Value.save(prefixes, width)

      css.toString().should.eql('a { -ms-prop: v; prop: v }')

    it 'ignores prefixes without changes', ->
      css   = parse('a { prop: v }')
      width = css.first.first

      width._autoprefixerValues = { '-ms-': 'v' }
      Value.save(prefixes, width)

      css.toString().should.eql('a { prop: v }')

  describe 'check()', ->

    it 'checks value in string', ->
      css = parse('a { 0: calc(1px + 1em); ' +
                      '1: 1px calc(1px + 1em); ' +
                      '2: (calc(1px + 1em)); ' +
                      '3: -ms-calc; ' +
                      '4: calced; }')

      @calc.check(css.first.nodes[0]).should.be.true
      @calc.check(css.first.nodes[1]).should.be.true
      @calc.check(css.first.nodes[2]).should.be.true

      @calc.check(css.first.nodes[3]).should.be.false
      @calc.check(css.first.nodes[4]).should.be.false

  describe 'old()', ->

    it 'check prefixed value', ->
      @calc.old('-ms-').should.eql new OldValue('calc', '-ms-calc')

  describe 'replace()', ->

    it 'adds prefix to value', ->
      @calc.replace('1px calc(1em)', '-ms-').should.eql('1px -ms-calc(1em)')
      @calc.replace('1px,calc(1em)', '-ms-').should.eql('1px,-ms-calc(1em)')

  describe 'process()', ->

    it 'adds prefixes', ->
      css   = parse('a { width: calc(1em) calc(1%) }')
      width = css.first.first

      @calc.process(width)
      width._autoprefixerValues.should.eql
        '-moz-': '-moz-calc(1em) -moz-calc(1%)'
        '-ms-':   '-ms-calc(1em) -ms-calc(1%)'

    it 'checks parents prefix', ->
      css   = parse('::-moz-fullscreen a { width: calc(1%) }')
      width = css.first.first

      @calc.process(width)
      width._autoprefixerValues.should.eql
        '-moz-': '-moz-calc(1%)'

    it 'checks property prefix', ->
      css   = parse('a { -moz-width: calc(1%); -o-width: calc(1%) }')
      decls = css.first.nodes

      @calc.process(decls[0])
      decls[0]._autoprefixerValues.should.eql
        '-moz-': '-moz-calc(1%)'

      @calc.process(decls[1])
      (decls[1]._autoprefixerValues == undefined).should.be.true

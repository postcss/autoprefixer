Prefixer = require('../lib/prefixer')
parse    = require('postcss/lib/parse')

describe 'Prefixer', ->
  beforeEach ->
    @prefix = new Prefixer()
    @css = parse('@-ms-keyframes a { to { } } ' +
                 ':-moz-full-screen { } a { } ' +
                 '@-dev-keyframes s { to { } }')

  describe '.hack()', ->

    it 'registers hacks for subclasses', ->
      class A extends Prefixer

      class Hack extends A
        @names = ['a', 'b']
      A.hack(Hack)

      A.hacks.should.eql { a: Hack, b: Hack }
      (Prefixer.hacks == undefined).should.be.true

  describe '.load()', ->

    it 'loads hacks', ->
      class A extends Prefixer
        klass: 'a'
      class Hack extends A
        klass: 'hack'
      A.hacks = { hacked: Hack }

      A.load('hacked').klass.should.eql('hack')
      A.load('a').klass.should.eql('a')

  describe '.clone()', ->

    it 'cleans custom properties', ->
      rule = @css.first.first
      rule._autoprefixerPrefix = '-ms-'
      rule._autoprefixerValues = { '-ms-': 1 }

      cloned = Prefixer.clone(rule, selector: 'from')
      cloned.selector.should.eql('from')

      (cloned._autoprefixerPrefix == undefined).should.be.true
      (cloned._autoprefixerValues == undefined).should.be.true

    it 'fixed declaration between', ->
      css = parse('a { color : black }')
      cloned = Prefixer.clone(css.first.first)
      cloned.raws.between.should.eql(' : ')

  describe 'parentPrefix', ->

    it 'works with root node', ->
      @prefix.parentPrefix(@css).should.be.false

    it 'finds in at-rules', ->
      @prefix.parentPrefix(@css.first).should.eql('-ms-')

    it 'finds in selectors', ->
      @prefix.parentPrefix(@css.nodes[1]).should.eql('-moz-')

    it 'finds in parents', ->
      @prefix.parentPrefix(@css.first.first).should.eql('-ms-')
      @prefix.parentPrefix(@css.nodes[2]).should.be.false

    it 'caches prefix', ->
      @prefix.parentPrefix(@css.first)
      @css.first._autoprefixerPrefix.should.eql('-ms-')

      @css.first._autoprefixerPrefix = false
      @prefix.parentPrefix(@css.first).should.be.false

    it 'finds only browsers prefixes', ->
      @prefix.parentPrefix(@css.nodes[2]).should.be.false

    it 'works with selector contained --', ->
      css = parse(':--a { color: black }')
      @prefix.parentPrefix(css.first.first).should.be.false

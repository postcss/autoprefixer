Prefixer = require('../lib/autoprefixer/prefixer')
parse    = require('postcss/lib/parse')

describe 'Prefixer', ->
  beforeEach ->
    @prefix = new Prefixer()
    @css = parse('@-ms-keyframes a { to { } } ' +
                 ':-moz-full-screen { } a { } ' +
                 '@-dev-keyframes s { to { } }')

  describe '.clone()', ->

    it 'cleans custom properties', ->
      rule = @css.rules[0].rules[0]
      rule._autoprefixerPrefix = '-ms-'
      rule._autoprefixerValues = { '-ms-': 1 }

      cloned = Prefixer.clone(rule, selector: 'from')
      cloned.selector.should.eql('from')

      (cloned._autoprefixerPrefix == undefined).should.be.true
      (cloned._autoprefixerValues == undefined).should.be.true

  describe 'parentPrefix', ->

    it 'works with root node', ->
      @prefix.parentPrefix(@css).should.be.false

    it 'finds in at-rules', ->
      @prefix.parentPrefix(@css.rules[0]).should.eql('-ms-')

    it 'finds in selectors', ->
      @prefix.parentPrefix(@css.rules[1]).should.eql('-moz-')

    it 'finds in parents', ->
      @prefix.parentPrefix(@css.rules[0].rules[0]).should.eql('-ms-')
      @prefix.parentPrefix(@css.rules[2]).should.be.false

    it 'caches prefix', ->
      @prefix.parentPrefix(@css.rules[0])
      @css.rules[0]._autoprefixerPrefix.should.eql('-ms-')

      @css.rules[0]._autoprefixerPrefix = false
      @prefix.parentPrefix(@css.rules[0]).should.be.false

    it 'finds only browsers prefixes', ->
      @prefix.parentPrefix(@css.rules[2]).should.be.false

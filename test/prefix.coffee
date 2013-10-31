Prefix = require('../lib/autoprefixer/prefix')
parse  = require('postcss/lib/postcss/parse')

describe 'Prefix', ->

  describe 'parentPrefix', ->

    beforeEach ->
      @prefix = new Prefix()
      @css = parse('@-ms-keyframes a { to { } } :-moz-full-screen { } a { }')

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

      @css.rules[0]._autoprefixerPrefix = '-webkit-'
      @prefix.parentPrefix(@css.rules[0]).should.eql('-webkit-')

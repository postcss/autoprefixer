KeyframesPrefix = require('../lib/autoprefixer/keyframes_prefix')
parse           = require('postcss/lib/parse')

describe 'KeyframesPrefix', ->
  beforeEach ->
    @keyframes = new KeyframesPrefix('@keyframes', ['-moz-', '-ms-'])

  describe 'check()', ->

    it 'returns true only for @keyframes', ->
      css = parse('@page {} @-ms-keyframes a {} @keyframes a {}')

      @keyframes.check(css.rules[0]).should.be.false
      @keyframes.check(css.rules[1]).should.be.false
      @keyframes.check(css.rules[2]).should.be.true

  describe 'process()', ->

    it 'adds prefixes', ->
      css = parse('@-moz-keyframes b {} @-ms-keyframes a {} @keyframes a {}')
      @keyframes.process(css.rules[2])
      css.toString().should.eql('@-moz-keyframes b {} ' +
                                '@-ms-keyframes a {} ' +
                                '@-moz-keyframes a {} ' +
                                '@keyframes a {}')

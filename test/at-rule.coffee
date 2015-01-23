AtRule = require('../lib/at-rule')
parse  = require('postcss/lib/parse')

describe 'AtRule', ->
  describe 'process()', ->

    it 'adds prefixes', ->
      keyframes = new AtRule('@keyframes', ['-moz-', '-ms-'])

      css = parse('@-moz-keyframes b {} @-ms-keyframes a {} @keyframes a {}')
      keyframes.process(css.last)
      css.toString().should.eql('@-moz-keyframes b {} ' +
                                '@-ms-keyframes a {} ' +
                                '@-moz-keyframes a {} ' +
                                '@keyframes a {}')

KeyframesPrefix = require('../lib/autoprefixer/keyframes_prefix')
parse = require('postcss/lib/postcss/parse')

describe 'KeyframesPrefix', ->

  describe 'add()', ->

    it 'adds prefixes', ->
      css    = parse('@-moz-keyframes b {} @-ms-keyframes a {} @keyframes a {}')
      prefix = new KeyframesPrefix('@keyframes', ['-moz-', '-ms-'])

      prefix.add(css.rules[2])
      css.toString().should.eql('@-moz-keyframes b {} ' +
        '@-ms-keyframes a {} @-moz-keyframes a {} @keyframes a {}')

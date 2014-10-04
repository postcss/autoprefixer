Keyframes = require('../lib/keyframes')
parse     = require('postcss/lib/parse')

describe 'Keyframes', ->
  describe 'process()', ->

    it 'adds prefixes', ->
      keyframes = new Keyframes('@keyframes', ['-moz-', '-ms-'])

      css = parse('@-moz-keyframes b {} @-ms-keyframes a {} @keyframes a {}')
      keyframes.process(css.childs[2])
      css.toString().should.eql('@-moz-keyframes b {} ' +
                                '@-ms-keyframes a {} ' +
                                '@-moz-keyframes a {} ' +
                                '@keyframes a {}')

Selector = require('../lib/autoprefixer/selector')

describe 'Selector', ->
  describe 'prefixed()', ->

    it 'adds prefix after non-letters symbols', ->
      s = new Selector('::selection')
      s.prefixed('-moz-').should.eql('::-moz-selection')

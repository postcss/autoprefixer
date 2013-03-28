utils = require('../lib/autoprefixer/utils')

describe 'utils', ->
  describe '.uniq()', ->
    it 'should filter array', ->
      utils.uniq([1, 2, 3, 3, 1]).should.eql([1, 2, 3])

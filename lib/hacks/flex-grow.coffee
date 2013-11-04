flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class Flex extends Declaration
  @names = ['flex-grow']

  # Return flex property for 2009 and 2012 specs
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      prefix + 'box-flex'
    else if spec == 2012
      prefix + 'flex'
    else
      super

module.exports = Flex

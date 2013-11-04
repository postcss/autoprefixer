flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class Flex extends Declaration
  @names = ['flex-grow']

  # Use flex property for 2009 and 2012 specs
  set: (decl, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      decl.prop = prefix + 'box-flex'
      decl
    else if spec == 2012
      decl.prop = prefix + 'flex'
      decl
    else if spec == 'final'
      super

module.exports = Flex

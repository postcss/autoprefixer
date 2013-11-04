flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class FlexBasis extends Declaration
  @names = ['flex-basis']

  # Ignore 2009 spec and use flex property for 2012
  set: (decl, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      decl.prop  = prefix + 'flex'
      decl.value = '0 1 ' + decl.value
      decl
    else if spec == 'final'
      super

module.exports = FlexBasis

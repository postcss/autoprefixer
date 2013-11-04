flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class FlexShrink extends Declaration
  @names = ['flex-shrink']

  # Return flex property for 2012 spec
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      prefix + 'flex'
    else
      super

  # Ignore 2009 spec and use flex property for 2012
  set: (decl, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      decl.prop  = prefix + 'flex'
      decl.value = '0 ' + decl.value
      decl
    else if spec == 'final'
      super

module.exports = FlexShrink

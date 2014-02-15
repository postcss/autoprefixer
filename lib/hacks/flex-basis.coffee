flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class FlexBasis extends Declaration
  @names = ['flex-basis', 'flex-preferred-size']

  # Return property name by final spec
  normalize: ->
    'flex-basis'

  # Return flex property for 2012 spec
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      prefix + 'flex-preferred-size'
    else
      super

  # Ignore 2009 spec and use flex property for 2012
  set: (decl, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012 or spec == 'final'
      super

module.exports = FlexBasis

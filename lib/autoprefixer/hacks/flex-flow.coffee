flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class FlexFlow extends Declaration
  @names = ['flex-flow']

  # Don't add prefix for 2009 spec
  set: (decl, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      super
    else if spec == 'final'
      super

module.exports = FlexFlow

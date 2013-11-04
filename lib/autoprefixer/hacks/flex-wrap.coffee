flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class FlexWrap extends Declaration
  @names = ['flex-wrap']

  # Don't add prefix for 2009 spec
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec != 2009
      super

module.exports = FlexWrap

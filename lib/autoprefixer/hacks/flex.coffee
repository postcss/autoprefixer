flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class Flex extends Declaration
  @names = ['flex', 'box-flex']

  # Change property name for 2009 spec
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      prefix + 'box-flex'
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    'flex'

  # Spec 2009 supports only first argument
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2009
      decl.value = decl.value.split(' ')[0]
      super(decl, prefix)
    else
      super

module.exports = Flex

flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

list = require('postcss/lib/list')

class Flex extends Declaration
  @names = ['flex', 'box-flex']

  @oldValues =
    'auto': '1'
    'none': '0'

  # Change property name for 2009 spec
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      prefix + 'box-flex'
    else
      super

  # Return property name by final spec
  normalize: ->
    'flex'

  # Spec 2009 supports only first argument
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2009
      decl.value = list.space(decl.value)[0]
      decl.value = Flex.oldValues[decl.value] || decl.value
      super(decl, prefix)
    else
      super

module.exports = Flex

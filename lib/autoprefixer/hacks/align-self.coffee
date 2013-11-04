flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class AlignSelf extends Declaration
  @names = ['align-self', 'flex-item-align']

  @oldValues =
    'flex-end':   'end'
    'flex-start': 'start'

  # Change property name for 2012 specs
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2012
      prefix + 'flex-item-align'
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    'align-self'

  # Change value for 2012 spec and ignore prefix for 2009
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2012
      decl.value = AlignSelf.oldValues[decl.value] || decl.value
      super(decl, prefix)
    else if spec == 'final'
      super

module.exports = AlignSelf

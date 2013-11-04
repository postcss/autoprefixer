flexSpec    = require('./flex-spec')
Declaration = require('../declaration')

class AlignItems extends Declaration
  @names = ['align-items', 'flex-align', 'box-align']

  @oldValues =
    'flex-end':   'end'
    'flex-start': 'start'

  # Change property name for 2009 and 2012 specs
  prefixed: (prop, prefix) ->
    [spec, prefix] = flexSpec(prefix)
    if spec == 2009
      prefix + 'box-align'
    else if spec == 2012
      prefix + 'flex-align'
    else
      super

  # Return property name by final spec
  normalize: (prop) ->
    'align-items'

  # Change value for 2009 and 2012 specs
  set: (decl, prefix) ->
    spec = flexSpec(prefix)[0]
    if spec == 2009 or spec == 2012
      decl.value = AlignItems.oldValues[decl.value] || decl.value
      super(decl, prefix)
    else
      super

module.exports = AlignItems
